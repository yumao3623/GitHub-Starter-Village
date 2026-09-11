import Link from "next/link";
import { FieldPractice } from "@/components/capstone/field-practice";
import { practiceCommands, practiceSources } from "@/content/scenarios/field-practice";
export const metadata = { title: "出师实战 · 自己的 Fork" };
export default function FieldPracticePage() {
  return <div className="mx-auto max-w-4xl px-6 py-12"><p className="text-muted-foreground">阶段 C · 从模拟回到真实世界</p><h1 className="my-4 text-4xl font-bold">出师实战，只在自己的 Fork</h1><p className="leading-8">桌面安装包不等于源码 Clone。练习前需要 GitHub 账号、自己的 Fork，以及 GitHub Desktop 或 Git。全程不需要向原项目提交 PR，也不要求 Star、赞助、启用 Actions 或付费。真实账号操作只发生在 GitHub 官方网站或 Desktop。</p><Link className="my-5 inline-block underline" href="/start/">还没有 Fork / Clone？先完成第零章 →</Link>
    <FieldPractice/>
    <details className="my-8 rounded-xl border p-5"><summary>命令行路线 · 逐条执行，不整段粘贴</summary><p className="my-4">先确认终端所在目录。文件内容可用编辑器查看；无需输入任何凭据到游戏。任何失败先停下阅读提示，不加 --force。没有 upstream 远端也可以完成本练习。</p><pre className="overflow-auto whitespace-pre-wrap text-sm leading-7">{practiceCommands}</pre></details>
    <section className="my-8"><h2 className="text-2xl font-bold">卡住时，先保留现场</h2><p className="my-4 leading-8">没有可比较内容：检查是否在练习分支保存、Commit 并 Push。认证失败：在 Desktop 重新连接官方账号，或查看官方 HTTPS 认证文档；不要把账号密码当 Git 密码。找不到合并按钮：核对仓库所有者与规则，不能绕过。误向原仓库开了 PR：不要合并，关闭它并在自己的 Fork 重建。公开仓库提交可被他人看到；若误提交秘密，立即按官方指导撤销该秘密，仅删除文件不够。</p><h2 className="text-2xl font-bold">官方依据</h2><p className="my-3">流程核验：2026-09-11。界面随平台更新，以官方说明为准。</p>{practiceSources.map(([title,url]) => <a className="mb-3 block underline" key={url} href={url} target="_blank" rel="noreferrer">{title}</a>)}</section>
    <Link className="underline" href="/adventure/">返回江湖与本机存档 →</Link></div>;
}
