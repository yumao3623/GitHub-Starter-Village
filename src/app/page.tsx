import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, GitFork, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { JourneyPreview } from "@/components/landing/journey-preview";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <>
      <aside className="border-b bg-surface px-6 py-3 text-center text-sm">武侠改版阶段 A 已可体验：选角色、探索局部地图、完成一关集市鉴宝。<Link href="/adventure" className="ml-3 font-semibold text-primary underline">进入武侠样板 →</Link></aside>
      <section className="topographic overflow-hidden border-b">
        <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-16">
          <div className="relative z-10">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">中文 GitHub 实战课程</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[1.04] tracking-[-0.045em] sm:text-6xl">把第一次贡献，走成一场冒险。</h1>
            <p className="mt-6 max-w-[54ch] text-lg leading-8 text-muted-foreground">从真实 Fork、Clone 到自己的第一个 Pull Request。每个英文按钮都讲清为什么。</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/start" className={cn(buttonVariants({ size: "lg" }), "no-underline")}>从这里开始 <ArrowRight aria-hidden /></Link>
              <Link href="/demo" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "no-underline")}>观看演示</Link>
            </div>
          </div>
          <div className="relative min-h-[340px] lg:min-h-[580px]">
            <Image src="/brand/starter-village-map.png" alt="原创的开发者新手村路线图，有村门、岔路牌、工坊、公告板、桥和山顶瞭望塔" fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-contain object-center" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">第一关发生在真正的 GitHub</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">找到项目、登录、Fork、Clone、运行。这段路本身就是课程，不会被在线演示跳过。</p></div>
        <div className="mt-12 grid gap-6 md:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-2xl bg-foreground p-7 text-background sm:p-9"><GitFork size={32} aria-hidden /><h3 className="mt-16 text-2xl font-bold">真实复制，安全自证</h3><p className="mt-3 max-w-xl leading-7 opacity-75">所有登录和账号操作都在 GitHub 官方网站完成。项目不接收密码、Token、SSH 私钥或恢复代码。</p></div>
          <div className="rounded-2xl border bg-surface p-7"><ShieldCheck size={32} className="text-primary" aria-hidden /><h3 className="mt-10 text-xl font-bold">不伪造验证</h3><p className="mt-3 leading-7 text-muted-foreground">没有 GitHub API 的第一版只提供检查清单和“我已完成”，不会假装知道你的账号状态。</p></div>
        </div>
      </section>

      <section className="paper-grid border-y bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">不是背单词，是在任务里用懂它</h2><p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">点错会说明原因。中文辅助可以逐步减少，但永远由你决定。</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">{["14 个完整章节", "原创贡献剧情", "P0 结业掌握率 100%", "本地进度不上传"].map((item) => <p key={item} className="flex items-center gap-3 font-semibold"><CheckCircle size={22} weight="fill" className="text-success" aria-hidden />{item}</p>)}</div>
          </div>
          <JourneyPreview />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">从村口到真正的毕业任务</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">{[
          ["进入", "登录、Fork、Clone、运行"], ["认识", "仓库地图、搜索与关注"], ["贡献", "Issue、Branch、PR、Review"], ["毕业", "在自己的 Fork 完成真实闭环"],
        ].map(([title, text]) => <div key={title} className="border-t-2 border-foreground pt-5"><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 leading-7 text-muted-foreground">{text}</p></div>)}</div>
        <Link href="/map" className="mt-12 inline-flex items-center gap-2 font-semibold text-primary">查看完整村庄地图 <ArrowRight aria-hidden /></Link>
      </section>

      <section className="border-t bg-surface"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center"><div><h2 className="text-3xl font-bold">准备好找到仓库入口了吗？</h2><p className="mt-3 text-muted-foreground">先读第零章，再决定 Desktop、命令行或 Codespaces 路线。</p></div><Link href="/start" className={cn(buttonVariants({ size: "lg" }), "no-underline")}>进入第零章</Link></div></section>
    </>
  );
}
