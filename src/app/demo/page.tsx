import type { Metadata } from "next";
import { GameWorkbench } from "@/components/workbench/game-workbench";

export const metadata: Metadata = { title: "录屏演示模式" };
export default function DemoPage() { return <GameWorkbench demo />; }
