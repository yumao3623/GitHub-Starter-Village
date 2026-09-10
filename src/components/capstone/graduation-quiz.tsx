"use client";

import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { graduationQuiz } from "@/content/quizzes/zh-CN/graduation";
import { vocabularyById } from "@/content/vocabulary/zh-CN";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function GraduationQuiz() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const question = graduationQuiz[index];
  const passed = correctIds.length === graduationQuiz.length;
  if (passed) return <div className="rounded-2xl border border-success/40 bg-success/10 p-6"><CheckCircle size={32} weight="fill" className="text-success" aria-hidden /><h2 className="mt-4 text-2xl font-bold">P0 结业测试通过</h2><p className="mt-2 leading-7 text-muted-foreground">所有核心术语都已回答正确。现在可以进行自己的 Fork 真实任务。</p></div>;
  const term = vocabularyById.get(question.termId);
  const correct = selected === question.correctIndex;
  function next() {
    if (!correct) return;
    setCorrectIds((items) => [...new Set([...items, question.termId])]);
    setSelected(null);
    setIndex((value) => Math.min(value + 1, graduationQuiz.length - 1));
  }
  return <div className="rounded-2xl border bg-surface p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">P0 结业测试</h2><p className="mt-2 text-sm text-muted-foreground">每个核心术语都要答对。答错可立即重试。</p></div><span className="font-mono text-sm">{index + 1}/{graduationQuiz.length}</span></div><Progress className="mt-5" value={(correctIds.length / graduationQuiz.length) * 100} label="P0 测试" /><div className="mt-7"><p className="font-mono text-sm font-semibold text-primary">{term?.english}</p><h3 className="mt-2 text-lg font-bold">{question.prompt}</h3><div className="mt-4 grid gap-3">{question.options.map((option, optionIndex) => <button key={option} onClick={() => setSelected(optionIndex)} className={`rounded-[10px] border p-4 text-left leading-7 ${selected === optionIndex ? optionIndex === question.correctIndex ? "border-success bg-success/10" : "border-destructive bg-destructive/10" : "bg-background hover:border-primary"}`}>{option}</button>)}</div>{selected !== null ? <div aria-live="polite" className={`mt-4 rounded-[10px] p-4 ${correct ? "bg-success/10" : "bg-destructive/10"}`}><p className="font-semibold">{correct ? "理解正确" : "这个选项描述的是常见误区"}</p>{correct ? <Button className="mt-4" onClick={next}>下一题</Button> : <p className="mt-2 text-sm text-muted-foreground">重新阅读两个选项后再选，不扣分。</p>}</div> : null}</div></div>;
}
