"use client";

import { useDeferredValue, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { vocabulary } from "@/content/vocabulary/zh-CN";
import { Badge } from "@/components/ui/badge";

export function GlossaryExplorer() {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("ALL");
  const deferred = useDeferredValue(query.trim().toLocaleLowerCase());
  const filtered = vocabulary.filter((item) => (priority === "ALL" || item.priority === priority) && [item.english, item.chinese, item.beginnerMeaning].some((value) => value.toLocaleLowerCase().includes(deferred)));
  return <div><div className="grid gap-3 rounded-2xl border bg-surface p-4 sm:grid-cols-[1fr_160px]"><label className="relative"><span className="sr-only">搜索术语</span><MagnifyingGlass className="pointer-events-none absolute start-3 top-3.5 text-muted-foreground" aria-hidden /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 Pull Request、合并、Clone..." className="min-h-11 w-full rounded-[10px] border bg-background ps-10 pe-3 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></label><label><span className="sr-only">术语权重</span><select value={priority} onChange={(event) => setPriority(event.target.value)} className="min-h-11 w-full rounded-[10px] border bg-background px-3"><option value="ALL">全部权重</option><option>P0</option><option>P1</option><option>P2</option></select></label></div>
    <p className="my-5 text-sm text-muted-foreground">找到 {filtered.length} 个词条。定义最后核验于 2026-09-10，界面位置可能变化。</p>
    {filtered.length ? <div className="grid gap-4 lg:grid-cols-2">{filtered.map((term) => <article key={term.id} className="rounded-2xl border bg-surface p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-mono text-xl font-bold">{term.english}</h2><p className="mt-1 font-semibold text-primary">{term.chinese}</p></div><div className="flex gap-2"><Badge>{term.priority}</Badge><Badge>{term.kind}</Badge></div></div>{term.literalTranslation && term.literalTranslation !== term.chinese ? <p className="mt-4 text-sm text-muted-foreground">字面翻译：{term.literalTranslation}</p> : null}<p className="mt-4 leading-7">{term.beginnerMeaning}</p><details className="mt-4 rounded-[10px] bg-muted p-4"><summary className="cursor-pointer font-semibold">用法、误区与官方依据</summary><div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground"><p><strong className="text-foreground">作用：</strong>{term.purpose}</p><p><strong className="text-foreground">任务：</strong>{term.currentStoryExample}</p><p><strong className="text-foreground">常见错误：</strong>{term.commonMistakes[0]}</p><a href={term.sourceUrl} target="_blank" rel="noreferrer" className="inline-block font-semibold text-primary">{term.sourceTitle}</a></div></details></article>)}</div> : <div className="rounded-2xl border bg-surface p-10 text-center"><h2 className="text-xl font-bold">没有找到对应词条</h2><p className="mt-2 text-muted-foreground">尝试英文、中文或更短的关键词。</p></div>}
  </div>;
}
