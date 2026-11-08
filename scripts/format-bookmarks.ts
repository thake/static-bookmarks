import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Formatter, FracturedJsonOptions } from 'fracturedjsonjs';

export const DEFAULT_BOOKMARKS_FILE = path.resolve('public/bookmarks.json');

export interface FormatOptions {
  indentSpaces?: number;
  maxTotalLineLength?: number;
  maxInlineComplexity?: number;
  maxTableRowComplexity?: number;
}

export function createBookmarkFormatter(options: FormatOptions = {}): Formatter {
  const formatter = new Formatter();
  const opts = new FracturedJsonOptions();
  opts.IndentSpaces = options.indentSpaces ?? 2;
  opts.MaxTotalLineLength = options.maxTotalLineLength ?? 500;
  opts.MaxInlineComplexity = options.maxInlineComplexity ?? 2;
  opts.MaxTableRowComplexity = options.maxTableRowComplexity ?? 2;
  formatter.Options = opts;
  return formatter;
}

export function formatBookmarksData(data: unknown, options: FormatOptions = {}): string {
  const formatter = createBookmarkFormatter(options);
  return formatter.Serialize(data);
}

export async function formatBookmarksFile(
  filePath: string = DEFAULT_BOOKMARKS_FILE,
  options: FormatOptions = {},
): Promise<{ changed: boolean; formatted: string }> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(raw);
  const formatted = formatBookmarksData(data, options);
  const changed = raw !== formatted;

  if (changed) {
    await fs.writeFile(filePath, formatted, 'utf-8');
  }

  return { changed, formatted };
}

export async function checkBookmarksFile(
  filePath: string = DEFAULT_BOOKMARKS_FILE,
  options: FormatOptions = {},
): Promise<boolean> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(raw);
  const formatted = formatBookmarksData(data, options);
  return raw === formatted;
}

async function runCli(): Promise<void> {
  const args = process.argv.slice(2);
  const isCheck = args.includes('--check');
  const targetFile = args.find((arg) => !arg.startsWith('--')) ?? DEFAULT_BOOKMARKS_FILE;

  try {
    if (isCheck) {
      const isFormatted = await checkBookmarksFile(targetFile);
      if (!isFormatted) {
        console.error(
          `File ${targetFile} is not properly formatted. Run 'npm run format:bookmarks' to fix.`,
        );
        process.exitCode = 1;
        return;
      }
      console.log(`File ${targetFile} is already properly formatted.`);
    } else {
      const { changed } = await formatBookmarksFile(targetFile);
      if (changed) {
        console.log(`Formatted ${targetFile}`);
      } else {
        console.log(`${targetFile} is already formatted`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${targetFile}:`, error);
    process.exitCode = 1;
  }
}

const isDirectRun =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  runCli();
}
