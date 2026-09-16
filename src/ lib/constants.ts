export const BASE_FEE = 0.001; // 0.10% taker fee
export const SKEW_CAP = 0.8; // 80% one-sided OI exposure cap
export const MAX_FEE_MULT = 10; // max adaptive fee multiplier at the cap
export const MAX_LEVERAGE = 20;
export const START_PRICE = 2000; // demo mark price (testnet-style)
export const FUNDING_RATE = -0.00003; // -0.003% / hr
export const FUNDING_INTERVAL = 3600; // seconds between funding settlements
export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
