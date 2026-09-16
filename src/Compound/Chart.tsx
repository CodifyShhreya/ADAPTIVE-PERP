"use client";

import { useMemo } from "react";
import { usePriceFeed } from "@/hooks/usePriceFeed";
import { TIMEFRAMES } from "@/lib/constants";
import { fmt } from "@/lib/format";

const W = 720;
const H = 300;
const PAD = 10;
const AXIS = 56;

export default function Chart() {
  const { price, history, timeframe, setTimeframe } = usePriceFeed();
  const candles = useMemo(() => history.slice(-72), [history]);

  const { min, max } = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (const c of candles) {
      mn = Math.min(mn, c.l);
      mx = Math.max(mx, c.h);
    }
    if (!isFinite(mn)) {
      mn = price - 5;
      mx = price + 5;
    }
    const pad = (mx - mn) * 0.08 || 1;
    return { min: mn - pad, max: mx + pad };
  }, [candles, price]);

  const y = (v: number) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
  const step = (W - AXIS) / candles.length;
  const bw = Math.max(2, step * 0.6);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-semibold text-zinc-200">BTC-PERP</h3>
        <span className="text-sm font-semibold tabular-nums text-zinc-100">
          {fmt(price)}
        </span>
        <div className="ml-auto flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded px-2 py-1 text-xs transition ${
                timeframe === tf
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
        {[0.25, 0.5, 0.75].map((f) => {
          const v = min + (max - min) * f;
          return (
            <g key={f}>
              <line
                x1={0}
                x2={W - AXIS}
                y1={y(v)}
                y2={y(v)}
                stroke="#27272a"
                strokeWidth={1}
              />
              <text x={W - AXIS + 6} y={y(v) + 3} fill="#71717a" fontSize={10}>
                {fmt(v)}
              </text>
            </g>
          );
        })}

        {candles.map((c, i) => {
          const x = i * step + step / 2;
          const up = c.c >= c.o;
          const col = up ? "#10b981" : "#f43f5e";
          return (
            <g key={c.t}>
              <line
                x1={x}
                x2={x}
                y1={y(c.h)}
                y2={y(c.l)}
                stroke={col}
                strokeWidth={1}
              />
              <rect
                x={x - bw / 2}
                y={y(Math.max(c.o, c.c))}
                width={bw}
                height={Math.max(1, Math.abs(y(c.o) - y(c.c)))}
                fill={col}
                rx={1}
              />
            </g>
          );
        })}

        <line
          x1={0}
          x2={W - AXIS}
          y1={y(price)}
          y2={y(price)}
          stroke="#818cf8"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={W - AXIS + 6}
          y={y(price) + 3}
          fill="#a5b4fc"
          fontSize={10}
          fontWeight={600}
        >
          {fmt(price)}
        </text>
      </svg>
    </div>
  );
}
