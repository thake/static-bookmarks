# Static Bookmarks

This project contains a simple static bookmarks application which takes a json file containing the bookmarks to display.

See a demo at https://thake.github.io/static-bookmarks/

Features:

- search & browser address bar shortcuts (OpenSearch / Omnibox)
- tags
- categories
- keyboard navigation

## Start

```shell
npm start
```

## Browser Search Shortcut (Omnibox)

Search your bookmarks directly from your browser's address bar using shortcuts (e.g. `bm <query>` or domain + `Tab`):

- **Chrome / Edge / Brave**: Automatically discovered via OpenSearch. Go to **Settings → Search engine → Manage search engines and site search** to assign your favorite shortcut (e.g. `bm`).
- **Firefox**: Add via the address bar icon or assign a keyword shortcut in **Settings → Search**.
- **Search URL Template**:
  ```text
  https://thake.github.io/static-bookmarks/?q=%s
  ```

## Dead Link Checker

Check for dead/broken links across all bookmarks:

```shell
npm run check:links
```

Options:

- `--concurrency <num>`: Number of parallel requests (default: `10`)
- `--timeout <ms>`: Request timeout in milliseconds (default: `8000`)
- `--file <path>`: Path to bookmarks JSON (default: `public/bookmarks.json`)
- `--fail-on-auth`: Treat 401/403 restricted links as failures (default: `false` — gracefully handled as warnings)
- `--report <path>`: Export results to a JSON report file
- `--verbose`: Log all checked links, including alive ones
- `--quiet`: Suppress progress and informational banners; only report errors

> **Note:** By default, only confirmed dead links (HTTP 404, 410, DNS resolution failures, and connection refused) cause a non-zero exit code. Protected resources (401/403) and WAF anti-bot challenges (Cloudflare Turnstile/Bot Management) are highlighted as warnings and counted separately in the summary without failing the build.
