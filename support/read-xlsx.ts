import * as fs from 'fs';
import * as XLSX from 'xlsx';

export interface ReadXlsxOptions {
  /** Path to the .xlsx file, relative to the project root. */
  file: string;
  /** Sheet name to read. */
  sheet: string;
}

/**
 * Read a sheet from an Excel workbook and return its rows as JSON objects.
 *
 * Direct port of the original `cypress/plugins/read-xlsx.js`. Cypress ran this
 * behind `cy.task('readXlsx', ...)` because plugin code lives in Node; Playwright
 * test files already run in Node, so it can be called directly.
 */
export function read({ file, sheet }: ReadXlsxOptions): Record<string, unknown>[] {
  const buf = fs.readFileSync(file);
  const workbook = XLSX.read(buf, { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
  return rows as Record<string, unknown>[];
}
