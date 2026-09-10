import type { Metadata } from "next";
import { AdventureGame } from "@/components/adventure/adventure-game";
import "./wuxia.css";

export const metadata: Metadata = { title: "江湖历练 · 集市鉴宝样板" };
export default function AdventurePage() { return <AdventureGame />; }
