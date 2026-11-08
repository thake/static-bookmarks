# Static Bookmarks

This project contains a simple static bookmarks application which takes a json file containing the bookmarks to display.

See a demo at https://thake.github.io/static-bookmarks/

Features:
- search
- tags
- categories
- keyboard navigation

## Start
```shell
npm start
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

