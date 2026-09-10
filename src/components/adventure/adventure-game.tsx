"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, MapTrifold, Backpack, ArrowRight, ArrowCounterClockwise, DownloadSimple, CheckCircle } from "@phosphor-icons/react";
import { characters } from "@/content/characters";
import { appraisalStory, getProjects } from "@/content/minigames/appraisal";
import { adventureReducer, initialAdventure, parseAdventure } from "@/core/game/adventure";
import { ADVENTURE_STORAGE_KEY, PHASE_A_STORAGE_KEY, backupAdventure, readOriginalAdventure, loadAdventure, saveAdventure, serializeAdventure } from "@/core/persistence/adventure-storage";
import { brandConfig } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { CharacterArt } from "./character-art";
import { AppraisalMarket } from "./appraisal-market";
import { WorldMap } from "./world-map";
import { Handbook } from "./handbook";
import { DialoguePanel } from "./dialogue-panel";

function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AdventureGame({ demo = false, exploration = false, onExit }: { demo?: boolean; exploration?: boolean; onExit?: () => void }) {
  const [exploring, setExploring] = useState(false);
  const [state, dispatch] = useReducer(adventureReducer, undefined, initialAdventure);
  const [book, setBook] = useState<{ termId?: string } | null>(null);
  const [settings, setSettings] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLDivElement>(null);
  const bookTrigger = useRef<HTMLElement | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (demo) { dispatch({ type: "hydrate", save: null, sessionMode: exploration ? "explore" : "demo" }); return; }
    try { dispatch({ type: "hydrate", ...loadAdventure(localStorage) }); }
    catch { dispatch({ type: "hydrate", save: null, issue: "浏览器不允许访问存档。可临时体验，离开前请导出进度。" }); }
  }, [demo, exploration]);
  useEffect(() => {
    if (!state.ready || demo || state.storageIssue) return;
    try { saveAdventure(localStorage, state); }
    catch { dispatch({ type: "storage-error", message: "存档写入失败。请先导出当前进度；清理空间后重新打开。" }); }
  }, [state, demo]);
  useEffect(() => { if (state.ready) heading.current?.focus(); }, [state.view, state.ready]);

  useEffect(() => {
    if (demo) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === ADVENTURE_STORAGE_KEY) dispatch({ type: "storage-error", message: "另一窗口更新了历练记录，已暂停本窗口自动保存。请先导出本窗口进度，再刷新读取新记录。" });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [demo]);

  function openBook(termId?: string) { dispatch({ type: "request-hint" }); if (termId) dispatch({ type: "encounter", termId }); bookTrigger.current = document.activeElement as HTMLElement | null; setBook({ termId }); }
  function closeBook() { setBook(null); bookTrigger.current?.focus(); }
  async function importSave(file?: File) {
    if (!file) return;
    if (file.size > 100_000) { setNotice("存档文件过大，请选择本样板导出的 JSON。"); return; }
    try {
      const save = parseAdventure(JSON.parse(await file.text()));
      if (!save) { setNotice("存档结构或关卡证据不合法，现有进度没有改变。"); return; }
      if (!demo) {
        backupAdventure(localStorage, "import");
      }
      dispatch({ type: "hydrate", save }); setNotice("已导入。原存档保留为导入前备份；导入记录不代表 GitHub 真实验证。");
    } catch { setNotice("无法导入。请检查 JSON 格式和浏览器存储权限，当前进度没有覆盖。"); }
  }
  function reset() {
    try {
      if (!demo) {
        backupAdventure(localStorage, "reset");
        saveAdventure(localStorage, initialAdventure());
      }
      dispatch({ type: "reset" }); setResetPending(false); setNotice("阶段 B 记录已重置。阶段 A 原记录与旧课程记录未改动，重置前记录已另存备份。");
    } catch { setNotice("无法备份存档，因此没有执行重置。请先导出原记录。"); }
  }
  const character = characters.find(item => item.id === state.character);
  if (exploring) return <AdventureGame demo exploration onExit={() => setExploring(false)} />;
  return <div className="adventure" data-reduced-motion={state.reducedMotion}>
    <header className="adventure-header"><Link href="/" className="adventure-brand"><span className="brand-seal">侠</span><span>{brandConfig.chineseName}<small>江湖历练 · 阶段 B{exploration ? " / 自由探索" : demo ? " / 演示模式" : ""}</small></span></Link>
      <nav aria-label="江湖导航"><Button variant="ghost" onClick={() => dispatch({ type: "navigate", view: "map" })}><MapTrifold size={20} />江湖地图</Button><Button variant="ghost" onClick={() => openBook()}><BookOpen size={20} />武林宝典</Button><Button variant="ghost" aria-expanded={settings} onClick={() => setSettings(!settings)}><Backpack size={20} />行囊</Button></nav>
      <span className="save-status">{demo ? "固定样板 · 不读写存档" : state.storageIssue ? "临时体验 · 保存异常" : state.ready ? "进度自动保存在本机" : "正在读取行囊"}</span>
    </header>
    {demo && <div className="session-banner">{exploration ? "自由探索：可预览未解锁地点，所有操作均不影响正式进度。" : "演示模式：固定初始数据，不读写学习存档。"}{onExit && <Button variant="secondary" onClick={onExit}>返回正式历练</Button>}</div>}
    {state.journey.run.mode === "assessment" && <p className="session-banner">鉴宝迁移评估 · {state.journey.run.aided ? "已使用宝典，本轮仅记辅助练习" : "独立操作中，可随时查阅宝典转为辅助练习"}</p>}
    <div ref={heading} tabIndex={-1} className="scene-focus" aria-label={state.view === "market" ? "集市鉴宝任务" : "江湖历练场景"} />
    {state.storageIssue && <p className="storage-warning" role="alert">{state.storageIssue}</p>}
    {settings && <section className="adventure-settings" aria-label="行囊与设置"><h2>行囊</h2><label><input type="checkbox" checked={state.reducedMotion} onChange={event => dispatch({ type: "motion", reduced: event.target.checked })} /> 减少动态效果</label>
      {!demo && <Button variant="secondary" onClick={() => downloadText(serializeAdventure(state), "village-v2-save.json")}><DownloadSimple size={18} />导出当前进度</Button>}
      {!demo && <Button variant="secondary" onClick={() => { try { const raw = readOriginalAdventure(localStorage); if (raw) downloadText(raw, "village-original.json"); else setNotice("本机还没有原始存档。"); } catch { setNotice("无法读取原始存档。"); } }}>导出原始存档</Button>}
      {!demo && <><Button variant="secondary" onClick={() => fileInput.current?.click()}>导入进度</Button><input ref={fileInput} type="file" accept=".json,application/json" aria-label="选择存档文件" className="sr-only" onChange={event => { void importSave(event.target.files?.[0]); event.target.value = ""; }} /></>}
      <Button variant="secondary" onClick={() => setResetPending(true)}><ArrowCounterClockwise size={18} />重置样板</Button>
      {resetPending && <div className="reset-confirm" role="group" aria-label="确认重置"><p>只重置阶段 B。重置前保留独立备份，阶段 A 原记录不变。</p><Button variant="danger" onClick={reset}>确认重置</Button><Button variant="secondary" onClick={() => setResetPending(false)}>取消</Button></div>}
      <p role="status">{notice || "本阶段仅验证鉴宝目标，不授予主线毕业，不改变旧版 P0 掌握率。"}</p>
      {!demo && <><Button variant="secondary" onClick={() => setExploring(true)}>进入自由探索</Button><Button variant="secondary" onClick={() => { try { const raw = localStorage.getItem(PHASE_A_STORAGE_KEY); if (raw) downloadText(raw, "village-phase-a-preserved.json"); else setNotice("没有检测到阶段 A 原存档。"); } catch { setNotice("无法读取阶段 A 原存档。"); } }}>导出保留的阶段 A 记录</Button></>}
    </section>}
    {!state.ready ? <div className="adventure-loading">正在展开江湖画卷…</div> : state.view === "choose" ? <section className="character-selection" aria-labelledby="choose-title">
      <Image src="/world/river-valley-v1.png" alt="" fill sizes="100vw" className="selection-backdrop" unoptimized priority />
      <div className="selection-copy"><span className="seal-small">初入江湖</span><h1 id="choose-title">选一位少侠，<br />共赴新手村。</h1><p>一卷夜行图，一场鉴宝委托。<br />从看懂项目开始，练就协作的本领。</p><div className="selected-character"><strong>{character?.name ?? "谁与你同行？"}</strong><p>{character?.description ?? "三个角色，同样的课程与难度。"}</p></div><Button size="lg" disabled={!state.character} onClick={() => dispatch({ type: "navigate", view: "map" })}>踏入江湖 <ArrowRight size={20} /></Button><small className="prototype-note">本次体验一关完整鉴宝，不是十四章成品。</small></div>
      <div className="character-options" role="group" aria-label="选择主角">{characters.map(item => <Button key={item.id} variant="ghost" className={`character-option ${state.character === item.id ? "chosen" : ""}`} aria-label={`选择${item.role}${item.name}`} aria-pressed={state.character === item.id} onClick={() => dispatch({ type: "character", id: item.id })}><CharacterArt id={item.id} /><span className="character-name">{item.name}<small>{item.role}</small></span>{state.character === item.id && <CheckCircle className="character-check" size={24} weight="fill" />}</Button>)}</div>
    </section> : state.view === "map" ? <WorldMap state={state} dispatch={dispatch} /> : state.view === "market" ? <AppraisalMarket state={state} dispatch={dispatch} openBook={openBook} /> : <section className="adventure-ending">
      <Image src="/world/river-valley-v1.png" alt="" fill sizes="100vw" unoptimized className="ending-backdrop" />
      {state.character && <CharacterArt id={state.character} className="ending-character" pose="celebrating" />}
      <div className="ending-copy"><span className="seal-small">{state.view === "ending" ? "鉴定有据" : "飞鸽台"}</span><h1>{state.view === "ending" ? "眼力初成，迷雾已散。" : "下一封信，写给江湖。"}</h1><p>{state.view === "ending" ? `你已完成三卷鉴定，为夜行图选中了「${getProjects(state.variant).find(item => item.verdict === "suitable")?.name}」。` : appraisalStory.next}</p>{state.view === "pavilion" && <DialoguePanel id="pavilion-letter" state={state} dispatch={dispatch} />}<p>这次练习：核对运行环境、辨认使用许可、判断维护线索。<br />这是模拟关卡完成，不是 GitHub 实操验证或主线毕业。</p><div className="ending-actions"><Button onClick={() => dispatch({ type: "navigate", view: "map" })}>查看解锁地图 <MapTrifold size={20} /></Button><Button variant="secondary" onClick={() => dispatch({ type: "new-round" })}>换一组条件再练</Button><Button variant="secondary" onClick={() => dispatch({ type: "start-assessment" })}>开始迁移评估</Button></div><Link href="/start/">准备好真实实践？查看 Fork / Clone 指南 →</Link></div>
    </section>}
    {state.view !== "market" && <div className={`map-feedback ${state.feedbackKind}`} role="status">{state.feedback}</div>}
    {book && <Handbook termId={book.termId} close={closeBook} state={state} dispatch={dispatch} />}
    <footer className="adventure-footer"><p>{appraisalStory.safety}</p><p>{brandConfig.disclaimer}</p></footer>
  </div>;
}
