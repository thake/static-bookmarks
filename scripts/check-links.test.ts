import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { checkUrl, checkAllUrls } from './check-links.ts';

describe('Dead Link Checker - checkUrl', () => {
  test('should classify 200 OK as ALIVE and not dead', async () => {
    const mockFetch = async () => {
      return new Response(null, { status: 200 });
    };

    const result = await checkUrl('https://example.com/valid', { fetchFn: mockFetch });
    assert.equal(result.status, 'ALIVE');
    assert.equal(result.httpStatus, 200);
    assert.equal(result.isDead, false);
    assert.equal(result.authRequired, false);
  });

  test('should gracefully handle 401 Unauthorized as AUTH_REQUIRED and not dead', async () => {
    const mockFetch = async () => {
      return new Response(null, { status: 401 });
    };

    const result = await checkUrl('https://example.com/protected', { fetchFn: mockFetch });
    assert.equal(result.status, 'AUTH_REQUIRED');
    assert.equal(result.httpStatus, 401);
    assert.equal(result.isDead, false);
    assert.equal(result.authRequired, true);
    assert.match(result.message || '', /Authorization required.*server alive/i);
  });

  test('should gracefully handle 403 Forbidden as AUTH_REQUIRED when GET also returns 403', async () => {
    const mockFetch = async () => {
      return new Response(null, { status: 403 });
    };

    const result = await checkUrl('https://example.com/restricted', { fetchFn: mockFetch });
    assert.equal(result.status, 'AUTH_REQUIRED');
    assert.equal(result.httpStatus, 403);
    assert.equal(result.isDead, false);
    assert.equal(result.authRequired, true);
    assert.match(result.message || '', /Forbidden.*server alive/i);
    assert.equal(result.isWafChallenge, false);
  });

  test('should detect Cloudflare/WAF anti-bot challenge and mark isWafChallenge true', async () => {
    const mockFetch = async () => {
      return new Response(null, {
        status: 403,
        headers: {
          'server': 'cloudflare',
          'cf-mitigated': 'challenge',
          'cf-ray': '8e2b83419-FRA',
        },
      });
    };

    const result = await checkUrl('https://www.npmjs.com', { fetchFn: mockFetch });
    assert.equal(result.status, 'AUTH_REQUIRED');
    assert.equal(result.httpStatus, 403);
    assert.equal(result.isDead, false);
    assert.equal(result.authRequired, true);
    assert.equal(result.isWafChallenge, true);
    assert.match(result.message || '', /Anti-bot \/ WAF challenge/i);
  });

  test('should fallback to GET when HEAD returns 404 and succeed if GET is 200 (e.g. Kaggle)', async () => {
    const mockFetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'HEAD') {
        return new Response(null, { status: 404 });
      }
      return new Response('<html>Kaggle Content</html>', { status: 200 });
    };

    const result = await checkUrl('https://www.kaggle.com', { fetchFn: mockFetch });
    assert.equal(result.status, 'ALIVE');
    assert.equal(result.httpStatus, 200);
    assert.equal(result.isDead, false);
  });

  test('should succeed via clean GET when browser UA triggers 403 (e.g. Datadome/Unsplash)', async () => {
    const mockFetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
      const headers = (init?.headers || {}) as Record<string, string>;
      if (headers['User-Agent']?.includes('Chrome')) {
        return new Response(null, { status: 403 });
      }
      return new Response('<html>Clean GET</html>', { status: 200 });
    };

    const result = await checkUrl('https://unsplash.com', { fetchFn: mockFetch });
    assert.equal(result.status, 'ALIVE');
    assert.equal(result.httpStatus, 200);
    assert.equal(result.isDead, false);
  });

  test('should fallback to GET when HEAD returns 403 and return ALIVE if GET succeeds', async () => {
    const mockFetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'HEAD') {
        return new Response(null, { status: 403 });
      }
      return new Response('<html>Hello</html>', { status: 200 });
    };

    const result = await checkUrl('https://cloudflare-protected.org', { fetchFn: mockFetch });
    assert.equal(result.status, 'ALIVE');
    assert.equal(result.httpStatus, 200);
    assert.equal(result.isDead, false);
    assert.equal(result.authRequired, false);
  });

  test('should fallback to GET when HEAD returns 405 Method Not Allowed', async () => {
    let attemptedGet = false;
    const mockFetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'HEAD') {
        return new Response(null, { status: 405 });
      }
      attemptedGet = true;
      return new Response('content', { status: 200 });
    };

    const result = await checkUrl('https://no-head.com', { fetchFn: mockFetch });
    assert.equal(attemptedGet, true);
    assert.equal(result.status, 'ALIVE');
    assert.equal(result.httpStatus, 200);
    assert.equal(result.isDead, false);
  });

  test('should classify 404 Not Found as DEAD', async () => {
    const mockFetch = async () => {
      return new Response(null, { status: 404 });
    };

    const result = await checkUrl('https://example.com/missing', { fetchFn: mockFetch });
    assert.equal(result.status, 'DEAD');
    assert.equal(result.httpStatus, 404);
    assert.equal(result.isDead, true);
    assert.equal(result.authRequired, false);
  });

  test('should classify 410 Gone as DEAD', async () => {
    const mockFetch = async () => {
      return new Response(null, { status: 410 });
    };

    const result = await checkUrl('https://example.com/deleted', { fetchFn: mockFetch });
    assert.equal(result.status, 'DEAD');
    assert.equal(result.httpStatus, 410);
    assert.equal(result.isDead, true);
  });

  test('should classify network DNS/connection failure as DEAD', async () => {
    const mockFetch = async () => {
      const err = new Error('getaddrinfo ENOTFOUND invalid-domain-xyz.local');
      (err as unknown as { code: string }).code = 'ENOTFOUND';
      throw err;
    };

    const result = await checkUrl('https://invalid-domain-xyz.local', { fetchFn: mockFetch });
    assert.equal(result.status, 'DEAD');
    assert.equal(result.isDead, true);
    assert.match(result.message || '', /Network error/);
  });

  test('should classify connection timeout as TIMEOUT and not dead', async () => {
    const mockFetch = async () => {
      const err = new Error('The operation was aborted due to timeout');
      err.name = 'TimeoutError';
      throw err;
    };

    const result = await checkUrl('https://slow-site.com', { fetchFn: mockFetch });
    assert.equal(result.status, 'TIMEOUT');
    assert.equal(result.isDead, false);
    assert.match(result.message || '', /timed out/i);
  });

  test('should send Authorization header if authTokensByHost is specified', async () => {
    let capturedAuthHeader: string | null = null;
    const mockFetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      capturedAuthHeader = headers?.['Authorization'] || null;
      return new Response(null, { status: 200 });
    };

    await checkUrl('https://internal.company.com/docs', {
      fetchFn: mockFetch,
      authTokensByHost: {
        'internal.company.com': 'my-secret-token',
      },
    });

    assert.equal(capturedAuthHeader, 'Bearer my-secret-token');
  });

  test('should reject invalid URLs as DEAD', async () => {
    const result = await checkUrl('invalid-url-schema');
    assert.equal(result.status, 'DEAD');
    assert.equal(result.isDead, true);
  });
});

