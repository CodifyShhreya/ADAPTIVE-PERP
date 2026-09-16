import { BASE_FEE, MAX_FEE_MULT, SKEW_CAP } from "./constants";

/** Open-interest skew in [0,1]: fraction of OI that is long. */
export function oiSkew(longOI: number, shortOI: number): number {
  const total = longOI + shortOI;
  return total === 0 ? 0.5 : longOI / total;
}

/**
 * Adaptive fee multiplier.
 * The crowded side pays up to MAX_FEE_MULT x base fee as skew approaches
 * the SKEW_CAP; the uncrowded side keeps the base fee.
 */
export function feeMultiplier(skew: number, side: "long" | "short"): number {
  const crowded = side === "long" ? skew : 1 - skew;
  if (crowded <= 0.5) return 1;
  const mult =
    1 + ((MAX_FEE_MULT - 1) * (crowded - 0.5)) / (SKEW_CAP - 0.5);
  return Math.min(mult, MAX_FEE_MULT);
}

/** Dollar entry fee for a notional size given current skew. */
export function entryFee(
  notional: number,
  skew: number,
  side: "long" | "short"
): number {
  return notional * BASE_FEE * feeMultiplier(skew, side);
}
