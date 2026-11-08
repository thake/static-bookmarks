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

export function extractIconHrefsFromHtml(html: string): string[] {
  const linkRegex = /<link\b[^>]*>/gi;
  const relRegex = /\brel=(?:["'][^"']*\b(?:icon|apple-touch-icon)\b[^"']*["']|(?:icon|apple-touch-icon)\b)/i;
  const hrefRegex = /\bhref=(?:["']([^"']+)["']|([^\s>]+))/i;

  const candidates: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    const linkTag = match[0];
    if (relRegex.test(linkTag)) {
      const hrefMatch = hrefRegex.exec(linkTag);
      const href = hrefMatch ? (hrefMatch[1] || hrefMatch[2])?.trim() : null;
      if (href && !candidates.includes(href)) {
        candidates.push(href);
      }
    }
  }
  return candidates;
}

export function extractIconHrefFromHtml(html: string): string | null {
  const candidates = extractIconHrefsFromHtml(html);
  return candidates.length > 0 ? candidates[0] : null;
}

export async function fetchWithTimeout(url: string, timeoutMs = 4000): Promise<Response> {
  return fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
}

export async function downloadIconForUrl(pageUrl: string): Promise<DownloadedIcon | null> {
  const parsed = new URL(pageUrl);

  async function tryHtmlPage(url: string): Promise<DownloadedIcon | null> {
    try {
      const pageRes = await fetchWithTimeout(url, 4000);
      if (pageRes.ok) {
        const html = await pageRes.text();
        const hrefs = extractIconHrefsFromHtml(html);
        for (const href of hrefs) {
          try {
            const fullIconUrl = new URL(href, url).href;
            const iconRes = await fetchWithTimeout(fullIconUrl, 4000);
            if (iconRes.ok) {
              const buffer = Buffer.from(await iconRes.arrayBuffer());
              if (buffer.length > 50) {
                const ext = detectExtension(iconRes.headers.get('content-type'), buffer);
                return { buffer, ext };
              }
            }
          } catch {
            // Continue to next candidate
          }
        }
      }
    } catch {
      // Failed fetching HTML
    }
    return null;
  }

  // 1. Try finding favicon from the bookmark page itself
  const pageResult = await tryHtmlPage(pageUrl);
  if (pageResult) {
    return pageResult;
  }

  // 2. If this was a subpage, try the origin home page (e.g. https://domain.com/)
  // This ensures icons are found even when the root domain is NOT in the bookmarks!
  if (parsed.pathname !== '/' && parsed.pathname !== '') {
    const originHomeUrl = `${parsed.origin}/`;
    const originResult = await tryHtmlPage(originHomeUrl);
    if (originResult) {
      return originResult;
    }
  }

  // 3. Fallback to ${origin}/favicon.ico
  try {
    const fallbackUrl = `${parsed.origin}/favicon.ico`;
    const iconRes = await fetchWithTimeout(fallbackUrl, 4000);
    if (iconRes.ok) {
      const buffer = Buffer.from(await iconRes.arrayBuffer());
      if (buffer.length > 50) {
        const ext = detectExtension(iconRes.headers.get('content-type'), buffer);
        return { buffer, ext };
      }
    }
  } catch {
    // Fallback failed
  }

  // 4. Fallback to root domain if it's a subdomain (e.g. dev.mysql.com -> mysql.com)
  const parts = parsed.hostname.split('.');
  if (parts.length > 2) {
    const rootDomain = parts.slice(-2).join('.');
    const rootHomeUrl = `${parsed.protocol}//${rootDomain}/`;
    const rootResult = await tryHtmlPage(rootHomeUrl);
    if (rootResult) {
      return rootResult;
    }

    try {
      const rootFaviconUrl = `${parsed.protocol}//${rootDomain}/favicon.ico`;
      const rootRes = await fetchWithTimeout(rootFaviconUrl, 4000);
      if (rootRes.ok) {
        const buffer = Buffer.from(await rootRes.arrayBuffer());
        if (buffer.length > 50) {
          const ext = detectExtension(rootRes.headers.get('content-type'), buffer);
          return { buffer, ext };
        }
      }
    } catch {
      // Root domain fallback failed
    }
  }

  // 5. Fallback to public icon service (for Cloudflare-protected sites like npm, dribbble)
  try {
    const ddgUrl = `https://icons.duckduckgo.com/ip3/${parsed.hostname}.ico`;
    const ddgRes = await fetchWithTimeout(ddgUrl, 4000);
    if (ddgRes.ok) {
      const buffer = Buffer.from(await ddgRes.arrayBuffer());
      // DuckDuckGo returns a 1478 byte generic placeholder if not found
      if (buffer.length > 50 && buffer.length !== 1478) {
        const ext = detectExtension(ddgRes.headers.get('content-type'), buffer);
        return { buffer, ext };
      }
    }
  } catch {
    // Icon service fallback failed
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

  const CONCURRENCY = 10;
  const queue = [...urls];
  const workers = Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;

      // Check if already in manifest and file physically exists
      const existingPath = existingManifest[url];
      if (existingPath) {
        const existingFilename = path.basename(existingPath);
        if (diskFiles.has(existingFilename)) {
          manifest[url] = existingPath;
          continue;
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
    }
  });

  await Promise.all(workers);

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
