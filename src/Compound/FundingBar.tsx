"use client";

import { useStore } from "@/state/store";

export default function FundingBar() {
  const fundingRate = useStore((s) => s.fundingRate);
  const countdown = useStore((s) => s.fundingCountdown);

  const h = Math.floor(countdown / 3600);
  const m = Math.floor((countdown % 3600) / 60);
  const sec = countdown % 60;
  const neg = fundingRate < 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-500">Funding:</span>
      <span className={neg ? "text-emerald-400" : "text-rose-400"}>
        {(fundingRate * 100).toFixed(3)}%/hr
      </span>
      <span className="text-zinc-600">&middot;</span>
      <span className="tabular-nums text-zinc-400">
        next {h > 0 ? h + "h " : ""}
        {m}m {String(sec).padStart(2, "0")}s
      </span>
    </div>
  );
}
