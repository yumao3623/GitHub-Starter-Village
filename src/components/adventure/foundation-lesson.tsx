"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { AdventureAction, AdventureState } from "@/core/game/adventure";
import { CharacterArt } from "./character-art";
import { BookOpenText, Check, Compass, MapPin, Scroll, ShieldCheck, Sparkle, TerminalWindow } from "@phosphor-icons/react";
import { chapterSceneByChapter } from "@/content/scenarios/chapter-scenes";

type Lesson = { title: string; place: string; story: string; steps: string[]; concepts: string[]; options: string[][]; correct: number[]; icon: typeof Compass };
const lessons: Record<number, Lesson> = {
  0: { title: "从村口读懂仓库", place: "村口路标", story: "青砚指着三块路牌：先看说明，再找下载，最后才进入源码。", steps: ["找出项目说明入口", "找出版本下载入口", "找出复制到自己账号的动作"], concepts: ["README", "Release", "Fork"], options: [["README", "Settings", "Insights"], ["Releases", "Issues", "Actions"], ["Fork", "Star", "Watch"]], correct: [0, 0, 0], icon: Compass },
  1: { title: "守好账号的钥匙", place: "护身堂", story: "守门人提醒你：真正的登录只发生在 GitHub 官方页面，学习游戏不会索要秘密。", steps: ["认出官方登录地址", "选择更强的第二道防线", "辨认不能交出的秘密"], concepts: ["Sign in", "2FA", "Recovery codes"], options: [["github.com", "github-login.example", "game-login.local"], ["2FA / Passkey", "公开密码", "复制验证码给陌生人"], ["Recovery codes 自己保存", "把密码交给游戏", "上传 SSH 私钥"]], correct: [0, 0, 0], icon: ShieldCheck },
  2: { title: "三种拓印方式", place: "拓印坊", story: "三张拓印桌看起来相似，只有完整的 Clone 能保留学习协作所需的连线。", steps: ["把项目复制到自己的账号", "把仓库带到本地工作台", "识别只读文件快照"], concepts: ["Fork", "Clone", "Download ZIP"], options: [["Fork", "Clone", "Download ZIP"], ["Clone", "Fork", "Release"], ["Download ZIP", "Push", "Watch"]], correct: [0, 0, 0], icon: Scroll },
  3: { title: "点亮本地营火", place: "营火工坊", story: "项目已经来到电脑上。你要按正确顺序认出目录、安装依赖，再点燃本地页面。", steps: ["进入项目目录", "安装项目依赖", "启动本地开发页"], concepts: ["Node.js", "npm install", "localhost"], options: [["Terminal / 项目目录", "GitHub 密码框", "Recovery codes"], ["npm install", "npm publish", "git delete"], ["npm run dev", "npm erase", "git logout"]], correct: [0, 0, 0], icon: TerminalWindow },
  4: { title: "在藏图阁找证据", place: "藏图阁", story: "夜行图的南北门线索藏在文件、历史、许可证和版本柜之间。", steps: ["打开说明和文件目录", "查看变更历史与分支", "找到许可证与版本发布"], concepts: ["Repository", "Commit", "License"], options: [["README + Files", "Notifications", "Profile"], ["Commit history + Branch", "Star + Follow", "Codespaces + Wiki"], ["License + Releases", "Settings + Security", "Discussions + Projects"]], correct: [0, 0, 0], icon: BookOpenText },
  6: { title: "让飞鸽送到正确的机关", place: "飞鸽传书", story: "维护者要你区分收藏、订阅、关注和复制，不要让一封信送错地方。", steps: ["把项目放入可选收藏柜", "把更新通知送进订阅柜", "把关注与复制分到不同机关"], concepts: ["Star", "Watch", "Follow"], options: [["Star", "Watch", "Fork"], ["Watch", "Star", "Follow"], ["Follow = 关注用户；Fork = 复制仓库", "Follow = 下载文件", "Fork = 开启通知"]], correct: [0, 0, 0], icon: MapPin },
};

export function FoundationLesson({ chapter, state, dispatch }: { chapter: number; state: AdventureState; dispatch: React.Dispatch<AdventureAction> }) {
  const lesson = lessons[chapter] ?? lessons[0];
  const scene = chapterSceneByChapter.get(chapter)!;
  const progress = state.journey.foundationProgress[String(chapter)] ?? 0;
  const done = state.journey.foundations.includes(chapter);
  const [hint, setHint] = useState("");
  const Icon = lesson.icon;
  const choose = (option: number) => {
    if (option !== lesson.correct[progress]) { setHint("这一步还不对，再读一下左侧提示；不会扣分，可以立即重试。"); return; }
    setHint(""); dispatch({ type: "foundation-step", chapter, step: progress });
  };
  return <section className="foundation-lesson" aria-labelledby="foundation-title">
    <header className="chain-header"><div><span className="seal-small"><Icon size={18} weight="duotone" /> 第 {chapter} 章 · {lesson.place}</span><h1 id="foundation-title">{lesson.title}</h1><p>{lesson.story}</p></div><Button variant="secondary" onClick={() => dispatch({ type: "navigate", view: "map" })}>返回江湖地图</Button></header>
    <div className="foundation-layout"><aside className="foundation-story"><CharacterArt id={state.character!} pose={done ? "celebrating" : "inspecting"} className="foundation-hero"/><div className="story-scroll"><strong>本关只做三步</strong><p>先看高亮目标，再完成当前一步。每一步都会解释它对应的 GitHub 概念。</p><small>这是教学模拟，不会登录或操作真实 GitHub。</small></div></aside>
      <section className="foundation-workbench" aria-label={`${lesson.place}任务操作`}><div className="local-scene" data-parent-region={scene.parentMapRegionId}><div className="local-scene-title">局部场景 · {scene.parentMapRegionId}</div><div className="local-ground" aria-hidden /><div className="local-hotspots" role="group" aria-label="场景机关">{scene.interactiveHotspots.map((spot, index) => <button key={spot.id} className={index < progress || done ? "lit" : index === progress ? "active" : "dim"} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} onClick={() => !done && choose(index === progress ? 0 : 1)}>{spot.label}<small>{index < progress || done ? "已点亮" : index === progress ? "调查" : "等待前置"}</small></button>)}</div><span className="local-npc">青砚 · NPC</span></div><div className="lesson-progress"><span>历练进度 · 目标可见</span><strong>{done ? "3 / 3" : `${progress} / 3`}</strong></div><div className="foundation-concepts">{lesson.concepts.map(concept => <span key={concept}>{concept}</span>)}</div><ol className="foundation-steps">{lesson.steps.map((step, index) => <li key={step} className={index < progress || done ? "complete" : index === progress ? "current" : "locked"}><span>{index < progress || done ? <Check size={18} /> : index + 1}</span><div><strong>{step}</strong><small>{index === progress && !done ? "当前目标 · 调查高亮机关并完成动作" : index > progress && !done ? "完成前一步后显现" : "已记录"}</small></div></li>)}</ol>{!done && <div className="foundation-choices" aria-label="场景操作">{lesson.options[progress].map((option, index) => <Button key={option} variant="secondary" onClick={() => choose(index)}><Sparkle size={16} />{option}</Button>)}</div>}<div className={`chain-feedback ${state.feedbackKind}`} role="status">{hint || state.feedback}</div>{done && <div className="chain-success"><strong>第 {chapter} 章路标已盖印</strong><p>{scene.returnMapReward.item} 已收入行囊 · {scene.returnMapReward.nextHint}</p><Button onClick={() => dispatch({ type: "navigate", view: "map" })}>返回地图继续前进</Button></div>}</section>
    </div>
  </section>;
}
