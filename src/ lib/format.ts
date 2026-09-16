export function fmt(n: number, dp = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

export function fmtUSD(n: number, dp = 2): string {
  return "$" + fmt(n, dp);
}
