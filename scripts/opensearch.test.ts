import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('OpenSearch Autodiscovery & Description Specification', () => {
  const rootDir = process.cwd();
  const openSearchXmlPath = path.join(rootDir, 'public', 'opensearch.xml');
  const indexHtmlPath = path.join(rootDir, 'src', 'index.html');

  it('should have public/opensearch.xml with valid OpenSearch 1.1 structure', () => {
    assert.ok(fs.existsSync(openSearchXmlPath), 'public/opensearch.xml must exist');

    const content = fs.readFileSync(openSearchXmlPath, 'utf8');

    // XML header and root namespace
    assert.match(content, /<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(
      content,
      /<OpenSearchDescription\s+xmlns="http:\/\/a9\.com\/-\/spec\/opensearch\/1\.1\/"/,
    );

    // Required OpenSearch elements
    assert.match(content, /<ShortName>[^<]+<\/ShortName>/);
    assert.match(content, /<Description>[^<]+<\/Description>/);
    assert.match(content, /<InputEncoding>UTF-8<\/InputEncoding>/);

    // Favicon image declarations
    assert.match(content, /<Image[^>]*>favicon\.ico<\/Image>/);

    // Search URL template with relative ./ path and {searchTerms} parameter
    assert.match(
      content,
      /<Url\s+type="text\/html"\s+method="get"\s+template="\.\/\?q=\{searchTerms\}"\s*\/>/,
    );
  });

  it('should have autodiscovery link in src/index.html pointing to opensearch.xml', () => {
    assert.ok(fs.existsSync(indexHtmlPath), 'src/index.html must exist');

    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

    // Match link rel="search" tag
    const linkMatch = indexHtml.match(
      /<link\s+[^>]*rel="search"[^>]*type="application\/opensearchdescription\+xml"[^>]*href="opensearch\.xml"[^>]*\/?>/,
    );

    assert.ok(
      linkMatch,
      'src/index.html must include <link rel="search" type="application/opensearchdescription+xml" href="opensearch.xml" ...>',
    );
  });

  it('should have valid public/favicon.ico and public/favicon.svg files matching index.html and opensearch.xml references', () => {
    const faviconIcoPath = path.join(rootDir, 'public', 'favicon.ico');
    const faviconSvgPath = path.join(rootDir, 'public', 'favicon.svg');

    assert.ok(fs.existsSync(faviconSvgPath), 'public/favicon.svg must exist');
    assert.ok(fs.existsSync(faviconIcoPath), 'public/favicon.ico must exist');

    const icoBytes = fs.readFileSync(faviconIcoPath);
    assert.ok(icoBytes.length > 22, 'favicon.ico must contain ICONDIR header and image data');
    assert.equal(icoBytes.readUInt16LE(0), 0, 'ICO reserved field must be 0');
    assert.equal(icoBytes.readUInt16LE(2), 1, 'ICO type field must be 1');
    assert.ok(icoBytes.readUInt16LE(4) >= 1, 'ICO must contain at least 1 image');
  });
});
