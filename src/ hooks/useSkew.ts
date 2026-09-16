import { useStore } from "@/state/store";
import { BASE_FEE, SKEW_CAP } from "@/lib/constants";
import { feeMultiplier, oiSkew } from "@/lib/fees";

export function useSkew() {
  const longOI = useStore((s) => s.longOI);
  const shortOI = useStore((s) => s.shortOI);
  const skew = oiSkew(longOI, shortOI);
  const longMult = feeMultiplier(skew, "long");
  const shortMult = feeMultiplier(skew, "short");
  return {
    skew,
    longMult,
    shortMult,
    longFee: BASE_FEE * longMult,
    shortFee: BASE_FEE * shortMult,
    cap: SKEW_CAP,
  };
}
