"use client";

import { useStore } from "@/state/store";
import { fmt, fmtUSD } from "@/lib/format";

export default function PositionsTable() {
  const positions = useStore((s) => s.positions);
  const price = useStore((s) => s.price);
  const closePosition = useStore((s) => s.closePosition);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="text-sm font-semibold text-zinc-300">Positions</h3>
      {positions.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-600">No open positions.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {positions.map((p) => {
            const dir = p.side === "long" ? 1 : -1;
            const pnl = dir * p.size * (price - p.entry);
            return (
              <div
                key={p.id}
                className="rounded-lg bg-zinc-800/60 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={
                      p.side === "long"
                        ? "font-semibold text-emerald-400"
                        : "font-semibold text-rose-400"
                    }
                  >
                    {p.side === "long" ? "LONG" : "SHORT"} {fmt(p.size, 4)} BTC
                    &middot; {p.leverage}&times;
                  </span>
                  <button
                    onClick={() => closePosition(p.id)}
                    className="rounded bg-zinc-700 px-2 py-0.5 text-zinc-300 hover:bg-zinc-600"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-zinc-500">
                  <span>
                    Entry{" "}
                    <b className="block font-medium tabular-nums text-zinc-300">
                      {fmt(p.entry)}
                    </b>
                  </span>
                  <span>
                    Liq{" "}
                    <b className="block font-medium tabular-nums text-zinc-300">
                      {fmt(p.liq)}
                    </b>
                  </span>
                  <span>
                    PnL{" "}
                    <b
                      className={`block font-medium tabular-nums ${
                        pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {fmtUSD(pnl)}
                    </b>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
