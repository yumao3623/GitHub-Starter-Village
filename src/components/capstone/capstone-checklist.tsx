"use client";

import { useState } from "react";
import { CheckCircle, Warning } from "@phosphor-icons/react";

const steps = [
  ["创建练习分支", "在自己的 Fork 中从 main 创建 `graduation/你的用户名`。"],
  ["新增练习文件", "在 `graduates/practice/` 中按示例新建自己的 Markdown 文件，不写敏感信息。"],
  ["检查并 Commit", "在 Files changed 或 Diff 中确认只修改练习文件，再写清 Commit message。"],
  ["Push 到自己的 Fork", "确认目标 Owner 是你自己，不是原项目仓库。"],
  ["创建 Pull Request", "Base repository 和 Head repository 都选择自己的 Fork，Base branch 选择 main。"],
  ["查看 Files changed", "再次确认没有凭据、个人隐私或无关文件。"],
  ["Merge 并删除分支", "在自己的 Fork 中合并，再删除已完成的练习分支。"],
];

export function CapstoneChecklist() {
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));
  const done = checked.every(Boolean);
  return <div><div className="rounded-2xl border border-warning/40 bg-warning/10 p-5"><p className="flex gap-3 font-semibold"><Warning className="mt-0.5 shrink-0" aria-hidden />这是一份自我检查清单</p><p className="mt-2 leading-7 text-muted-foreground">项目没有接入 GitHub API，无法自动确认真实操作。勾选代表你自己确认完成，不是系统验证。</p></div><ol className="mt-7 space-y-4">{steps.map(([title, detail], index) => <li key={title}><label className={`flex cursor-pointer gap-4 rounded-2xl border p-5 transition-colors ${checked[index] ? "border-success bg-success/10" : "bg-surface hover:border-primary"}`}><input type="checkbox" checked={checked[index]} onChange={(event) => setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} className="mt-1 size-5 accent-[var(--primary)]" /><span><strong className="block">{index + 1}. {title}</strong><span className="mt-2 block leading-7 text-muted-foreground">{detail}</span></span></label></li>)}</ol>{done ? <div aria-live="polite" className="mt-6 flex gap-3 rounded-2xl border border-success/40 bg-success/10 p-5"><CheckCircle size={28} weight="fill" className="shrink-0 text-success" aria-hidden /><div><h2 className="font-bold">你已完成自我检查</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">请保留自己的 Pull Request 链接作为真实练习记录。无需向原仓库提交。</p></div></div> : null}</div>;
}
