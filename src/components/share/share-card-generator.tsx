"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/components/game/game-provider";
import { brandConfig } from "@/config/brand";
import { vocabulary } from "@/content/vocabulary/zh-CN";
import { missions } from "@/content/missions/zh-CN";

type CardFormat = "portrait" | "landscape";

export function ShareCardGenerator({ demo = false }: { demo?: boolean }) {
  const { state } = useGame();
  const [format, setFormat] = useState<CardFormat>("portrait");
  const [elapsedSeconds, setElapsedSeconds] = useState(state.elapsedSeconds);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (demo || !state.startedAt) return;
    const updateElapsed = () => {
      const sessionSeconds = Math.max(0, Math.floor((Date.now() - new Date(state.startedAt!).getTime()) / 1000));
      setElapsedSeconds(state.elapsedSeconds + sessionSeconds);
    };
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 30_000);
    return () => window.clearInterval(timer);
  }, [demo, state.elapsedSeconds, state.startedAt]);

  const stats = useMemo(() => {
    if (demo) return { chapters: "10 / 14", mastery: "84%", accuracy: "87%", time: "42 分钟", title: "分支探路者" };
    const p0Count = vocabulary.filter((term) => term.priority === "P0").length;
    const attempts = Object.values(state.taskAttempts);
    const totalAttempts = attempts.reduce((sum, attempt) => sum + attempt.attempts, 0);
    const correctTasks = attempts.filter((attempt) => attempt.correct).length;
    const mastery = p0Count === 0 ? 0 : Math.round((state.masteredP0TermIds.length / p0Count) * 100);
    const accuracy = totalAttempts === 0 ? 0 : Math.round((correctTasks / totalAttempts) * 100);
    const minutes = elapsedSeconds === 0 ? "尚未计时" : `${Math.max(1, Math.round(elapsedSeconds / 60))} 分钟`;
    return {
      chapters: `${state.completedMissionIds.length} / ${missions.length}`,
      mastery: `${mastery}%`,
      accuracy: `${accuracy}%`,
      time: minutes,
      title: mastery === 100 ? "开源新旅人" : mastery >= 60 ? "分支探路者" : "新手村访客",
    };
  }, [demo, elapsedSeconds, state.completedMissionIds.length, state.masteredP0TermIds.length, state.taskAttempts]);

  function drawAndDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const portrait = format === "portrait";
    canvas.width = portrait ? 1080 : 1200;
    canvas.height = portrait ? 1920 : 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = "#f4f1eb";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#24211e";
    ctx.fillRect(portrait ? 72 : 56, portrait ? 72 : 48, width - (portrait ? 144 : 112), height - (portrait ? 144 : 96));
    ctx.fillStyle = "#e26a2c";
    ctx.fillRect(portrait ? 72 : 56, portrait ? 72 : 48, portrait ? 18 : 14, height - (portrait ? 144 : 96));
    ctx.fillStyle = "#f7f4ee";
    ctx.font = `700 ${portrait ? 38 : 24}px system-ui`;
    ctx.fillText(demo ? "固定演示数据" : "本地生成，不上传", portrait ? 130 : 100, portrait ? 155 : 98);
    ctx.font = `900 ${portrait ? 84 : 58}px system-ui`;
    ctx.fillText(brandConfig.chineseName, portrait ? 130 : 100, portrait ? 330 : 205);
    ctx.fillStyle = "#e26a2c";
    ctx.font = `800 ${portrait ? 64 : 40}px system-ui`;
    ctx.fillText(stats.title, portrait ? 130 : 100, portrait ? 445 : 275);
    const entries = [["通关章节", stats.chapters], ["P0 掌握率", stats.mastery], ["正确率", stats.accuracy], ["用时", stats.time]];
    ctx.font = `500 ${portrait ? 32 : 21}px system-ui`;
    entries.forEach(([label, value], index) => {
      const y = portrait ? 650 + index * 175 : 370 + (index % 2) * 100;
      const x = portrait ? 130 : 100 + Math.floor(index / 2) * 410;
      ctx.fillStyle = "#aaa39a";
      ctx.fillText(label, x, y);
      ctx.fillStyle = "#f7f4ee";
      ctx.font = `800 ${portrait ? 54 : 32}px system-ui`;
      ctx.fillText(value, x, y + (portrait ? 64 : 38));
      ctx.font = `500 ${portrait ? 32 : 21}px system-ui`;
    });
    ctx.fillStyle = "#aaa39a";
    ctx.font = `500 ${portrait ? 28 : 18}px monospace`;
    ctx.fillText(brandConfig.repositoryUrl.replace("https://", ""), portrait ? 130 : 100, portrait ? 1520 : 548);
    ctx.font = `400 ${portrait ? 20 : 13}px system-ui`;
    const disclaimer = "独立开源学习项目，非 GitHub 官方产品，与 GitHub, Inc. 无关联或背书。";
    ctx.fillText(disclaimer, portrait ? 130 : 100, portrait ? 1690 : 582);
    const link = document.createElement("a");
    link.download = `github-starter-village-${format}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return <div className="rounded-2xl border bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold">本地分享卡</h2><p className="mt-1 text-sm text-muted-foreground">Canvas 在你的浏览器中生成 PNG，不上传数据。</p></div><div className="flex gap-2"><Button variant={format === "portrait" ? "default" : "secondary"} size="sm" onClick={() => setFormat("portrait")}>1080×1920</Button><Button variant={format === "landscape" ? "default" : "secondary"} size="sm" onClick={() => setFormat("landscape")}>1200×630</Button></div></div><div className={`mt-6 mx-auto overflow-hidden rounded-[10px] border bg-[#24211e] p-5 text-[#f7f4ee] ${format === "portrait" ? "max-w-[260px] aspect-[9/16]" : "max-w-[620px] aspect-[40/21]"}`}><p className="text-xs text-[#e26a2c]">{demo ? "固定演示数据" : "本地生成"}</p><p className="mt-4 text-2xl font-black">{brandConfig.chineseName}</p><p className="mt-1 font-bold text-[#e26a2c]">{stats.title}</p><div className="mt-8 grid grid-cols-2 gap-4 text-xs"><p>章节<br/><strong className="text-lg">{stats.chapters}</strong></p><p>P0<br/><strong className="text-lg">{stats.mastery}</strong></p><p>正确率<br/><strong>{stats.accuracy}</strong></p><p>用时<br/><strong>{stats.time}</strong></p></div></div><canvas ref={canvasRef} className="hidden" aria-hidden /><Button className="mt-5 w-full" onClick={drawAndDownload}><DownloadSimple aria-hidden />下载 PNG</Button></div>;
}
