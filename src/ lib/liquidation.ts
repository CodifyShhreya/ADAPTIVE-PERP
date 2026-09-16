/**
 * Simplified liquidation price for an isolated-margin position.
 * Position is liquidated when price moves ~1/leverage against it,
 * leaving a maintenance-margin buffer (mmr).
 */
export function liqPrice(
  entry: number,
  leverage: number,
  side: "long" | "short",
  mmr = 0.005
): number {
  const buffer = 1 / leverage - mmr;
  return side === "long" ? entry * (1 - buffer) : entry * (1 + buffer);
}
