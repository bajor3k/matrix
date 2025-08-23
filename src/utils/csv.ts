// utils/csv.ts
export type TableRow = {
  ip: string;
  acct: string;
  value: string;
  fee: string;
  cash: string;
  short: boolean;
};

const headers = ["IP", "Account Number", "Value", "Advisory Fees", "Cash", "Status"];

// Safely quote a CSV field
function q(v: unknown): string {
  const s = v == null ? "" : String(v);
  const escaped = s.replace(/"/g, '""'); // escape quotes
  return `"${escaped}"`;
}

export function toCSV(rows: TableRow[]): string {
  const lines = [headers.map(q).join(",")];

  for (const r of rows) {
    lines.push(
      [
        q(r.ip),
        q(r.acct),
        q(r.value),
        q(r.fee),
        q(r.cash),
        q(r.short ? "Short" : ""),
      ].join(",")
    );
  }

  // Use CRLF so Excel/Windows is happy
  return lines.join("\r\n");
}

export function downloadCSV(rows: TableRow[], filename?: string) {
  const csv = toCSV(rows);
  const BOM = "\uFEFF"; // ensure Excel reads UTF-8
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const d = new Date().toISOString().slice(0, 10);
  a.download = filename || `advisory-fees-${d}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
