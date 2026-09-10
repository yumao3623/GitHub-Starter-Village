import type { Metadata } from "next";
import { GlossaryExplorer } from "@/components/vocabulary/glossary-explorer";

export const metadata: Metadata = { title: "GitHub 英文词典" };
export default function GlossaryPage() { return <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"><h1 className="text-4xl font-black tracking-tight">GitHub 英文词典</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">不是逐字翻译表。每个词条说明它是什么、为什么存在、在当前任务中怎么用，以及最容易和什么混淆。</p><div className="mt-9"><GlossaryExplorer /></div></div>; }
