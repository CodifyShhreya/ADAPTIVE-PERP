import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adaptive Perp DEX",
  description:
    "Perpetual futures DEX demo with an adaptive skew-based fee engine. Simulated funds — educational purposes only.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
