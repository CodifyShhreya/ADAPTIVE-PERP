"use client";

import { useStore } from "@/state/store";
import { fmt } from "@/lib/format";

interface Level {
  price: number;
  size: number;
  total: number;
}

function Row({ level, side, max }: { level: Level; side: "ask" | "bid"; max: number }) {
  const depth = (level.size / max) * 100;
  return (
    <div className="relative grid grid-cols-3 px-2 py-0.5 text-xs tabular-nums">
      <span
        className={`absolute inset-y-0 right-0 ${
          side === "ask" ? "bg-rose-500/10" : "bg-emerald-500/10"
        }`}
        style={{ width: depth + "%" }}
      />
      <span className={`relative ${side === "ask" ? "text-rose-400" : "text-emerald-400"}`}>
        {fmt(level.price)}
      </span>
      <span className="relative text-right text-zinc-300">{fmt(level.size)}</span>
      <span className="relative text-right text-zinc-500">{fmt(level.total, 0)}</span>
    </div>
  );
}

export default function OrderBook() {
  const book = useStore((s) => s.book);
  const price = useStore((s) => s.price);
  const maxSize = Math.max(
    1,
    ...book.asks.map((l) => l.size),
    ...book.bids.map((l) => l.size)
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="text-sm font-semibold text-zinc-300">Order book</h3>
      <div className="mt-3 grid grid-cols-3 text-[11px] text-zinc-500">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      <div className="mt-1 space-y-0.5">
        {[...book.asks].reverse().map((l) => (
          <Row key={"a" + l.price} level={l} side="ask" max={maxSize} />
        ))}
        <div className="flex items-center justify-between rounded bg-zinc-800/80 px-2 py-1.5 text-sm">
          <span className="font-semibold tabular-nums text-zinc-100">
            {fmt(price)}
          </span>
          <span className="text-[10px] uppercase text-zinc-500">spread</span>
        </div>
        {book.bids.map((l) => (
          <Row key={"b" + l.price} level={l} side="bid" max={maxSize} />
        ))}
      </div>
    </div>
  );
}
