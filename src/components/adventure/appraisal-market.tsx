import Image from "next/image";
import { BookOpen, CheckCircle, Scroll, Stamp, HandPointing } from "@phosphor-icons/react";
import { appraisalStory, categories, categoryLabels, dossierTabs, getProjects, verdictLabels, verdicts } from "@/content/minigames/appraisal";
import { allAppraised } from "@/core/game/appraisal";
import { toLegacy, type AdventureAction, type AdventureState } from "@/core/game/adventure";
import { appraisalObjectives } from "@/content/minigames/objectives";
import { achievedObjectives } from "@/core/game/objectives";
import { Button } from "@/components/ui/button";
import { CharacterArt } from "./character-art";
import { DialoguePanel } from "./dialogue-panel";
import { chapterSceneByChapter } from "@/content/scenarios/chapter-scenes";

export function AppraisalMarket({ state, dispatch, openBook }: { state: AdventureState; dispatch: React.Dispatch<AdventureAction>; openBook: (termId?: string) => void }) {
  const projects = getProjects(state.variant);
  const project = projects.find(item => item.id === state.activeProject)!;
  const fact = project.facts.find(item => item.tab === state.tab)!;
  const dossier = state.dossiers[project.id];
  const inspected = state.inspected.includes(fact.id);
  const classified = projects.filter(item => state.dossiers[item.id].verdict).length;
  const scene = chapterSceneByChapter.get(5)!;
  return <section className="market-layout" data-parent-map-region={scene.parentMapRegionId} aria-labelledby="market-title">
    <div className="market-stage">
      <Image src="/world/appraisal-market-v1.png" alt="青砚坐在三间卷轴摊位之间，等待少侠查验项目" className="market-art" fill sizes="65vw" priority unoptimized />
      <div className="market-heading"><p>夜行图的第一份委托</p><h1 id="market-title">{appraisalStory.title}</h1><span>{appraisalStory.subtitle}</span></div>
      <div className="stalls" role="group" aria-label="三份待鉴定的项目卷轴">
        {projects.map((item, index) => <Button key={item.id} variant="secondary" className={`scroll-object ${item.id === project.id ? "selected" : ""} stall-${index}`}
          aria-pressed={item.id === project.id} onClick={() => dispatch({ type: "inspect", project: item.id, tab: "requirements" })}>
          <Scroll size={26} aria-hidden /><strong>{item.name}</strong><small>{state.dossiers[item.id].verdict ? "已鉴定" : "展开卷轴"}</small>
          {state.dossiers[item.id].verdict && <CheckCircle className="scroll-stamp" size={22} aria-hidden />}
        </Button>)}
      </div>
      {state.character && <CharacterArt id={state.character} className="market-player" pose="inspecting" />}
      <div className="npc-dialogue"><DialoguePanel id="market-commission" state={state} dispatch={dispatch} /></div>
      <div className="commission"><strong>委托条件</strong><p>{appraisalStory.brief}</p><span>{classified} / 3 卷鉴定完成</span></div>
    </div>
    <div className="dossier-panel">
      <div className="dossier-title"><div><small>项目卷宗 · 教学模拟</small><h2>{project.name}</h2><code>{project.repository}</code></div><Button variant="ghost" size="icon" onClick={() => openBook(fact.termId)} aria-label="在武林宝典查看当前术语"><BookOpen size={24} /></Button></div>
      <div className="dossier-tabs" role="group" aria-label="查阅项目资料">{dossierTabs.map(tab => <Button key={tab.id} variant="ghost" aria-pressed={tab.id === state.tab} onClick={() => dispatch({ type: "inspect", project: project.id, tab: tab.id })}><span>{tab.english}<small>{tab.chinese}</small></span></Button>)}</div>
      <article className="evidence-reading" key={fact.id}>
        <h3>{fact.title}</h3><p>{fact.detail}</p>
        <Button variant="secondary" disabled={Boolean(dossier.verdict)} onClick={() => {
          if (!inspected) dispatch({ type: "inspect", project: project.id, tab: state.tab });
          dispatch({ type: "collect", factId: fact.id });
        }}><HandPointing size={18} />{state.selectedFact === fact.id ? "已选中，请放入证据栏" : state.collected.includes(fact.id) ? "再次选用这条证据" : "收集这条证据"}</Button>
      </article>
      <section className="evidence-tray" aria-labelledby="evidence-tray-title"><div className="section-caption"><h3 id="evidence-tray-title">证据归档</h3><span>先收集，再点栏位</span></div>
        <div className="evidence-slots">{categories.map(category => {
          const assigned = project.facts.find(item => item.id === dossier.slots[category]);
          return <Button variant="secondary" key={category} className={assigned ? "filled" : ""} disabled={Boolean(dossier.verdict)} onClick={() => dispatch({ type: "attach", category })} aria-label={`放入${categoryLabels[category]}证据`}>
            {assigned ? <CheckCircle size={20} /> : <span className="slot-number">{categories.indexOf(category) + 1}</span>}<strong>{categoryLabels[category]}</strong><small>{assigned?.title ?? "等待证据"}</small>
          </Button>;
        })}</div>
      </section>
      <section className="verdict-area" aria-labelledby="verdict-title"><h3 id="verdict-title">落下你的鉴定印</h3>
        {dossier.verdict ? <div className="approved-verdict"><Stamp size={22} /><strong>{verdictLabels[dossier.verdict]}</strong><p>{project.explanation}</p></div>
          : <div className="verdict-actions">{verdicts.map(verdict => <Button key={verdict} variant="secondary" onClick={() => dispatch({ type: "verdict", verdict })}>{verdictLabels[verdict]}</Button>)}</div>}
      </section>
      <div className={`task-feedback ${state.feedbackKind}`} role="status" aria-live="polite">{state.feedback}</div>
      <details className="objective-list"><summary>本轮目标与操作证据</summary>{appraisalObjectives.map(goal => <p key={goal.id}>{achievedObjectives(toLegacy(state)).includes(goal.id) ? "✓" : "○"} {goal.title}</p>)}</details>
      {allAppraised(toLegacy(state)) && <Button className="deliver-action" onClick={() => dispatch({ type: "deliver", project: project.id })}><Stamp size={20} />交付「{project.name}」作为推荐</Button>}
    </div>
  </section>;
}
