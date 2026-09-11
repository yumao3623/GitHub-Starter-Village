"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { GameProvider } from "@/components/game/game-provider";

export function SiteFrame({ children, header, footer }: { children: ReactNode; header: ReactNode; footer: ReactNode }) {
  const path = usePathname();
  if (path === "/" || path === "/demo" || path === "/demo/" || path === "/map" || path === "/map/" || path === "/adventure" || path === "/adventure/" || path === "/adventure-demo" || path === "/adventure-demo/") return <main>{children}</main>;
  return <GameProvider>{header}<main>{children}</main>{footer}</GameProvider>;
}
