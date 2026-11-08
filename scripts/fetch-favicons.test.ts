import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  pruneOrphanFavicons,
  hashBuffer,
  detectExtension,
  extractIconHrefFromHtml,
} from './fetch-favicons.ts';

describe('Favicons Cleanup & Pruning', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'favicons-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should delete orphan favicon files that are not referenced in the manifest', async () => {
    // Create active files and orphan files
    await fs.writeFile(path.join(tempDir, 'active1.png'), 'active-icon-1');
    await fs.writeFile(path.join(tempDir, 'active2.svg'), 'active-icon-2');
    await fs.writeFile(path.join(tempDir, 'orphan1.ico'), 'orphan-icon-1');
    await fs.writeFile(path.join(tempDir, 'orphan2.png'), 'orphan-icon-2');

    const manifest = {
      'https://site1.org': 'favicons/active1.png',
      'https://site2.org': 'favicons/active2.svg',
    };

    const deleted = await pruneOrphanFavicons(tempDir, manifest);

    assert.deepEqual(deleted.sort(), ['orphan1.ico', 'orphan2.png']);

    const remaining = await fs.readdir(tempDir);
    assert.deepEqual(remaining.sort(), ['active1.png', 'active2.svg']);
  });

  test('should not delete anything if all files on disk are referenced in the manifest', async () => {
    await fs.writeFile(path.join(tempDir, 'shared.png'), 'shared-icon');

    const manifest = {
      'https://site1.org/pathA': 'favicons/shared.png',
      'https://site1.org/pathB': 'favicons/shared.png',
    };

    const deleted = await pruneOrphanFavicons(tempDir, manifest);
    assert.deepEqual(deleted, []);

    const remaining = await fs.readdir(tempDir);
    assert.deepEqual(remaining, ['shared.png']);
  });

  test('should correctly detect image extension and compute content hash', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.equal(detectExtension('image/png', pngBuffer), 'png');

    const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    assert.equal(detectExtension('image/svg+xml', svgBuffer), 'svg');

    // SVG with XML header and comments longer than 100 bytes
    const longHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<!-- ' + 'A'.repeat(120) + ' -->\n';
    const longSvgBuffer = Buffer.from(longHeader + '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    assert.equal(detectExtension(undefined, longSvgBuffer), 'svg');

    const hash = hashBuffer(pngBuffer);
    assert.equal(hash.length, 12);
    assert.match(hash, /^[a-f0-9]{12}$/);
  });

  test('should extract favicon href across different rel formats and attributes', () => {
    // Standard icon
    assert.equal(
      extractIconHrefFromHtml('<html><head><link rel="icon" href="/favicon.svg"></head></html>'),
      '/favicon.svg'
    );

    // Attribute order reversed
    assert.equal(
      extractIconHrefFromHtml('<link href="/favicon.ico" rel="shortcut icon">'),
      '/favicon.ico'
    );

    // Multi-token rel: alternate icon
    assert.equal(
      extractIconHrefFromHtml('<link rel="alternate icon" type="image/png" href="/icon.png">'),
      '/icon.png'
    );

    // Apple touch icon
    assert.equal(
      extractIconHrefFromHtml('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">'),
      '/apple-touch-icon.png'
    );

    // Unquoted href
    assert.equal(
      extractIconHrefFromHtml('<link rel="icon" href=/assets/fav.ico>'),
      '/assets/fav.ico'
    );

    // Ignore non-icon link tags
    assert.equal(
      extractIconHrefFromHtml('<link rel="stylesheet" href="/main.css"><link rel="canonical" href="https://site.org">'),
      null
    );
  });
});
