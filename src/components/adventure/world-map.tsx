import { useState } from "react";
import Image from "next/image";
import { LockKey, MapPin, CheckCircle } from "@phosphor-icons/react";
import { completedGoals, hasCompletedMarket, type AdventureAction, type AdventureState } from "@/core/game/adventure";
import { canEnterNode, worldNodes, type WorldNode } from "@/content/world";
import { Button } from "@/components/ui/button";
import { CharacterArt } from "./character-art";

export function WorldMap({ state, dispatch }: { state: AdventureState; dispatch: React.Dispatch<AdventureAction> }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const goals = completedGoals(state);
  const finished = hasCompletedMarket(state);
  const current = worldNodes.find(node => node.id === state.journey.lastNode) ?? worldNodes[0];
  const routeNodes = worldNodes.filter(node => node.id === "inn" || node.chapter !== undefined);
  const nextTask = worldNodes.find(node => node.chapter !== undefined && (node.chapter < 5 ? !goals.includes(`foundation-${node.chapter}`) : node.chapter === 5 ? !goals.includes("market-delivered") : node.chapter === 6 ? !goals.includes("foundation-6") : !goals.includes(`chain-${node.chapter - 1}`))) ?? worldNodes.find(node => node.id === "market")!;
  const reset = () => { setZoom(1); setOffset(0); };
  function status(node: WorldNode) {
    if (node.chapter === 5 && !goals.includes("foundation-4")) return "locked";
    if (node.chapter !== undefined && node.chapter >= 7 && !goals.includes("foundation-6")) return "locked";
    if (!canEnterNode(node.id, goals)) return "locked";
    if (node.region && goals.includes(node.id)) return "completed";
    if (node.chapter !== undefined && (node.chapter <= 4 || node.chapter === 6) && goals.includes(`foundation-${node.chapter}`)) return "completed";
    if (node.chapter === 5 && goals.includes("market-delivered")) return "completed";
    if (node.chapter && goals.includes(`chain-${node.chapter}`)) return "completed";
    if (node.chapter === state.journey.simulation.chapter && state.journey.simulation.events.length) return "in-progress";
    if (node.id === "market" && finished) return "completed";
    if (node.id === "market" && state.inspected.length) return "in-progress";
    return "available";
  }
  function label(node: WorldNode) {
    if (node.kind === "camp") return "更换角色";
    if (node.region) return status(node)==="locked" ? (node.region==="governance"?"完成贡献链后解锁":"完成鉴宝后解锁") : status(node)==="completed"?"已完成 · 可以重练":"可进入 · 区域支线";
    if (status(node) === "locked") return node.chapter !== undefined ? `完成第 ${node.chapter - 1} 章解锁` : "完成前置任务解锁";
    if (node.chapter) return status(node) === "completed" ? "已完成 · 回看成果" : "可进入 · 操作历练";
    if (node.kind === "preview") return "已解锁 · 剧情预告";
    if (status(node) === "completed") return state.completed ? "鉴定完成 · 可复习" : "历史已完成 · 继续本轮";
    return status(node) === "in-progress" ? "进行中 · 继续证据归档" : "可进入 · 找出合适的项目";
  }
  function travel(node: WorldNode) {
    if (node.id === "market" && state.completed) dispatch({ type: "navigate", view: "ending" });
    else dispatch({ type: "travel", nodeId: node.id });
  }
  return <>
    <section className="world-map" aria-labelledby="map-title">
      <div className="world-viewport" style={{ transform: `translateX(${offset}px) scale(${zoom})` }}>
        <Image className="world-art" src="/world/jianghu-full-v1.png" alt="完整江湖地图：左下营地、左上集市、中部驿站竹林、右侧议事堂与百炼炉由石桥山道连接" fill sizes="100vw" unoptimized priority />
        {routeNodes.filter(node => node.requiredGoals.length > 0).map(node => <div key={node.id} data-fog-for={node.id} className={`map-fog region-fog ${canEnterNode(node.id, goals) ? "cleared" : ""}`} style={{ left: `${node.x - 12}%`, top: `${node.y - 12}%` }} aria-hidden />)}
        <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {routeNodes.flatMap(node => node.dependsOn.map(parentId => {
            const parent = routeNodes.find(item => item.id === parentId);
            if (!parent) return null;
            return <path key={`${parent.id}-${node.id}`} className={canEnterNode(node.id, goals) ? "unlocked" : "locked-path"} d={`M${parent.x} ${parent.y} Q${parent.x + 8} ${parent.y + 5} ${node.x} ${node.y}`} vectorEffect="non-scaling-stroke" />;
          }))}
        </svg>
        {routeNodes.map(node => <Button key={node.id} variant={node.kind === "minigame" ? "default" : "secondary"} className={`map-node ${status(node) === "locked" ? "is-locked" : ""}`} data-node-id={node.id} data-node-state={status(node)} aria-disabled={status(node) === "locked" && state.sessionMode !== "explore"} style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translateX(-50%)" }} onClick={() => travel(node)}>
          {status(node) === "locked" ? <LockKey size={20} /> : status(node) === "completed" ? <CheckCircle size={20} /> : <MapPin size={20} />}
          <span>{node.title}<small>{label(node)}</small></span>
        </Button>)}
        {state.character && <div className="map-player" style={{ left: `${Math.max(1,current.x - 10)}%`, top: `${current.y - 3}%`, width:28 }}><CharacterArt id={state.character} pose="standing" /><span className="sr-only">你在{current.title}</span></div>}
      </div>
      <div className="map-heading"><p>左起入谷 · 集市 · 协作山门 · 百炼盟会</p><h1 id="map-title">云溪谷 · 主线十二关</h1><span>沿山道向右，一关一关修好夜行图</span></div>
      <div className="map-tools" aria-label="地图视角"><Button variant="secondary" onClick={() => setZoom(Math.min(1.6, zoom + .2))}>放大</Button><Button variant="secondary" onClick={() => setZoom(Math.max(1, zoom - .2))}>缩小</Button><Button variant="secondary" onClick={() => setOffset(Math.max(-250, offset - 80))}>向左平移</Button><Button variant="secondary" onClick={() => setOffset(Math.min(250, offset + 80))}>向右平移</Button><Button variant="secondary" onClick={reset}>重置视角</Button></div>
      <div className="map-quest"><span className="seal-small">主线委托</span><div><h2>下一站：{nextTask.title}</h2><p>{finished ? "沿山路向右推进；已完成地点可以回看，进度保存在本机。" : "跟着高亮路标完成三步操作，下一处地点就会向右显现。"}</p></div><Button variant="secondary" onClick={() => { reset(); travel(nextTask); }}>前往当前任务</Button></div>
    </section>
    <details className="map-location-list"><summary>主线章节顺序与解锁条件（键盘可用）</summary>{routeNodes.filter(node => node.chapter !== undefined).sort((a,b) => (a.chapter ?? 99) - (b.chapter ?? 99)).map(node => <div key={node.id}><Button variant="ghost" onClick={() => travel(node)}>{`第 ${node.chapter} 章 · ${node.title}`}</Button><span>{label(node)} · {node.description}</span></div>)}</details>
  </>;
}
