"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";

export function TonConnectProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    //<TonConnectUIProvider manifestUrl="https://uncritically-unadducible-gael.ngrok-free.dev/tonconnect-manifest.json">
    <TonConnectUIProvider manifestUrl="https://miniappteste.vercel.app/">
      {children}
    </TonConnectUIProvider>
  );
}
