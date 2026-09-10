"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowCounterClockwise, ArrowRight, Check, CheckCircle, Compass, Info, LockSimpleOpen, X } from "@phosphor-icons/react";
import { missions } from "@/content/missions/zh-CN";
import { p0TermIds, vocabularyById } from "@/content/vocabulary/zh-CN";
import { getP0Mastery } from "@/core/mastery/calculate";
import { useGame } from "@/components/game/game-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AssistMode } from "@/core/game/types";

const assistLabels: Record<AssistMode, string> = {
  "full-chinese": "全中文辅助",
  bilingual: "中英对照",
  hover: "悬停翻译",
  challenge: "挑战模式",
  "free-explore": "自由探索",
};

export function GameWorkbench({ demo = false }: { demo?: boolean }) {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [demoMissionId, setDemoMissionId] = useState("chapter-10");
  const [demoAnswer, setDemoAnswer] = useState<number | null>(null);
  const currentId = demo ? demoMissionId : state.currentMissionId;
  const current = missions.find((item) => item.id === currentId) ?? missions[4];
  const task = current.tasks[0];
  const attempt = demo ? (demoAnswer === null ? undefined : { selectedIndex: demoAnswer, correct: demoAnswer === task.correctIndex, attempts: 1 }) : state.taskAttempts[task.id];
  const mastery = demo ? { count: 21, total: p0TermIds.length, ratio: 21 / p0TermIds.length } : getP0Mastery(state);
  const completeCount = demo ? 9 : state.completedMissionIds.length;

  const relatedTerms = current.termIds.map((id) => vocabularyById.get(id)).filter((item) => item !== undefined);

  function choose(index: number) {
    if (demo) return setDemoAnswer(index);
    const correct = index === task.correctIndex;
    const coveredP0 = task.termIds.filter((id) => p0TermIds.includes(id));
    dispatch({ type: "answer-task", taskId: task.id, selectedIndex: index, correct, p0TermIds: coveredP0 });
    if (correct) dispatch({ type: "complete-mission", missionId: current.id });
  }

  function selectMission(id: string) {
    if (demo) { setDemoMissionId(id); setDemoAnswer(null); }
    else dispatch({ type: "select-mission", missionId: id });
  }

  const next = missions.find((item) => item.chapter === current.chapter + 1);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <div className="mb-4 rounded-[10px] border border-warning/40 bg-warning/10 px-4 py-3 text-sm md:hidden"><strong>建议回到电脑继续</strong><span className="mt-1 block text-muted-foreground">Fork、Clone、终端和 Pull Request 实操以桌面电脑为正式支持环境。手机端只适合预览。</span></div>
      {demo ? <div className="mb-4 flex items-center justify-between gap-3 rounded-[10px] border border-warning/40 bg-warning/10 px-4 py-3 text-sm"><span><strong>固定演示数据</strong>：不会读取或修改普通进度。</span><Button size="sm" variant="secondary" onClick={() => { setDemoMissionId("chapter-10"); setDemoAnswer(null); }}><ArrowCounterClockwise aria-hidden />重置演示</Button></div> : null}
      <div className="mb-6 grid gap-4 rounded-2xl border bg-surface p-4 md:grid-cols-[1fr_240px_240px] md:items-center">
        <div><p className="font-semibold">冒险进度</p><p className="mt-1 text-sm text-muted-foreground">{completeCount}/14 章完成，本地保存，不上传。</p></div>
        <Progress value={(completeCount / 14) * 100} label="章节" />
        <Progress value={mastery.ratio * 100} label={`P0 ${mastery.count}/${mastery.total}`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="min-w-0 max-w-full overflow-hidden lg:sticky lg:top-22 lg:self-start" aria-label="章节导航">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">任务日志</h2><Compass size={20} aria-hidden /></div>
          <div className="flex w-full max-w-full snap-x gap-2 overflow-x-auto pb-3 lg:max-h-[calc(100dvh-8rem)] lg:flex-col lg:overflow-y-auto">
            {missions.map((item) => {
              const done = demo ? item.chapter < 9 : state.completedMissionIds.includes(item.id);
              const selected = item.id === current.id;
              return <button key={item.id} onClick={() => selectMission(item.id)} className={`min-w-48 snap-start rounded-[10px] border px-3 py-3 text-left text-sm transition-colors lg:min-w-0 ${selected ? "border-primary bg-primary/10" : "bg-surface hover:bg-muted"}`} aria-current={selected ? "step" : undefined}><span className="flex items-center justify-between gap-3"><span className="font-semibold">{item.chapter}. {item.shortTitle}</span>{done ? <CheckCircle weight="fill" className="text-success" aria-label="已完成" /> : null}</span><span className="mt-1 block text-xs text-muted-foreground">阶段 {item.phase}</span></button>;
            })}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="rounded-2xl border bg-surface-raised p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2"><Badge>第 {current.chapter} 章</Badge><Badge className={current.externalAction ? "border-warning/40 bg-warning/10 text-foreground" : "border-primary/30 bg-primary/10 text-foreground"}>{current.externalAction ? "真实操作，自我检查" : "游戏模拟"}</Badge></div>
            <h1 className="mt-5 text-3xl font-black tracking-tight">{current.title}</h1>
            <p className="mt-3 leading-7 text-muted-foreground">{current.story}</p>
            <div className="mt-6 rounded-[10px] border border-border bg-background p-4"><p className="flex items-center gap-2 font-semibold"><Info className="text-primary" aria-hidden />本章边界</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{current.externalAction ? "请在 GitHub 官方网站、Desktop 或本地终端完成。点击选项只记录你的自我确认，不是自动验证。" : "这是原创剧情工作台，不会读取或修改你的 GitHub 账号与仓库。"}</p></div>

            <div className="mt-8"><h2 className="text-xl font-bold">当前任务</h2><p className="mt-2 leading-7">{task.prompt}</p>
              <div className="mt-5 grid gap-3">{task.options.map((option, index) => {
                const selected = attempt?.selectedIndex === index;
                const isCorrect = selected && attempt?.correct;
                const isWrong = selected && !attempt?.correct;
                return <button key={option} onClick={() => choose(index)} className={`flex min-h-14 items-center justify-between gap-4 rounded-[10px] border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${isCorrect ? "border-success bg-success/10" : isWrong ? "border-destructive bg-destructive/10" : "bg-background hover:border-primary"}`}><span>{option}</span>{isCorrect ? <Check className="shrink-0 text-success" aria-hidden /> : isWrong ? <X className="shrink-0 text-destructive" aria-hidden /> : <ArrowRight className="shrink-0 text-muted-foreground" aria-hidden />}</button>;
              })}</div>
              <div aria-live="polite">{attempt ? <div className={`mt-5 rounded-[10px] border p-4 ${attempt.correct ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}><p className="font-semibold">{attempt.correct ? "判断正确" : "还差一步"}</p><p className="mt-2 leading-7">{attempt.correct ? task.correctFeedback : task.incorrectFeedback}</p>{!attempt.correct ? <p className="mt-2 text-sm text-muted-foreground">可以立即重新选择，不会清空任何进度。</p> : null}</div> : null}</div>
            </div>

            {attempt?.correct ? <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t pt-6"><p className="max-w-lg font-semibold text-success">{current.completionMessage}</p>{next ? <Button onClick={() => selectMission(next.id)}>下一章 <ArrowRight aria-hidden /></Button> : <Button onClick={() => router.push("/capstone")}>进入毕业任务 <LockSimpleOpen aria-hidden /></Button>}</div> : null}
          </div>
        </section>

        <aside className="min-w-0 lg:sticky lg:top-22 lg:self-start">
          <div className="rounded-2xl border bg-surface p-4">
            <label htmlFor="assist" className="text-sm font-semibold">中文辅助模式</label>
            <select id="assist" value={demo ? "bilingual" : state.assistMode} onChange={(event) => !demo && dispatch({ type: "set-assist-mode", mode: event.target.value as AssistMode })} disabled={demo} className="mt-2 min-h-11 w-full rounded-[10px] border bg-background px-3 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              {Object.entries(assistLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="mt-4 rounded-2xl border bg-surface p-4"><h2 className="font-bold">本章词条</h2><div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">{relatedTerms.map((term) => <details key={term.id} className="rounded-[10px] border bg-background p-3" open={(demo ? "bilingual" : state.assistMode) === "full-chinese"}><summary className="cursor-pointer list-none"><span className="block font-mono text-sm font-semibold">{term.english}</span>{(demo ? "bilingual" : state.assistMode) !== "challenge" ? <span className="mt-1 block text-sm text-primary">{term.chinese}</span> : null}</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{term.beginnerMeaning}</p><a href={term.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-primary">查看官方依据</a></details>)}</div></div>
        </aside>
      </div>
    </div>
  );
}
