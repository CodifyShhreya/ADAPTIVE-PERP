import { create } from "zustand";
import { FUNDING_INTERVAL, FUNDING_RATE, START_PRICE } from "@/lib/constants";
import { entryFee, oiSkew } from "@/lib/fees";
import { liqPrice } from "@/lib/liquidation";

export type Side = "long" | "short";
export type OrderType = "market" | "limit";

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface Position {
  id: string;
  side: Side;
  size: number;
  entry: number;
  leverage: number;
  margin: number; // collateral + entry fee (locked)
  notional: number;
  liq: number;
  tp?: number;
  sl?: number;
}

export interface BookLevel {
  price: number;
  size: number;
  total: number; // size x price (level notional)
}

const TF_SECONDS: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};

/** Deterministic PRNG so server and client render identical initial state. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function genHistory(tf: string, endPrice: number, seed = 1337): Candle[] {
  const rng = mulberry32(seed);
  const stepMs = (TF_SECONDS[tf] ?? 60) * 1000;
  const now = Date.now();
  let p = endPrice * (0.97 + rng() * 0.03);
  const out: Candle[] = [];
  for (let i = 79; i >= 0; i--) {
    const o = p;
    for (let j = 0; j < 8; j++) p += p * (rng() - 0.5) * 0.004;
    const h = Math.max(o, p) * (1 + rng() * 0.001);
    const l = Math.min(o, p) * (1 - rng() * 0.001);
    out.push({ t: now - i * stepMs, o, h, l, c: p });
  }
  return out;
}

function genBook(price: number, rng: () => number = Math.random) {
  const tick = 1.5;
  const asks: BookLevel[] = [];
  const bids: BookLevel[] = [];
  for (let i = 1; i <= 4; i++) {
    const aSize = Math.round((0.5 + rng() * 8.5) * 100) / 100;
    const aPrice = Math.round((price + tick * i) * 100) / 100;
    asks.push({ price: aPrice, size: aSize, total: Math.round(aSize * aPrice) });
    const bSize = Math.round((0.5 + rng() * 8.5) * 100) / 100;
    const bPrice = Math.round((price - tick * i) * 100) / 100;
    bids.push({ price: bPrice, size: bSize, total: Math.round(bSize * bPrice) });
  }
  return { asks, bids };
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return "p_" + Date.now().toString(36) + "_" + idCounter;
}

interface StoreState {
  connected: boolean;
  address: string | null;
  price: number;
  history: Candle[];
  timeframe: string;
  book: { asks: BookLevel[]; bids: BookLevel[] };
  longOI: number;
  shortOI: number;
  fundingRate: number;
  fundingCountdown: number;
  free: number;
  locked: number;
  side: Side;
  orderType: OrderType;
  collateral: string;
  leverage: number;
  tp: string;
  sl: string;
  positions: Position[];
  tick: () => void;
  setTimeframe: (tf: string) => void;
  setSide: (s: Side) => void;
  setOrderType: (t: OrderType) => void;
  setCollateral: (v: string) => void;
  setLeverage: (n: number) => void;
  setTp: (v: string) => void;
  setSl: (v: string) => void;
  connect: () => void;
  disconnect: () => void;
  deposit: (n: number) => void;
  withdraw: (n: number) => void;
  openPosition: () => void;
  closePosition: (id: string, atPrice?: number) => void;
}

export const useStore = create<StoreState>()((set, get) => ({
  connected: false,
  address: null,
  price: START_PRICE,
  history: genHistory("1m", START_PRICE),
  timeframe: "1m",
  book: genBook(START_PRICE, mulberry32(42)),
  longOI: 0,
  shortOI: 0,
  fundingRate: FUNDING_RATE,
  fundingCountdown: FUNDING_INTERVAL,
  free: 0,
  locked: 0,
  side: "long",
  orderType: "market",
  collateral: "",
  leverage: 20,
  tp: "",
  sl: "",
  positions: [],

  setTimeframe: (tf) => set({ timeframe: tf, history: genHistory(tf, get().price) }),
  setSide: (side) => set({ side }),
  setOrderType: (orderType) => set({ orderType }),
  setCollateral: (collateral) => set({ collateral }),
  setLeverage: (leverage) => set({ leverage }),
  setTp: (tp) => set({ tp }),
  setSl: (sl) => set({ sl }),

  connect: () =>
    set({
      connected: true,
      address:
        "0x" +
        Math.random().toString(16).slice(2, 10) +
        Math.random().toString(16).slice(2, 10),
    }),
  disconnect: () => set({ connected: false, address: null }),
  deposit: (n) => set({ free: get().free + n }),
  withdraw: (n) => {
    const s = get();
    if (s.free >= n) set({ free: s.free - n });
  },

  openPosition: () => {
    const s = get();
    const collateral = parseFloat(s.collateral) || 0;
    if (!s.connected || collateral <= 0 || s.price <= 0) return;
    const notional = collateral * s.leverage;
    const fee = entryFee(notional, oiSkew(s.longOI, s.shortOI), s.side);
    if (s.free < collateral + fee) return;
    const size = notional / s.price;
    const pos: Position = {
      id: nextId(),
      side: s.side,
      size,
      entry: s.price,
      leverage: s.leverage,
      margin: collateral + fee,
      notional,
      liq: liqPrice(s.price, s.leverage, s.side),
      tp: s.tp ? parseFloat(s.tp) : undefined,
      sl: s.sl ? parseFloat(s.sl) : undefined,
    };
    set({
      free: s.free - collateral - fee,
      locked: s.locked + collateral + fee,
      positions: [...s.positions, pos],
      longOI: s.longOI + (s.side === "long" ? notional : 0),
      shortOI: s.shortOI + (s.side === "short" ? notional : 0),
      collateral: "",
    });
  },

  closePosition: (id, atPrice) => {
    const s = get();
    const p = s.positions.find((x) => x.id === id);
    if (!p) return;
    const exit = atPrice ?? s.price;
    const dir = p.side === "long" ? 1 : -1;
    const pnl = dir * p.size * (exit - p.entry);
    set({
      free: s.free + p.margin + pnl,
      locked: Math.max(0, s.locked - p.margin),
      positions: s.positions.filter((x) => x.id !== id),
      longOI: Math.max(0, s.longOI - (p.side === "long" ? p.notional : 0)),
      shortOI: Math.max(0, s.shortOI - (p.side === "short" ? p.notional : 0)),
    });
  },

  tick: () => {
    const s = get();
    const price = Math.max(1, s.price + s.price * (Math.random() - 0.5) * 0.0022);

    // --- candles ---
    const stepMs = (TF_SECONDS[s.timeframe] ?? 60) * 1000;
    const now = Date.now();
    let history = s.history.slice();
    const last = history[history.length - 1];
    if (now - last.t >= stepMs) {
      history.push({
        t: now,
        o: last.c,
        h: Math.max(last.c, price),
        l: Math.min(last.c, price),
        c: price,
      });
      if (history.length > 90) history = history.slice(-90);
    } else {
      history[history.length - 1] = {
        ...last,
        h: Math.max(last.h, price),
        l: Math.min(last.l, price),
        c: price,
      };
    }

    // --- funding ---
    let fundingCountdown = s.fundingCountdown - 1;
    let free = s.free;
    if (fundingCountdown <= 0) {
      fundingCountdown = FUNDING_INTERVAL;
      for (const p of s.positions) {
        const dir = p.side === "long" ? 1 : -1;
        free += dir * p.notional * s.fundingRate; // negative rate: longs receive
      }
    }

    // --- TP / SL / liquidation ---
    const remaining: Position[] = [];
    let locked = s.locked;
    let longOI = s.longOI;
    let shortOI = s.shortOI;
    for (const p of s.positions) {
      const dir = p.side === "long" ? 1 : -1;
      const liqHit = p.side === "long" ? price <= p.liq : price >= p.liq;
      const tpHit =
        p.tp !== undefined && (p.side === "long" ? price >= p.tp : price <= p.tp);
      const slHit =
        p.sl !== undefined && (p.side === "long" ? price <= p.sl : price >= p.sl);
      if (liqHit) {
        // locked margin is lost to the insurance fund
        locked = Math.max(0, locked - p.margin);
        longOI = Math.max(0, longOI - (p.side === "long" ? p.notional : 0));
        shortOI = Math.max(0, shortOI - (p.side === "short" ? p.notional : 0));
        continue;
      }
      if (tpHit || slHit) {
        const exit = tpHit ? (p.tp as number) : (p.sl as number);
        free += p.margin + dir * p.size * (exit - p.entry);
        locked = Math.max(0, locked - p.margin);
        longOI = Math.max(0, longOI - (p.side === "long" ? p.notional : 0));
        shortOI = Math.max(0, shortOI - (p.side === "short" ? p.notional : 0));
        continue;
      }
      remaining.push(p);
    }

    set({
      price,
      history,
      fundingCountdown,
      free,
      locked,
      longOI,
      shortOI,
      positions: remaining,
      book: genBook(price),
    });
  },
}));

// --- mock matching engine loop (client only) ---
let timer: ReturnType<typeof setInterval> | null = null;

export function startEngine() {
  if (!timer) timer = setInterval(() => useStore.getState().tick(), 1000);
}

export function stopEngine() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