describe('Dead Link Checker - checkAllUrls & Graceful Summary', () => {
  test('should pass when links are alive or require authorization', async () => {
    const urls = [
      'https://site1.org/public',
      'https://site2.org/sso-login',
      'https://site3.org/admin-forbidden',
    ];

    const mockFetch = async (url: RequestInfo | URL) => {
      const str = url.toString();
      if (str.includes('sso-login')) {
        return new Response(null, { status: 401 });
      }
      if (str.includes('admin-forbidden')) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 200 });
    };

    const summary = await checkAllUrls(urls, { fetchFn: mockFetch });

    assert.equal(summary.total, 3);
    assert.equal(summary.alive, 1);
    assert.equal(summary.authRequired, 2);
    assert.equal(summary.dead, 0);
    // Graceful handling: since missing authorization is NOT a dead link, check passes!
    assert.equal(summary.passed, true);
  });

  test('should fail when dead links are detected', async () => {
    const urls = [
      'https://site1.org/public',
      'https://site2.org/gone',
    ];

    const mockFetch = async (url: RequestInfo | URL) => {
      const str = url.toString();
      if (str.includes('gone')) {
        return new Response(null, { status: 404 });
      }
      return new Response(null, { status: 200 });
    };

    const summary = await checkAllUrls(urls, { fetchFn: mockFetch });

    assert.equal(summary.total, 2);
    assert.equal(summary.alive, 1);
    assert.equal(summary.dead, 1);
    assert.equal(summary.passed, false);
  });

  test('should fail on auth required if failOnAuth is explicitly set to true', async () => {
    const urls = ['https://site1.org/sso-login'];

    const mockFetch = async () => {
      return new Response(null, { status: 401 });
    };

    const summary = await checkAllUrls(urls, { fetchFn: mockFetch, failOnAuth: true });
    assert.equal(summary.authRequired, 1);
    assert.equal(summary.dead, 0);
    assert.equal(summary.passed, false);
  });

  test('should gracefully handle NaN concurrency and timeout by falling back to defaults', async () => {
    const urls = ['https://site1.org/public'];
    const mockFetch = async () => new Response(null, { status: 200 });

    const summary = await checkAllUrls(urls, {
      fetchFn: mockFetch,
      concurrency: NaN,
      timeoutMs: NaN,
    });

    assert.equal(summary.total, 1);
    assert.equal(summary.alive, 1);
    assert.equal(summary.passed, true);
  });
});

