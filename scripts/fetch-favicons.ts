import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export type FaviconExtension = 'svg' | 'png' | 'ico' | 'webp';

export interface DownloadedIcon {
  buffer: Buffer;
  ext: FaviconExtension;
}

export interface RunOptions {
  bookmarksFile?: string;
  faviconsDir?: string;
  manifestFile?: string;
}

export interface RunResult {
  manifest: Record<string, string>;
  deleted: string[];
}

const BOOKMARKS_FILE = path.resolve('public/bookmarks.json');
const FAVICONS_DIR = path.resolve('public/favicons');
const MANIFEST_FILE = path.resolve('public/favicons.json');

export function detectExtension(contentType: string | null | undefined, buffer: Buffer): FaviconExtension {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('svg') || buffer.slice(0, 2048).toString('utf-8').includes('<svg')) {
    return 'svg';
  }
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'png';
  }
  if (buffer.length >= 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) {
    return 'ico';
  }
  if (buffer.length >= 12 && buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP') {
    return 'webp';
  }
  return 'ico';
}

export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12);
}

export function extractIconHrefFromHtml(html: string): string | null {
  const linkRegex = /<link\b[^>]*>/gi;
  const relRegex = /\brel=["'][^"']*\b(?:icon|apple-touch-icon)\b[^"']*["']/i;
  const hrefRegex = /\bhref=(?:["']([^"']+)["']|([^\s>]+))/i;

  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    const linkTag = match[0];
    if (relRegex.test(linkTag)) {
      const hrefMatch = hrefRegex.exec(linkTag);
      const href = hrefMatch ? (hrefMatch[1] || hrefMatch[2])?.trim() : null;
      if (href) {
        return href;
      }
    }
  }
  return null;
}

export async function fetchWithTimeout(url: string, timeoutMs = 3000): Promise<Response> {
  return fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; StaticBookmarks/1.0)',
    },
  });
}

export async function downloadIconForUrl(pageUrl: string): Promise<DownloadedIcon | null> {
  const parsed = new URL(pageUrl);

  // 1. Try finding favicon from page HTML
  try {
    const pageRes = await fetchWithTimeout(pageUrl, 3000);
    if (pageRes.ok) {
      const html = await pageRes.text();
      const href = extractIconHrefFromHtml(html);
      if (href) {
        const fullIconUrl = new URL(href, pageUrl).href;
        const iconRes = await fetchWithTimeout(fullIconUrl, 3000);
        if (iconRes.ok) {
          const buffer = Buffer.from(await iconRes.arrayBuffer());
          if (buffer.length > 0) {
            const ext = detectExtension(iconRes.headers.get('content-type'), buffer);
            return { buffer, ext };
          }
        }
      }
    }
  } catch {
    // HTML parse or icon fetch failed, continue to fallback
  }

  // 2. Fallback to ${origin}/favicon.ico
  try {
    const fallbackUrl = `${parsed.origin}/favicon.ico`;
    const iconRes = await fetchWithTimeout(fallbackUrl, 3000);
    if (iconRes.ok) {
      const buffer = Buffer.from(await iconRes.arrayBuffer());
      if (buffer.length > 0) {
        const ext = detectExtension(iconRes.headers.get('content-type'), buffer);
        return { buffer, ext };
      }
    }
  } catch {
    // Fallback failed
  }

  return null;
}

export async function pruneOrphanFavicons(
  faviconsDir: string,
  activeManifest: Record<string, string>
): Promise<string[]> {
  const activeFilenames = new Set(
    Object.values(activeManifest).map((filepath) => path.basename(filepath))
  );

  let diskFiles: string[] = [];
  try {
    diskFiles = await fs.readdir(faviconsDir);
  } catch {
    return [];
  }

  const deletedFiles: string[] = [];
  for (const file of diskFiles) {
    if (!activeFilenames.has(file)) {
      await fs.unlink(path.join(faviconsDir, file));
      deletedFiles.push(file);
      console.log(`[favicons] 🗑 Gelöscht (nicht mehr referenziert): ${file}`);
    }
  }

  return deletedFiles;
}

export async function run(options: RunOptions = {}): Promise<RunResult> {
  const bookmarksFile = options.bookmarksFile || BOOKMARKS_FILE;
  const faviconsDir = options.faviconsDir || FAVICONS_DIR;
  const manifestFile = options.manifestFile || MANIFEST_FILE;

  await fs.mkdir(faviconsDir, { recursive: true });

  const raw = await fs.readFile(bookmarksFile, 'utf-8');
  const data: Record<string, Array<{ url: string }>> = JSON.parse(raw);

  const urls = Array.from(
    new Set(
      Object.values(data).flatMap((category) =>
        (category || []).map((b) => b.url)
      )
    )
  );

  console.log(`[favicons] Ermittle Favicons für ${urls.length} URLs...`);

  // Load existing manifest if present to preserve cache
  let existingManifest: Record<string, string> = {};
  try {
    existingManifest = JSON.parse(await fs.readFile(manifestFile, 'utf-8'));
  } catch {
    existingManifest = {};
  }

  const manifest: Record<string, string> = {};
  const diskFiles = new Set(await fs.readdir(faviconsDir));
  const writtenHashes = new Set<string>();

  await Promise.all(
    urls.map(async (url) => {
      // Check if already in manifest and file physically exists
      const existingPath = existingManifest[url];
      if (existingPath) {
        const existingFilename = path.basename(existingPath);
        if (diskFiles.has(existingFilename)) {
          manifest[url] = existingPath;
          return;
        }
      }

      // Download icon
      const result = await downloadIconForUrl(url);
      if (result) {
        const hash = hashBuffer(result.buffer);
        const filename = `${hash}.${result.ext}`;
        const filePath = path.join(faviconsDir, filename);

        if (!diskFiles.has(filename) && !writtenHashes.has(filename)) {
          writtenHashes.add(filename);
          await fs.writeFile(filePath, result.buffer);
          diskFiles.add(filename);
          console.log(`[favicons] ✓ Gespeichert (${result.ext}): ${filename}`);
        } else {
          console.log(`[favicons] ⟳ Dedupliziert: ${filename} für ${url}`);
        }

        manifest[url] = `favicons/${filename}`;
      } else {
        console.log(`[favicons] ✕ Kein Favicon gefunden für: ${url}`);
      }
    })
  );

  // Sort manifest keys for clean git diffs
  const sortedManifest: Record<string, string> = {};
  for (const key of Object.keys(manifest).sort()) {
    sortedManifest[key] = manifest[key];
  }

  await fs.writeFile(manifestFile, JSON.stringify(sortedManifest, null, 2) + '\n');
  console.log(`[favicons] Manifest geschrieben: ${manifestFile} (${Object.keys(sortedManifest).length} Einträge)`);

  // Prune any orphan favicons on disk that are no longer referenced in the manifest
  const deleted = await pruneOrphanFavicons(faviconsDir, sortedManifest);
  if (deleted.length > 0) {
    console.log(`[favicons] ${deleted.length} verwaiste Datei(en) aufgeräumt.`);
  }

  return { manifest: sortedManifest, deleted };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((err: unknown) => {
    console.error('[favicons] Fehler:', err);
    process.exit(0);
  });
}
