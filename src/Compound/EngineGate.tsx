"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { startEngine, stopEngine } from "@/state/store";

/** Starts the 1s mock matching-engine tick once the app mounts (client only). */
export default function EngineGate({ children }: { children: ReactNode }) {
  useEffect(() => {
    startEngine();
    return () => stopEngine();
  }, []);

  return <>{children}</>;
}
