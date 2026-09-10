import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flag, MapTrifold } from "@phosphor-icons/react/dist/ssr";
import { missions } from "@/content/missions/zh-CN";

export const metadata: Metadata = { title: "村庄地图" };

export default function MapPage() {
  return <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"><div className="flex items-start gap-4"><MapTrifold size={36} className="mt-1 text-primary" aria-hidden /><div><h1 className="text-4xl font-black tracking-tight">村庄地图</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">四个阶段把真实 GitHub 路线与本地游戏连接起来。章节可以自由查看，毕业仍要求 P0 全部掌握。</p></div></div>
    <div className="mt-12 space-y-12">{[1,2,3].map((phase) => <section key={phase}><h2 className="text-xl font-bold">阶段 {phase}：{phase === 1 ? "进入新手村" : phase === 2 ? "认识 GitHub" : "完成一次开源贡献"}</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{missions.filter((item) => item.phase === phase).map((item) => <Link key={item.id} href={`/play`} className="group rounded-2xl border bg-surface p-5 no-underline transition-colors hover:border-primary"><div className="flex items-center justify-between gap-4"><span className="font-mono text-sm text-primary">第 {item.chapter} 章</span><ArrowRight className="text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden /></div><h3 className="mt-3 text-xl font-bold">{item.title}</h3><p className="mt-2 leading-7 text-muted-foreground">{item.summary}</p><p className="mt-4 text-sm font-semibold">{item.objectives.join(" / ")}</p></Link>)}</div></section>)}</div>
    <section className="mt-14 rounded-2xl bg-foreground p-7 text-background"><Flag size={30} aria-hidden /><h2 className="mt-5 text-2xl font-bold">阶段 4：真实毕业任务</h2><p className="mt-3 max-w-2xl leading-7 opacity-75">回到自己的 Fork，完成 Branch、Commit、Push、Pull Request、Merge 和删除练习分支。默认不向原仓库提交。</p><Link href="/capstone" className="mt-6 inline-flex font-semibold text-background">查看毕业任务</Link></section>
  </div>;
}
