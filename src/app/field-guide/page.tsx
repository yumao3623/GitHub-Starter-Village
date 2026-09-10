import type { Metadata } from "next";

export const metadata: Metadata = { title: "GitHub 页面中文使用手册" };

const guides = [
  ["仓库首页", "Code 页签用于看文件。绿色 Code 按钮用于 Clone、Codespaces 与 ZIP。右侧常见 About、Releases、Packages 和语言信息。"],
  ["分支与历史", "分支选择器显示当前 Branch；提交数量或历史入口用于查看 Commit；文件页可打开 Blame 追踪每行最近变更。"],
  ["Issues", "Open 和 Closed 是状态过滤；Labels 分类；Assignees 表示负责人；Subscribe 控制当前议题通知。"],
  ["Pull Requests", "Conversation 看讨论，Commits 看提交，Checks 看自动检查，Files changed 看完整差异。Base 是目标，Compare 是来源。"],
  ["Actions", "左侧选择 Workflow，中间是 Workflow runs。点进一次运行后查看 Job，再点开具体 Step 和日志。"],
  ["Releases", "Release 是面向使用者的发行记录，通常基于 Tag。不要把源码 ZIP 自动当成适合普通用户的安装包。"],
  ["Security", "安全页可能展示策略、依赖与扫描功能。发现漏洞先读 SECURITY，避免把未修复细节发到公开 Issue。"],
  ["Settings", "个人 Settings 与仓库 Settings 管理范围不同。执行危险操作前先确认当前 Owner 和页面标题。"],
];

export default function FieldGuidePage() { return <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"><h1 className="text-4xl font-black tracking-tight">GitHub 页面中文使用手册</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">按页面职责理解界面，而不是死记坐标。GitHub 会调整布局，英文标签和操作目标更稳定。</p><div className="mt-10 grid gap-5 md:grid-cols-2">{guides.map(([title, text]) => <section key={title} className="rounded-2xl border bg-surface p-6"><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{text}</p></section>)}</div><section className="mt-10 rounded-2xl bg-foreground p-7 text-background"><h2 className="text-xl font-bold">看不懂提示时</h2><p className="mt-3 max-w-3xl leading-7 opacity-75">先找动作、对象、状态和权限四类关键词。不要在不理解的情况下确认删除、强制推送、公开仓库或授权第三方应用。</p></section></div>; }
