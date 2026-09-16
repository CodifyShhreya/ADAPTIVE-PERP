import { useStore } from "@/state/store";

export function useAccount() {
  const free = useStore((s) => s.free);
  const locked = useStore((s) => s.locked);
  const connected = useStore((s) => s.connected);
  const address = useStore((s) => s.address);
  const connect = useStore((s) => s.connect);
  const disconnect = useStore((s) => s.disconnect);
  const deposit = useStore((s) => s.deposit);
  const withdraw = useStore((s) => s.withdraw);
  return {
    free,
    locked,
    total: free + locked,
    connected,
    address,
    connect,
    disconnect,
    deposit,
    withdraw,
  };
}
