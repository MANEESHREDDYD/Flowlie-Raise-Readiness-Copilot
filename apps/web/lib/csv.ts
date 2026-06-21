// Minimal, dependency-free CSV parsing + header alias mapping for operator bulk import.
// This expands what data can get IN. It does not touch any scoring/threshold logic.

export type CsvTable = { headers: string[]; rows: string[][] };

// RFC-4180-ish parser: handles quoted fields, escaped quotes (""), commas, and CRLF/CR/LF.
export function parseCsv(text: string): CsvTable {
  const s = text.replace(/\r\n?/g, "\n");
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  // Drop completely blank lines (common at EOF); keep partial rows so nothing is silently lost.
  const nonEmpty = rows.filter(r => r.some(c => c.trim() !== ""));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };
  const headers = nonEmpty[0].map(h => h.trim());
  return { headers, rows: nonEmpty.slice(1) };
}

// Normalize a header/alias for matching: lowercase, strip % and punctuation/space differences.
const norm = (value: string) =>
  value.toLowerCase().replace(/%/g, "").replace(/[\s_\-./]+/g, " ").trim();

export type AliasField = { key: string; label: string; aliases?: string[] };

// Map each CSV column index to a canonical field key via key, label, or alias (case/space/%-insensitive).
// Columns that match nothing are returned in `unmapped` so the operator can see them — never silently dropped.
export function mapHeaders(headers: string[], fields: AliasField[]): { map: Record<number, string>; unmapped: string[] } {
  const lookup = new Map<string, string>();
  for (const f of fields) {
    lookup.set(norm(f.key), f.key);
    lookup.set(norm(f.label), f.key);
    for (const a of f.aliases || []) lookup.set(norm(a), f.key);
  }
  const map: Record<number, string> = {};
  const unmapped: string[] = [];
  headers.forEach((h, i) => {
    const k = lookup.get(norm(h));
    if (k) map[i] = k; else if (h.trim()) unmapped.push(h.trim());
  });
  return { map, unmapped };
}
