export const money = (value: number, compact = true) =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard"
  }).format(value || 0);

export const percent = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;
export const titleCase = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