describe('Dead Link Checker - Resilience & Sockets', () => {
  test('should fallback to GET when HEAD throws ECONNRESET and succeed if GET is 200', async () => {
    let attemptedGet = false;
    const mockFetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'HEAD') {
        const err = new Error('read ECONNRESET');
        (err as unknown as { code: string }).code = 'ECONNRESET';
        throw err;
      }
      attemptedGet = true;
      return new Response('ok', { status: 200 });
    };

    const result = await checkUrl('https://reset-on-head.org', { fetchFn: mockFetch });
    assert.equal(attemptedGet, true);
    assert.equal(result.status, 'ALIVE');
    assert.equal(result.isDead, false);
  });

  test('should mark as DEAD when HEAD throws ECONNRESET and GET also fails', async () => {
    const mockFetch = async () => {
      const err = new Error('read ECONNRESET');
      (err as unknown as { code: string }).code = 'ECONNRESET';
      throw err;
    };

    const result = await checkUrl('https://completely-broken-socket.org', { fetchFn: mockFetch });
    assert.equal(result.status, 'DEAD');
    assert.equal(result.isDead, true);
  });

  test('should cancel response body when inspecting GET response', async () => {
    let bodyCancelled = false;
    const customReadableStream = new ReadableStream({
      cancel() {
        bodyCancelled = true;
      },
    });

    const mockFetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'HEAD') {
        return new Response(null, { status: 405 });
      }
      return new Response(customReadableStream, { status: 200 });
    };

    const result = await checkUrl('https://stream-leak-test.org', { fetchFn: mockFetch });
    assert.equal(result.status, 'ALIVE');
    assert.equal(bodyCancelled, true, 'Expected response body stream to be cancelled');
  });
});

describe('Dead Link Checker - mapConcurrent & CLI run', () => {
  test('should execute items concurrently up to limit with progress tracking', async () => {
    const { mapConcurrent } = await import('./check-links.ts');
    let active = 0;
    let maxActive = 0;
    const items = [1, 2, 3, 4, 5, 6];
    const progress: number[] = [];

    const results = await mapConcurrent(
      items,
      3,
      async (n) => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise((resolve) => setTimeout(resolve, 10));
        active--;
        return n * 10;
      },
      (_res, done) => progress.push(done)
    );

    assert.equal(maxActive, 3);
    assert.deepEqual(results.sort((a, b) => a - b), [10, 20, 30, 40, 50, 60]);
    assert.equal(progress.length, 6);
  });

  test('should run in quiet mode without logging progress', async () => {
    const { run } = await import('./check-links.ts');
    const mockFetch = async () => new Response(null, { status: 200 });

    const summary = await run({
      urls: ['https://site1.org'],
      fetchFn: mockFetch,
      quiet: true,
    });

    assert.equal(summary.total, 1);
    assert.equal(summary.alive, 1);
    assert.equal(summary.passed, true);
  });
});

