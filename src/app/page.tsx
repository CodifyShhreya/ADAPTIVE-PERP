import Chart from "@/components/Chart";
import EngineGate from "@/components/EngineGate";
import FundingBar from "@/components/FundingBar";
import OrderBook from "@/components/OrderBook";
import OrderPanel from "@/components/OrderPanel";
import OrderPreview from "@/components/OrderPreview";
import PositionsTable from "@/components/PositionsTable";
import SkewEngine from "@/components/SkewEngine";
import WalletPanel from "@/components/WalletPanel";

export default function Page() {
  return (
    <EngineGate>
      <div className="min-h-screen bg-[#0b0e11] text-zinc-200">
        <header className="border-b border-zinc-800">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <h1 className="text-sm font-bold tracking-wide">Adaptive Perp DEX</h1>
            </div>
            <FundingBar />
            <span className="ml-auto rounded-full border border-zinc-800 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
              demo &middot; simulated funds
            </span>
          </div>
        </header>

        <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 p-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Chart />
            <OrderBook />
          </div>
          <div className="flex flex-col gap-4">
            <SkewEngine />
            <OrderPanel />
            <OrderPreview />
            <WalletPanel />
            <PositionsTable />
          </div>
        </main>

        <footer className="mx-auto max-w-[1400px] px-4 pb-6 text-[11px] text-zinc-600">
          Educational demo. Prices, funding and balances are simulated locally in
          your browser &mdash; no real funds, no blockchain interaction.
        </footer>
      </div>
    </EngineGate>
  );
}
