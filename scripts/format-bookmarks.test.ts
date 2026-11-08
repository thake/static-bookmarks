import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  formatBookmarksData,
  formatBookmarksFile,
  checkBookmarksFile,
} from './format-bookmarks.ts';

describe('format-bookmarks', () => {
  let tempDir: string;
  let testFile: string;

  const sampleData = {
    CategoryA: [
      {
        name: 'Short Name',
        url: 'https://example.com',
        description: 'A description',
        tags: ['web', 'dev'],
      },
      {
        name: 'A Much Longer Bookmark Name Here',
        url: 'https://longer-url.org/subpath',
        description: 'Another description',
        tags: ['tooling'],
      },
    ],
  };

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'format-bookmarks-test-'));
    testFile = path.join(tempDir, 'bookmarks.json');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('formats bookmarks so each entry is on a single line with block-aligned properties', () => {
    const formatted = formatBookmarksData(sampleData);
    const lines = formatted.split('\n');

    // Expected structure: opening brace, category line, 2 bookmark lines, closing brackets
    const bookmarkLines = lines.filter((l) => l.includes('"name":'));
    assert.equal(bookmarkLines.length, 2);

    for (const line of bookmarkLines) {
      assert.ok(line.trim().startsWith('{ "name":'));
      assert.ok(line.trim().endsWith('},') || line.trim().endsWith('}'));
    }

    // Verify parsed data matches sampleData 100%
    assert.deepEqual(JSON.parse(formatted), sampleData);
  });

  test('checkBookmarksFile returns false when unformatted and true when formatted', async () => {
    // Write standard multi-line JSON
    await fs.writeFile(testFile, JSON.stringify(sampleData, null, 2), 'utf-8');

    const initiallyFormatted = await checkBookmarksFile(testFile);
    assert.equal(initiallyFormatted, false);

    const { changed } = await formatBookmarksFile(testFile);
    assert.equal(changed, true);

    const afterFormatted = await checkBookmarksFile(testFile);
    assert.equal(afterFormatted, true);

    // Running format again should not change the file
    const secondRun = await formatBookmarksFile(testFile);
    assert.equal(secondRun.changed, false);
  });
});
