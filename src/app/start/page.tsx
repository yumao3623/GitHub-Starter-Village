import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOut, CheckCircle, Command, Desktop, Globe, ShieldWarning } from "@phosphor-icons/react/dist/ssr";
import { brandConfig } from "@/config/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "从这里开始" };

const routes = [
  { icon: Desktop, title: "GitHub Desktop", note: "新手推荐", steps: ["在 GitHub 官方网站 Fork 本项目", "打开自己账号下的 Fork", "Code → Open with GitHub Desktop", "选择本地目录并点击 Clone"] },
  { icon: Command, title: "命令行", note: "理解 Git", steps: ["安装 Git", "在自己的 Fork 打开 Code → HTTPS", "复制 URL，在终端执行 git clone <URL>", "用 cd 进入项目目录"] },
  { icon: Globe, title: "Codespaces", note: "浏览器运行", steps: ["在自己的 Fork 打开 Code", "选择 Codespaces", "创建开发环境", "留意个人账户的计算与存储额度"] },
];

export default function StartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-3xl"><p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">第零章</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">先把游戏真正带回家</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">这四步发生在真实 GitHub 和你的电脑上。本站只提供指导与自我检查，不接收账号凭据，也不自动验证结果。</p></div>

      <section className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/8 p-5 sm:p-7"><div className="flex gap-4"><ShieldWarning size={28} className="shrink-0 text-destructive" aria-hidden /><div><h2 className="text-xl font-bold">安全边界</h2><p className="mt-2 leading-7">注册、登录、2FA、Passkey 和恢复代码只在 GitHub 官方网站中处理。本项目永远不会要求你输入密码、Personal Access Token、SSH 私钥或 Recovery codes。</p><a href="https://github.com/login" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-semibold text-primary">前往 GitHub 官方登录页 <ArrowSquareOut aria-hidden /></a></div></div></section>

      <section className="mt-14"><h2 className="text-2xl font-bold">先在 GitHub 完成 Fork</h2><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border bg-surface p-6"><span className="font-mono text-sm text-primary">Fork</span><h3 className="mt-3 text-xl font-bold">在你的账号下创建关联副本</h3><ol className="mt-4 space-y-3 leading-7 text-muted-foreground"><li>1. 打开本项目仓库。</li><li>2. 登录 GitHub 后找到右上方 Fork。</li><li>3. 点击 Create fork。</li><li>4. 确认地址变成“你的用户名/{brandConfig.repositoryName}”。</li></ol></div><div className="rounded-2xl border bg-surface p-6"><span className="font-mono text-sm text-primary">不是 Star</span><h3 className="mt-3 text-xl font-bold">收藏不会复制仓库</h3><p className="mt-4 leading-7 text-muted-foreground">Star 是可选收藏，不是解锁条件。Download ZIP 只有当前文件快照，也不具备正常 Git 历史和远程同步关系。</p><a href={brandConfig.repositoryUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">打开仓库地址占位符 <ArrowSquareOut aria-hidden /></a></div></div></section>

      <section className="mt-16"><h2 className="text-2xl font-bold">选择一条复制路线</h2><div className="mt-6 grid gap-5 lg:grid-cols-3">{routes.map(({ icon: Icon, title, note, steps }) => <article key={title} className="rounded-2xl border bg-surface p-6"><Icon size={28} className="text-primary" aria-hidden /><div className="mt-5 flex items-baseline justify-between gap-3"><h3 className="text-xl font-bold">{title}</h3><span className="text-xs text-muted-foreground">{note}</span></div><ol className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">{steps.map((step, index) => <li key={step}><strong className="text-foreground">{index + 1}.</strong> {step}</li>)}</ol></article>)}</div><p className="mt-5 text-sm leading-6 text-muted-foreground">命令行认证提示：GitHub 已移除 Git 操作的账号密码认证。不要把 GitHub 密码当作终端提示中的 Git 密码；优先使用 Desktop、浏览器授权的 Git Credential Manager，或按官方文档配置 HTTPS/SSH。</p></section>

      <section className="mt-16 rounded-2xl bg-foreground p-6 text-background sm:p-9"><h2 className="text-2xl font-bold">运行项目</h2><div className="mt-7 grid gap-7 md:grid-cols-2"><div><h3 className="font-semibold">准备环境</h3><p className="mt-2 leading-7 opacity-75">从 Node.js 官网安装当前 LTS。安装完成后打开终端，进入包含 package.json 的项目目录。</p></div><div className="font-mono text-sm"><p className="rounded-[10px] bg-background/10 p-4">npm run doctor</p><p className="mt-3 rounded-[10px] bg-background/10 p-4">npm install</p><p className="mt-3 rounded-[10px] bg-background/10 p-4">npm run dev</p></div></div><div className="mt-7 border-t border-background/20 pt-6"><p>浏览器打开终端显示的地址，通常是 <code className="font-mono">http://localhost:3000</code>。停止服务器时回到终端按 <kbd className="rounded border border-background/30 px-2 py-1 font-mono">Ctrl + C</kbd>。</p></div></section>

      <section className="mt-14 grid gap-5 md:grid-cols-[1fr_auto] md:items-center"><div><h2 className="text-2xl font-bold">完成自我检查</h2><div className="mt-4 grid gap-2">{["地址栏是 github.com，再处理登录和安全设置", "当前仓库 Owner 是你自己的用户名", "本地目录里能看到 package.json", "localhost 已显示游戏首页"].map((item) => <p key={item} className="flex gap-3"><CheckCircle weight="fill" className="mt-1 shrink-0 text-success" aria-hidden />{item}</p>)}</div></div><Link href="/play" className={cn(buttonVariants({ size: "lg" }), "no-underline")}>进入游戏工作台</Link></section>

      <div className="mt-12 flex flex-wrap gap-5 text-sm"><a href={`${brandConfig.repositoryUrl}/blob/main/docs/START_HERE.md`} target="_blank" rel="noreferrer">查看仓库详细文档</a><a href="https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop" target="_blank" rel="noreferrer">GitHub Desktop 官方指南</a><a href="https://docs.github.com/en/codespaces/quickstart" target="_blank" rel="noreferrer">Codespaces 官方指南</a></div>
    </div>
  );
}
