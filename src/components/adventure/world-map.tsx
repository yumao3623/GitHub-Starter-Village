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
  const current = worldNodes.find(node => node.id === state.journey.lastNode)!;
  const reset = () => { setZoom(1); setOffset(0); };
  function status(node: WorldNode) {
    if (!canEnterNode(node.id, goals)) return "locked";
    if (node.id === "market" && finished) return "completed";
    if (node.id === "market" && state.inspected.length) return "in-progress";
    return "available";
  }
  function label(node: WorldNode) {
    if (node.kind === "camp") return "更换角色";
    if (status(node) === "locked") return "完成鉴宝后解锁";
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
        <Image className="world-art" src="/world/river-valley-v1.png" alt="溪水与石桥连接山间客栈、集市和山顶飞鸽台" fill sizes="100vw" unoptimized priority />
        {worldNodes.filter(node => node.requiredGoals.length > 0).map(node => <div key={node.id} data-fog-for={node.id} className={`map-fog ${canEnterNode(node.id, goals) ? "cleared" : ""}`} style={{ left: `${node.x - 26}%`, top: `${node.y - 37}%` }} aria-hidden />)}
        <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {worldNodes.flatMap(node => node.dependsOn.map(parentId => {
            const parent = worldNodes.find(item => item.id === parentId)!;
            return <path key={`${parent.id}-${node.id}`} className={canEnterNode(node.id, goals) ? "unlocked" : "locked-path"} d={`M${parent.x} ${parent.y} Q${parent.x + 8} ${parent.y + 5} ${node.x} ${node.y}`} vectorEffect="non-scaling-stroke" />;
          }))}
        </svg>
        {worldNodes.map(node => <Button key={node.id} variant={node.kind === "minigame" ? "default" : "secondary"} className={`map-node ${status(node) === "locked" ? "is-locked" : ""}`} data-node-id={node.id} data-node-state={status(node)} aria-disabled={status(node) === "locked" && state.sessionMode !== "explore"} style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translateX(-50%)" }} onClick={() => travel(node)}>
          {status(node) === "locked" ? <LockKey size={20} /> : status(node) === "completed" ? <CheckCircle size={20} /> : <MapPin size={20} />}
          <span>{node.title}<small>{label(node)}</small></span>
        </Button>)}
        {state.character && <div className="map-player" style={{ left: `${current.x - 8}%`, top: `${current.y - 20}%` }}><CharacterArt id={state.character} pose="walking" /><span>你在这里</span></div>}
      </div>
      <div className="map-heading"><p>你的第一段江湖路</p><h1 id="map-title">云溪谷</h1><span>阶段 B · 保留鉴宝，后续课程尚未开放</span></div>
      <div className="map-tools" aria-label="地图视角"><Button variant="secondary" onClick={() => setZoom(Math.min(1.6, zoom + .2))}>放大</Button><Button variant="secondary" onClick={() => setZoom(Math.max(1, zoom - .2))}>缩小</Button><Button variant="secondary" onClick={() => setOffset(Math.max(-250, offset - 80))}>向左平移</Button><Button variant="secondary" onClick={() => setOffset(Math.min(250, offset + 80))}>向右平移</Button><Button variant="secondary" onClick={reset}>重置视角</Button></div>
      <div className="map-quest"><span className="seal-small">委托</span><div><h2>{finished ? "把好消息带给信使" : "为《江湖夜行图》挑一件工具"}</h2><p>{finished ? "历史解锁会保留。重玩只更新本轮，不抹掉已经完成的历练。" : "环境、许可、维护线索，一个也不能只凭印象。"}</p></div><Button variant="secondary" onClick={() => { reset(); travel(worldNodes.find(node => node.id === (state.completed ? "pavilion" : "market"))!); }}>回到当前任务</Button></div>
    </section>
    <details className="map-location-list"><summary>地点列表与解锁条件（键盘可用）</summary>{worldNodes.map(node => <div key={node.id}><Button variant="ghost" onClick={() => travel(node)}>{node.title}</Button><span>{label(node)} · {node.description}</span></div>)}</details>
  </>;
}
