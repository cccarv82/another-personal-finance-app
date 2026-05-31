export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  bank: string;
}

function parseDate(raw: string): string {
  // DD/MM/YYYY → YYYY-MM-DD
  const parts = raw.trim().split(/[/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2,"0")}-${parts[2].padStart(2,"0")}`;
    return `${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
  }
  return raw;
}

function parseAmount(raw: string): number {
  return Math.abs(parseFloat(raw.replace(/\./g,"").replace(",","."))) || 0;
}

export function parseNubank(csv: string): ParsedTransaction[] {
  const lines = csv.trim().split("\n").slice(1);
  return lines.map(line => {
    const [date, category, title, amount] = line.split(",").map(s => s.replace(/"/g,"").trim());
    const amt = parseFloat(amount?.replace(",",".") || "0");
    return {
      date: parseDate(date),
      description: title || category,
      amount: Math.abs(amt),
      type: (amt < 0 ? "income" : "expense") as "income" | "expense",
      bank: "Nubank",
    };
  }).filter(t => t.amount > 0 && t.date);
}

export function parseItau(csv: string): ParsedTransaction[] {
  const lines = csv.trim().split("\n");
  const results: ParsedTransaction[] = [];
  for (const line of lines) {
    const cols = line.split(";").map(s => s.replace(/"/g,"").trim());
    if (cols.length < 3) continue;
    const [date, description, , , value] = cols;
    if (!date.match(/\d{2}\/\d{2}\/\d{4}/)) continue;
    const amt = parseAmount(value || "0");
    if (amt === 0) continue;
    const raw = parseFloat((value || "0").replace(",","."));
    results.push({
      date: parseDate(date),
      description,
      amount: amt,
      type: raw < 0 ? "expense" : "income",
      bank: "Itaú",
    });
  }
  return results;
}

export function parseBradesco(csv: string): ParsedTransaction[] {
  const lines = csv.trim().split("\n");
  const results: ParsedTransaction[] = [];
  for (const line of lines) {
    const cols = line.split(";").map(s => s.replace(/"/g,"").trim());
    if (cols.length < 4) continue;
    const [date, , description, , value] = cols;
    if (!date.match(/\d{2}\/\d{2}\/\d{4}/)) continue;
    const raw = parseFloat((value || "0").replace(".","").replace(",","."));
    const amt = Math.abs(raw);
    if (amt === 0) continue;
    results.push({
      date: parseDate(date),
      description,
      amount: amt,
      type: raw < 0 ? "expense" : "income",
      bank: "Bradesco",
    });
  }
  return results;
}

export function parseInter(csv: string): ParsedTransaction[] {
  const lines = csv.trim().split("\n").slice(1);
  return lines.map(line => {
    const cols = line.split(";").map(s => s.replace(/"/g,"").trim());
    const [date, description, , value, type] = cols;
    if (!date || !value) return null;
    const amt = parseAmount(value);
    return {
      date: parseDate(date),
      description,
      amount: amt,
      type: (type?.toLowerCase().includes("crédit") || type?.toLowerCase().includes("credit")) ? "income" : "expense",
      bank: "Inter",
    } as ParsedTransaction;
  }).filter((t): t is ParsedTransaction => t !== null && t.amount > 0);
}

export function parseC6(csv: string): ParsedTransaction[] {
  const lines = csv.trim().split("\n").slice(1);
  return lines.map(line => {
    const cols = line.split(",").map(s => s.replace(/"/g,"").trim());
    const [date, description, amount] = cols;
    if (!date || !amount) return null;
    const raw = parseFloat(amount.replace(",","."));
    return {
      date: parseDate(date),
      description,
      amount: Math.abs(raw),
      type: raw < 0 ? "expense" : "income",
      bank: "C6",
    } as ParsedTransaction;
  }).filter((t): t is ParsedTransaction => t !== null && t.amount > 0);
}

export function parseGenericCSV(csv: string): ParsedTransaction[] {
  const lines = csv.trim().split("\n");
  const first = lines[0].toLowerCase();
  if (first.includes("nubank") || first.includes("category,title")) return parseNubank(csv);
  if (first.includes("débito") && first.includes("crédito") && first.includes("itaú")) return parseItau(csv);
  if (first.includes("inter")) return parseInter(csv);
  if (first.includes("c6")) return parseC6(csv);

  // If first line looks like a data row (starts with DD/MM/YYYY), don't skip it
  const hasHeader = !lines[0].match(/^\d{2}\/\d{2}\/\d{4}/);

  // Generic fallback: date, description, amount
  return (hasHeader ? lines.slice(1) : lines).map(line => {
    const sep = line.includes(";") ? ";" : ",";
    const cols = line.split(sep).map(s => s.replace(/"/g,"").trim());
    if (cols.length < 3) return null;
    const [date, description, amtStr] = cols;
    if (!date || !amtStr) return null;
    const raw = parseFloat(amtStr.replace(".","").replace(",","."));
    return {
      date: parseDate(date),
      description,
      amount: Math.abs(raw),
      type: raw < 0 ? "expense" : "income",
      bank: "Importado",
    } as ParsedTransaction;
  }).filter((t): t is ParsedTransaction => t !== null && t.amount > 0);
}

export function exportToCSV(
  transactions: Array<{
    date: string; description: string; amount: number;
    type: string; notes?: string | null;
    categories?: { name: string } | null;
    accounts?: { name: string } | null;
  }>
): string {
  const header = "Data,Descrição,Tipo,Valor,Categoria,Conta,Notas";
  const rows = transactions.map(t =>
    [
      t.date,
      `"${t.description}"`,
      t.type === "income" ? "Receita" : t.type === "expense" ? "Gasto" : "Transferência",
      t.amount.toFixed(2).replace(".",","),
      t.categories?.name ?? "",
      t.accounts?.name ?? "",
      `"${t.notes ?? ""}"`,
    ].join(",")
  );
  return [header, ...rows].join("\n");
}
