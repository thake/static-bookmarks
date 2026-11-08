import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- Types & Defaults ---
export type LinkStatus = 'ALIVE' | 'AUTH_REQUIRED' | 'DEAD' | 'RATE_LIMITED' | 'SERVER_ERROR' | 'TIMEOUT' | 'UNKNOWN_ERROR';
export interface LinkCheckResult { url: string; status: LinkStatus; httpStatus?: number; message?: string; durationMs: number; authRequired: boolean; isDead: boolean; isWafChallenge?: boolean; }
export interface CheckSummary { total: number; alive: number; authRequired: number; dead: number; timeouts: number; serverErrors: number; rateLimited: number; unknownErrors: number; passed: boolean; results: LinkCheckResult[]; }
export interface CheckOptions { bookmarksFile?: string; urls?: string[]; concurrency?: number; timeoutMs?: number; failOnAuth?: boolean; reportFile?: string; quiet?: boolean; verbose?: boolean; headers?: Record<string, string>; authTokensByHost?: Record<string, string>; fetchFn?: typeof fetch; }

export const DEFAULT_BOOKMARKS_FILE = path.resolve('public/bookmarks.json');
export const DEFAULT_TIMEOUT_MS = 8000;
export const DEFAULT_CONCURRENCY = 10;
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// --- Helpers ---
export async function safelyCancelBody(res?: Response | null): Promise<void> {
  try { if (res?.body && !res.bodyUsed) await res.body.cancel(); } catch { /* ignore */ }
}

export async function loadBookmarkUrls(filePath: string): Promise<string[]> {
  const data: Record<string, Array<{ url: string }>> = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  return Array.from(new Set(Object.values(data).flatMap((cat) => (cat || []).map((b) => b.url))));
}

export async function mapConcurrent<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>, onProgress?: (res: R, done: number, total: number) => void): Promise<R[]> {
  const limit = Math.max(1, Number.isFinite(concurrency) && concurrency > 0 ? Math.floor(concurrency) : DEFAULT_CONCURRENCY);
  const queue = [...items];
  const results: R[] = [];
  let done = 0;
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item === undefined) break;
      const res = await fn(item);
      results.push(res);
      onProgress?.(res, ++done, items.length);
    }
  });
  await Promise.all(workers);
  return results;
}

