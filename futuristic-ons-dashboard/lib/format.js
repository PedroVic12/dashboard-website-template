/**
 * Format a number with locale-safe dot-separated thousands.
 * Uses a fixed locale ("pt-BR") to avoid server/client hydration mismatches.
 */
export function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return String(value);
  return value.toLocaleString("pt-BR");
}
