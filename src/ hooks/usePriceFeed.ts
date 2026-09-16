import { useStore } from "@/state/store";

export function usePriceFeed() {
  const price = useStore((s) => s.price);
  const history = useStore((s) => s.history);
  const timeframe = useStore((s) => s.timeframe);
  const setTimeframe = useStore((s) => s.setTimeframe);
  return { price, history, timeframe, setTimeframe };
}
