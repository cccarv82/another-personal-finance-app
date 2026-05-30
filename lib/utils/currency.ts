export function formatCurrency(
  value: number,
  currency = "BRL",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatCompact(value: number, currency = "BRL"): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return (
      (value < 0 ? "-" : "") +
      formatCurrency(abs / 1_000_000, currency, {
        maximumFractionDigits: 1,
      }).replace(/,\d+$/, (m) => m) +
      "M"
    );
  }
  if (abs >= 1_000) {
    return (
      (value < 0 ? "-" : "") +
      formatCurrency(abs / 1_000, currency, {
        maximumFractionDigits: 1,
      }) +
      "K"
    );
  }
  return formatCurrency(value, currency);
}

export function parseBRLInput(value: string): number {
  // Handles "1.234,56" → 1234.56
  return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
}

export function formatBRLInput(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
