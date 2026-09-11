import type { Metadata } from "next";
import { AdventureGame } from "@/components/adventure/adventure-game";
import "./wuxia.css";
import "./contribution.css";

export const metadata: Metadata = { title: "江湖历练 · 夜行图贡献链" };
export default function AdventurePage() { return <AdventureGame />; }
