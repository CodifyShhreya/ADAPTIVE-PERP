"use client";

import { usePriceFeed } from "@/hooks/usePriceFeed";
import { useSkew } from "@/hooks/useSkew";
import { useStore } from "@/state/store";
import { entryFee } from "@/lib/fees";
import { liqPrice } from "@/lib/liquidation";
import { fmtUSD } from "@/lib/format";

export default function OrderPreview() {
  const { price } = usePriceFeed();
  const { skew } = useSkew();
  const collateral = parseFloat(useStore((s) => s.collateral)) || 0;
  const leverage = useStore((s) => s.leverage);
  const side = useStore((s) => s.side);
  const free = useStore((s) => s.free);

  const notional = collateral * leverage;
  const fee = entryFee(notional, skew, side);
  const liq = liqPrice(price, leverage, side);

  const rows: [string, string][] = [
    ["Trade bias", side === "long" ? "Profits if BTC rises" : "Profits if BTC falls"],
    ["Notional", fmtUSD(notional)],
    ["Margin used", fmtUSD(collateral)],
    ["Entry fee", fmtUSD(fee)],
    ["Est. liq. price", fmtUSD(liq)],
    ["Free collateral left", fmtUSD(Math.max(0, free - collateral - fee))],
  ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="text-sm font-semibold text-zinc-300">Order preview</h3>
      <dl className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <dt className="text-zinc-500">{k}</dt>
            <dd
              className={
                k === "Trade bias"
                  ? side === "long"
                    ? "text-emerald-400"
                    : "text-rose-400"
                  : "tabular-nums text-zinc-200"
              }
            >
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