// --- Single Link Checker ---
export async function checkUrl(url: string, opts: { timeoutMs?: number; headers?: Record<string, string>; authTokensByHost?: Record<string, string>; fetchFn?: typeof fetch } = {}): Promise<LinkCheckResult> {
  const start = Date.now();
  const fetcher = opts.fetchFn || globalThis.fetch;
  const timeoutMs = Number.isFinite(opts.timeoutMs) && (opts.timeoutMs ?? 0) > 0 ? (opts.timeoutMs as number) : DEFAULT_TIMEOUT_MS;

  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return { url, status: 'DEAD', message: `Unsupported protocol: ${parsed.protocol}`, durationMs: Date.now() - start, authRequired: false, isDead: true };
  } catch {
    return { url, status: 'DEAD', message: 'Invalid URL format', durationMs: Date.now() - start, authRequired: false, isDead: true };
  }

  const reqHeaders: Record<string, string> = { ...DEFAULT_HEADERS, ...(opts.headers || {}) };
  if (opts.authTokensByHost?.[parsed.hostname]) {
    const token = opts.authTokensByHost[parsed.hostname];
    reqHeaders['Authorization'] = token.startsWith('Bearer ') || token.startsWith('Basic ') ? token : `Bearer ${token}`;
  }

  const makeReq = async (method: 'HEAD' | 'GET', extra: Record<string, string> = {}, headers = reqHeaders) =>
    fetcher(url, { method, headers: { ...headers, ...extra }, signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });

  try {
    let res: Response;
    try {
      res = await makeReq('HEAD');
      await safelyCancelBody(res);
    } catch (err: unknown) {
      const e = err as Error & { code?: string; cause?: Error & { code?: string } };
      const code = e.code || e.cause?.code || '';
      if (code === 'ECONNRESET' || code === 'UND_ERR_SOCKET' || code === 'EPIPE' || e.message.includes('socket hang up') || e.message.includes('other side closed')) {
        res = await makeReq('GET', { Range: 'bytes=0-1024' });
        await safelyCancelBody(res);
      } else throw err;
    }

    // Servers that reject HEAD or return non-2xx (like Kaggle 404 or npm 403): fallback to GET
    if (res.status >= 400 || res.status === 405) {
      try {
        const getRes = await makeReq('GET', { Range: 'bytes=0-1024' });
        await safelyCancelBody(getRes);
        if (getRes.status >= 200 && getRes.status < 400) {
          return { url, status: 'ALIVE', httpStatus: getRes.status, message: `OK via GET (HEAD returned ${res.status})`, durationMs: Date.now() - start, authRequired: false, isDead: false };
        }
        res = getRes;
      } catch { /* keep original */ }
    }

    // Some sites (Unsplash, Baeldung) block spoofed Chrome UA: retry GET with clean headers
    if (res.status === 401 || res.status === 403) {
      try {
        const cleanRes = await makeReq('GET', { Range: 'bytes=0-1024' }, opts.headers || {});
        await safelyCancelBody(cleanRes);
        if (cleanRes.status >= 200 && cleanRes.status < 400) {
          return { url, status: 'ALIVE', httpStatus: cleanRes.status, message: 'OK via clean GET', durationMs: Date.now() - start, authRequired: false, isDead: false };
        }
        res = cleanRes;
      } catch { /* keep original */ }
    }

    const durationMs = Date.now() - start;
    const s = res.status;
    if (s >= 200 && s < 400) return { url, status: 'ALIVE', httpStatus: s, durationMs, authRequired: false, isDead: false };

    // Gracefully handle 401/403: distinguish anti-bot challenges (Cloudflare, Akamai) from real auth
    if (s === 401 || s === 403 || s === 407) {
      const server = (res.headers.get('server') || '').toLowerCase();
      const isWaf = res.headers.get('cf-mitigated') === 'challenge' || server.includes('cloudflare') || res.headers.has('cf-ray') || server.includes('akamai');
      const msg = isWaf ? 'Anti-bot / WAF challenge (Cloudflare/Akamai - server alive, browser accessible)' : `Authorization required: ${s === 401 ? 'Unauthorized (401)' : 'Forbidden (403)'} (server alive)`;
      return { url, status: 'AUTH_REQUIRED', httpStatus: s, message: msg, durationMs, authRequired: true, isDead: false, isWafChallenge: isWaf };
    }
    if (s === 429) return { url, status: 'RATE_LIMITED', httpStatus: s, message: 'Rate limited (HTTP 429)', durationMs, authRequired: false, isDead: false };
    if (s === 404 || s === 410) return { url, status: 'DEAD', httpStatus: s, message: `HTTP ${s} ${s === 404 ? 'Not Found' : 'Gone'}`, durationMs, authRequired: false, isDead: true };
    if (s >= 500) return { url, status: 'SERVER_ERROR', httpStatus: s, message: `Server error (HTTP ${s})`, durationMs, authRequired: false, isDead: false };
    return { url, status: 'DEAD', httpStatus: s, message: `Client error (HTTP ${s})`, durationMs, authRequired: false, isDead: true };
  } catch (err: unknown) {
    const durationMs = Date.now() - start;
    const e = err as Error & { code?: string; cause?: Error & { code?: string } };
    const code = e.code || e.cause?.code || '';
    if (e.name === 'TimeoutError' || code === 'ABORT_ERR' || e.message.toLowerCase().includes('timeout')) {
      return { url, status: 'TIMEOUT', message: `Request timed out after ${timeoutMs}ms`, durationMs, authRequired: false, isDead: false };
    }
    const isNetDead = code === 'ENOTFOUND' || code === 'EAI_AGAIN' || code === 'ECONNREFUSED' || code === 'ECONNRESET' || code === 'EHOSTUNREACH' || code === 'ENETUNREACH' || e.message.includes('fetch failed') || e.message.includes('getaddrinfo');
    if (isNetDead) return { url, status: 'DEAD', message: `Network error: ${code || e.message}`, durationMs, authRequired: false, isDead: true };
    return { url, status: 'UNKNOWN_ERROR', message: e.message || 'Unknown network error', durationMs, authRequired: false, isDead: false };
  }
}

// --- Batch Runner & Summary ---
export async function checkAllUrls(urls: string[], opts: CheckOptions = {}, onProgress?: (r: LinkCheckResult, done: number, total: number) => void): Promise<CheckSummary> {
  const results = await mapConcurrent(urls, opts.concurrency ?? DEFAULT_CONCURRENCY, (u) => checkUrl(u, opts), onProgress);
  const counts = { ALIVE: 0, AUTH_REQUIRED: 0, DEAD: 0, TIMEOUT: 0, SERVER_ERROR: 0, RATE_LIMITED: 0, UNKNOWN_ERROR: 0 };
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  const passed = opts.failOnAuth ? counts.DEAD === 0 && counts.AUTH_REQUIRED === 0 : counts.DEAD === 0;
  return { total: urls.length, alive: counts.ALIVE, authRequired: counts.AUTH_REQUIRED, dead: counts.DEAD, timeouts: counts.TIMEOUT, serverErrors: counts.SERVER_ERROR, rateLimited: counts.RATE_LIMITED, unknownErrors: counts.UNKNOWN_ERROR, passed, results };
}

