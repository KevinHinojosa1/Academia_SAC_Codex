export function spreadsheetSafeText(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /^[\t\r\n =+\-@]/.test(text) ? `'${text}` : text;
}

function csvCell(value: unknown): string {
  return `"${spreadsheetSafeText(value).replace(/"/g, '""')}"`;
}

export function createCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvCell), ...rows.map((row) => row.map(csvCell))];
  return `\uFEFF${lines.map((row) => row.join(",")).join("\r\n")}\r\n`;
}
