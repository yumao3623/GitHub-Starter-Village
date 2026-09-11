"use client";

import { useRef, useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { brandConfig } from "@/config/brand";
import { characters, characterAtlas, type CharacterId } from "@/content/characters";

type Props = { demo?: boolean; chapters: string; title: string; character?: CharacterId | null; mastery: string; accuracy: string; duration: string };
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new window.Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("本地分享素材加载失败，请重试。")); image.src = src; });
}

export function AdventureShareCard({ demo = false, chapters, title, character, mastery, accuracy, duration }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<"portrait" | "landscape">("portrait");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true); setNotice("");
    try {
      const canvas = canvasRef.current; if (!canvas) return;
      const portrait = format === "portrait";
      canvas.width = portrait ? 1080 : 1200; canvas.height = portrait ? 1920 : 630;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("当前环境无法生成 Canvas 图片。");
      const [paper, cast] = await Promise.all([loadImage("/world/ink-mist-overlay-v1.png"), loadImage(characterAtlas.path)]);
      ctx.drawImage(paper, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f5f1e5dd"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const x = portrait ? 85 : 65;
      ctx.strokeStyle = "#a34835"; ctx.lineWidth = 3; ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);
      ctx.fillStyle = "#a34835"; ctx.font = `600 ${portrait ? 30 : 20}px system-ui`; ctx.fillText(demo ? "演示留影 · 固定数据" : "江湖留影 · 本地记录", x, portrait ? 135 : 95);
      ctx.fillStyle = "#253c3c"; ctx.font = `700 ${portrait ? 72 : 48}px system-ui`; ctx.fillText(brandConfig.chineseName, x, portrait ? 260 : 170);
      ctx.font = `600 ${portrait ? 46 : 30}px system-ui`; ctx.fillText(title, x, portrait ? 350 : 230);
      const hero = characters.find(item => item.id === character) ?? characters[0];
      const heroHeight = portrait ? 610 : 350;
      ctx.drawImage(cast, hero.x, 0, hero.width, characterAtlas.height, portrait ? 535 : 840, portrait ? 445 : 120, hero.width / characterAtlas.height * heroHeight, heroHeight);
      const entries = [["贡献链模拟章节", chapters], ["P0 独立掌握率", mastery], ["鉴宝首答正确率", accuracy], ["有效学习用时", demo ? "演示不计时" : duration]];
      entries.forEach(([label, value], index) => { const y = portrait ? 520 + index * 155 : 300 + index * 58; ctx.fillStyle = "#52635e"; ctx.font = `400 ${portrait ? 28 : 17}px system-ui`; ctx.fillText(label, x, y); ctx.fillStyle = "#253c3c"; ctx.font = `600 ${portrait ? 38 : 22}px system-ui`; ctx.fillText(value, x, y + (portrait ? 55 : 28)); });
      ctx.fillStyle = "#52635e"; ctx.font = `400 ${portrait ? 25 : 17}px system-ui`; ctx.fillText(`${hero.name} · ${hero.role}`, portrait ? x : 840, portrait ? 1250 : 495);
      ctx.font = `400 ${portrait ? 23 : 16}px monospace`; ctx.fillText(brandConfig.repositoryUrl.replace("https://", ""), x, portrait ? 1430 : 535);
      ctx.font = `400 ${portrait ? 22 : 15}px system-ui`; ctx.fillText("模拟操作记录，不代表 GitHub 实操验证。", x, portrait ? 1530 : 570); ctx.fillText("独立开源学习项目，非 GitHub 官方产品。", x, portrait ? 1590 : 582);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("PNG 导出失败。")), "image/png"));
      const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.download = `${brandConfig.repositoryName}-${demo ? "demo-" : ""}${format}.png`; link.href = url; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("PNG 已在本机生成，未上传任何数据。");
    } catch (error) { setNotice(error instanceof Error ? error.message : "生成失败，请重试。"); }
    finally { setBusy(false); }
  }
  return <section className="adventure-share-card" aria-label="江湖留影分享卡"><h2>江湖留影</h2><p>{demo ? "固定演示数据 · 不读取存档" : "本地生成，不上传数据"}</p><strong>{title}</strong><span>贡献链模拟章节：{chapters} · 非实操认证</span><span>P0：{mastery} · 首答：{accuracy} · 用时：{demo ? "演示不计时" : duration}</span><details><summary>统计口径</summary><p>P0 只计本版支持的独立迁移评估，不把贡献链练习或旧版成绩算成掌握。首答正确率统计未求助鉴宝迁移评估中，每个证据栏、鉴定和交付的第一次尝试；重复答题不会洗掉错误。有效用时从本版开始累计，仅计窗口可见、有焦点且最近 60 秒有操作的时间，最多有 5 秒保存误差。导入存档是本地自述，不是认证。</p></details><div className="share-formats"><Button variant="secondary" aria-pressed={format === "portrait"} onClick={() => setFormat("portrait")}>1080×1920 竖版</Button><Button variant="secondary" aria-pressed={format === "landscape"} onClick={() => setFormat("landscape")}>1200×630 横版</Button></div><canvas ref={canvasRef} className="hidden" aria-hidden /><Button disabled={busy || !character} onClick={() => void download()}><DownloadSimple aria-hidden />{busy ? "正在绘制…" : "下载江湖分享卡"}</Button><p role="status">{notice || (!character ? "先选择同行角色，再生成留影。" : "")}</p></section>;
}