export async function run(opts: CheckOptions = {}): Promise<CheckSummary> {
  const urls = opts.urls || (await loadBookmarkUrls(opts.bookmarksFile || DEFAULT_BOOKMARKS_FILE));
  const concurrency = Number.isFinite(opts.concurrency) && (opts.concurrency ?? 0) > 0 ? (opts.concurrency as number) : DEFAULT_CONCURRENCY;
  const timeoutMs = Number.isFinite(opts.timeoutMs) && (opts.timeoutMs ?? 0) > 0 ? (opts.timeoutMs as number) : DEFAULT_TIMEOUT_MS;

  if (!opts.quiet) console.log(`[dead-links] Starte Prüfung für ${urls.length} URLs (Concurrency: ${concurrency}, Timeout: ${timeoutMs}ms)...`);
  const onProgress = !opts.quiet ? (r: LinkCheckResult, done: number, total: number) => {
    const pad = `[${done}/${total}]`.padEnd(10), ms = `${r.durationMs}ms`.padStart(7);
    if (r.status === 'ALIVE' && opts.verbose) console.log(`\x1b[32m[ALIVE]\x1b[0m   ${pad} ${ms} ${r.url}`);
    else if (r.status === 'AUTH_REQUIRED') console.log(`\x1b[33m${r.isWafChallenge ? '[WAF]' : '[AUTH]'}\x1b[0m    ${pad} ${ms} ${r.url} -> \x1b[33m${r.message}\x1b[0m`);
    else if (r.status === 'DEAD') console.error(`\x1b[31m[DEAD]\x1b[0m    ${pad} ${ms} ${r.url} -> \x1b[31m${r.message}\x1b[0m`);
    else if (r.status === 'TIMEOUT') console.warn(`\x1b[35m[TIMEOUT]\x1b[0m ${pad} ${ms} ${r.url}`);
    else if (r.status === 'RATE_LIMITED') console.warn(`\x1b[33m[RATE]\x1b[0m    ${pad} ${ms} ${r.url}`);
    else if (r.status !== 'ALIVE') console.warn(`\x1b[36m[${r.status}]\x1b[0m ${pad} ${ms} ${r.url} -> ${r.message}`);
  } : undefined;

  const summary = await checkAllUrls(urls, { ...opts, concurrency, timeoutMs }, onProgress);

  if (!opts.quiet) {
    console.log(`\n${'='.repeat(60)}\n LINK CHECK RESULT SUMMARY\n${'='.repeat(60)}`);
    console.log(` Total URLs checked       : ${summary.total}\n \x1b[32m✓ Alive (2xx/3xx)\x1b[0m         : ${summary.alive}\n \x1b[33m🔒 Auth/WAF (401/403)\x1b[0m     : ${summary.authRequired} (Gracefully handled - server alive)\n \x1b[31m✕ Dead Links (404/DNS)\x1b[0m    : ${summary.dead}\n ⏱ Timeouts (> ${timeoutMs}ms)      : ${summary.timeouts}\n ⚠️ Server Errors (5xx)    : ${summary.serverErrors}\n ⏳ Rate Limited (429)     : ${summary.rateLimited}\n${'='.repeat(60)}`);
    if (summary.dead > 0) console.log('\n\x1b[31mDefekte Links:\x1b[0m\n' + summary.results.filter((x) => x.isDead).map((r) => `  - ${r.url} (${r.message})`).join('\n'));
    if (summary.authRequired > 0) console.log('\n\x1b[33mLinks mit Zugriffsbeschränkung / WAF-Schutz (Server erreichbar, nicht defekt):\x1b[0m\n' + summary.results.filter((x) => x.authRequired).map((r) => `  - ${r.url} [HTTP ${r.httpStatus}] (${r.isWafChallenge ? 'WAF/Bot-Challenge' : 'Auth Required'})`).join('\n'));
    console.log(`\nErgebnis: ${summary.passed ? '\x1b[32mPASSED\x1b[0m' : '\x1b[31mFAILED\x1b[0m'}\n`);
  } else if (summary.dead > 0) {
    console.error(`\x1b[31m[dead-links] ${summary.dead} defekte Link(s) gefunden:\x1b[0m\n` + summary.results.filter((x) => x.isDead).map((r) => `  - ${r.url} (${r.message})`).join('\n'));
  }

  if (opts.reportFile) {
    const reportPath = path.resolve(opts.reportFile);
    await fs.writeFile(reportPath, JSON.stringify(summary, null, 2) + '\n');
    if (!opts.quiet) console.log(`\nBericht exportiert nach: ${reportPath}`);
  }
  return summary;
}

// --- CLI Entry Point ---
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opts: CheckOptions = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const val = i + 1 < args.length && !args[i + 1].startsWith('--') ? args[++i] : undefined;
    if (arg === '--file' && val) opts.bookmarksFile = val;
    else if (arg === '--concurrency' && val) opts.concurrency = parseInt(val, 10);
    else if (arg === '--timeout' && val) opts.timeoutMs = parseInt(val, 10);
    else if (arg === '--report' && val) opts.reportFile = val;
    else if (arg === '--fail-on-auth') opts.failOnAuth = true;
    else if (arg === '--verbose') opts.verbose = true;
    else if (arg === '--quiet') opts.quiet = true;
  }
  if (process.env.LINK_CHECK_AUTH_HEADERS) {
    try { opts.authTokensByHost = JSON.parse(process.env.LINK_CHECK_AUTH_HEADERS); } catch { /* ignore */ }
  }
  run(opts).then((s) => process.exit(s.passed ? 0 : 1)).catch((err: unknown) => {
    console.error('[dead-links] Fataler Fehler:', err);
    process.exit(1);
  });
}
