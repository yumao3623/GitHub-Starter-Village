import type { Metadata } from "next";
import { WuxiaGame } from "@/components/adventure/wuxia-game";
import "./wuxia.css";
import "./contribution.css";
import "./journey.css";
import "./campaign.css";

export const metadata: Metadata = { title: "云溪谷 · 武侠 GitHub 页游" };
export default function AdventurePage() { return <WuxiaGame />; }
