"use client";

import { useAccount } from "@/hooks/useAccount";
import { usePriceFeed } from "@/hooks/usePriceFeed";
import { useSkew } from "@/hooks/useSkew";
import { useStore } from "@/state/store";
import { MAX_LEVERAGE } from "@/lib/constants";
import { fmt } from "@/lib/format";

export default function OrderPanel() {
  const { connected, connect } = useAccount();
  const { price } = usePriceFeed();
  const { skew } = useSkew();

  const side = useStore((s) => s.side);
  const setSide = useStore((s) => s.setSide);
  const orderType = useStore((s) => s.orderType);
  const setOrderType = useStore((s) => s.setOrderType);
  const collateral = useStore((s) => s.collateral);
  const setCollateral = useStore((s) => s.setCollateral);
  const leverage = useStore((s) => s.leverage);
  const setLeverage = useStore((s) => s.setLeverage);
  const tp = useStore((s) => s.tp);
  const setTp = useStore((s) => s.setTp);
  const sl = useStore((s) => s.sl);
  const setSl = useStore((s) => s.setSl);
  const openPosition = useStore((s) => s.openPosition);

  const notional = (parseFloat(collateral) || 0) * leverage;
  const size = price > 0 ? notional / price : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide("long")}
          className={`rounded-lg py-2 font-semibold transition ${
            side === "long"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Long
        </button>
        <button
          onClick={() => setSide("short")}
          className={`rounded-lg py-2 font-semibold transition ${
            side === "short"
              ? "bg-rose-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Short
        </button>
      </div>

      <div className="mt-3 flex gap-4 border-b border-zinc-800 pb-2 text-sm">
        {(["market", "limit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={
              orderType === t
                ? "font-medium text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }
          >
            {t === "market" ? "Market" : "Limit"}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-zinc-600">
          TP/SL optional below
        </span>
      </div>

      <label className="mt-3 block text-xs text-zinc-400">
        Collateral (USDC)
      </label>
      <input
        value={collateral}
        onChange={(e) => setCollateral(e.target.value)}
        type="number"
        min="0"
        placeholder="0.00"
        className="mt-1 w-full rounded-lg bg-zinc-800 p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
      />

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Leverage</span>
          <span className="font-medium text-zinc-200">{leverage}&times;</span>
        </div>
        <input
          type="range"
          min={1}
          max={MAX_LEVERAGE}
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="mt-1 w-full accent-indigo-500"
        />
        <div className="mt-1 flex gap-1">
          {[1, 5, 10, 15, 20].map((x) => (
            <button
              key={x}
              onClick={() => setLeverage(x)}
              className={`flex-1 rounded py-1 text-xs transition ${
                leverage === x
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {x}&times;
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-zinc-400">Take profit</label>
          <input
            value={tp}
            onChange={(e) => setTp(e.target.value)}
            type="number"
            placeholder="Price"
            className="mt-1 w-full rounded-lg bg-zinc-800 p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">Stop loss</label>
          <input
            value={sl}
            onChange={(e) => setSl(e.target.value)}
            type="number"
            placeholder="Price"
            className="mt-1 w-full rounded-lg bg-zinc-800 p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mt-3 flex justify-between text-xs text-zinc-400">
        <span>
          Size (BTC){" "}
          <span className="text-zinc-600">auto from collateral</span>
        </span>
        <span className="tabular-nums text-zinc-200">{fmt(size, 4)}</span>
      </div>

      <button
        onClick={() => (connected ? openPosition() : connect())}
        disabled={connected && (parseFloat(collateral) || 0) <= 0}
        className={`mt-4 w-full rounded-lg py-2.5 font-semibold text-white transition disabled:opacity-40 ${
          side === "long"
            ? "bg-emerald-600 hover:bg-emerald-500"
            : "bg-rose-600 hover:bg-rose-500"
        }`}
      >
        {connected
          ? `Open ${side === "long" ? "Long" : "Short"}`
          : "Connect wallet"}
      </button>
      <p className="mt-2 text-center text-[11px] text-zinc-600">
        Order type: {orderType} &middot; skew {fmt(skew * 100, 1)}%
      </p>
    </div>
  );
}
