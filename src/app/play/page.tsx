import type { Metadata } from "next";
import { GameWorkbench } from "@/components/workbench/game-workbench";

export const metadata: Metadata = { title: "游戏工作台" };
export default function PlayPage() { return <GameWorkbench />; }
