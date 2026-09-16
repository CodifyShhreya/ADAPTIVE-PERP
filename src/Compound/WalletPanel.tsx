"use client";

import { useState } from "react";
import { useAccount } from "@/hooks/useAccount";
import { fmtUSD } from "@/lib/format";

export default function WalletPanel() {
  const {
    free,
    locked,
    total,
    connected,
    address,
    connect,
    disconnect,
    deposit,
    withdraw,
  } = useAccount();
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    if (tab === "deposit") deposit(n);
    else withdraw(n);
    setAmount("");
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">Account</h3>
        {connected ? (
          <button
            onClick={disconnect}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            {address?.slice(0, 6)}&hellip;{address?.slice(-4)} &middot; disconnect
          </button>
        ) : (
          <button
            onClick={connect}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Connect wallet
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        {(
          [
            ["Free", free],
            ["Locked", locked],
            ["Total", total],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="rounded-lg bg-zinc-800/60 p-2">
            <div className="text-zinc-500">{k}</div>
            <div className="mt-0.5 text-sm tabular-nums text-zinc-200">
              {fmtUSD(v)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-4 border-b border-zinc-800 pb-2 text-sm">
        {(["deposit", "withdraw"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "font-medium capitalize text-white"
                : "capitalize text-zinc-500 hover:text-zinc-300"
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          placeholder="Amount (USDC)"
          className="w-full rounded-lg bg-zinc-800 p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={submit}
          disabled={!connected}
          className="rounded-lg bg-zinc-700 px-4 text-sm font-medium capitalize text-zinc-100 hover:bg-zinc-600 disabled:opacity-40"
        >
          {tab}
        </button>
      </div>
      {!connected && (
        <p className="mt-2 text-[11px] text-zinc-600">
          Connect a wallet to deposit or withdraw (simulated funds).
        </p>
      )}
    </div>
  );
}
