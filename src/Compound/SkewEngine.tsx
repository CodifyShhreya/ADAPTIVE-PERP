"use client";

import { useSkew } from "@/hooks/useSkew";
import { fmt } from "@/lib/format";

export default function SkewEngine() {
  const { skew, longMult, shortMult, longFee, shortFee, cap } = useSkew();
  const longPct = skew * 100;
  const shortPct = 100 - longPct;
  const crowded = skew > 0.6 ? "long" : skew < 0.4 ? "short" : null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <h3 className="text-sm font-semibold text-zinc-300">Skew engine</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-emerald-400">
          live
        </span>
      </div>

      <div className="mt-3 flex justify-between text-xs text-zinc-400">
        <span>OI Skew</span>
        <span>
          <span className="text-emerald-400">L {fmt(longPct, 0)}%</span>
          {" / "}
          <span className="text-rose-400">S {fmt(shortPct, 0)}%</span>
        </span>
      </div>
      <div className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: longPct + "%" }}
        />
        <div
          className="bg-rose-500 transition-all duration-500"
          style={{ width: shortPct + "%" }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <div className="text-xs text-zinc-500">Long fee</div>
          <div className="text-emerald-400">
            {fmt(longFee * 100, 3)}%{" "}
            <span className="text-zinc-500">&times;{fmt(longMult, 1)}</span>
          </div>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <div className="text-xs text-zinc-500">Short fee</div>
          <div className="text-rose-400">
            {fmt(shortFee * 100, 3)}%{" "}
            <span className="text-zinc-500">&times;{fmt(shortMult, 1)}</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        {crowded === "long"
          ? `Skew ${fmt(longPct, 0)}% &mdash; approaching ${fmt(cap * 100, 0)}% exposure cap. Long positions incur elevated fees.`
          : crowded === "short"
            ? `Skew ${fmt(longPct, 0)}% &mdash; short side crowded. Short positions incur elevated fees.`
            : "Skew balanced &mdash; both sides trade near the base 0.10% fee."}
      </p>
    </div>
  );
}
