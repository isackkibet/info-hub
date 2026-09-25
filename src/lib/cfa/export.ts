export function toCsv(columns: string[], rows: (string | number)[][]): string {
  const escape = (value: string | number) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [columns, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export function downloadText(
  fileName: string,
  mime: string,
  content: string,
) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(fileName: string, columns: string[], rows: (string | number)[][]) {
  downloadText(fileName, "text/csv", toCsv(columns, rows));
}

export function downloadJson(fileName: string, payload: unknown) {
  downloadText(fileName, "application/json", JSON.stringify(payload, null, 2));
}
