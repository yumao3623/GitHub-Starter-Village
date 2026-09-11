import { adventureReducer as reduce, initialAdventure, parseAdventure } from "./adventure";
import { categories, getProjects } from "@/content/minigames/appraisal";
import { chapterEvents } from "@/content/scenarios/demo-chain";
import { worldNodes } from "@/content/world";
import type { CharacterId } from "@/content/characters";

export const demoStops = [
  { id: "choose", title: "选角开场" }, { id: "map", title: "江湖地图 · 迷雾" },
  ...worldNodes.filter(n => n.chapter !== undefined).sort((a,b) => (a.chapter ?? 99) - (b.chapter ?? 99)).map(n => ({ id: n.id, title: `第 ${n.chapter} 章 · ${n.title}` })),
  { id: "ending", title: "贡献链完成 · 留影" },
];
export function demoSnapshot(id: string, character: CharacterId = "atuan") {
  if (!demoStops.some(stop => stop.id === id)) throw new Error("未知演示场景");
  let state = reduce(initialAdventure(), { type: "hydrate", save: null, sessionMode: "demo" });
  if (id === "choose") return state;
  state = reduce(state, { type: "character", id: character });
  state = reduce(state, { type: "navigate", view: id === "map" ? "map" : "market" });
  if (id === "map" || id === "market") return state;
  for (const project of getProjects(0)) {
    for (const category of categories) {
      const fact = project.facts.find(f => f.category === category)!;
      state = reduce(state, { type: "inspect", project: project.id, tab: fact.tab });
      state = reduce(state, { type: "collect", factId: fact.id });
      state = reduce(state, { type: "attach", category });
    }
    state = reduce(state, { type: "verdict", verdict: project.verdict });
  }
  state = reduce(state, { type: "deliver", project: "reed" });
  const end = id === "ending" || id === "region-governance" ? 13 : Number(id.replace("chapter-", ""));
  // The demo/exploration shelf is isolated from formal progress, but its snapshots
  // still satisfy the same sequential map contract so every chapter can be opened.
  for (let chapter = 0; chapter <= Math.min(6, end); chapter++) {
    for (let step = 0; step < 3; step++) state = reduce(state, { type: "foundation-step", chapter, step });
  }
  for (let chapter = 7; chapter < end; chapter++) {
    state = reduce(state, { type: "contribution-enter", chapter });
    for (const event of chapterEvents[chapter]) {
      state = reduce(state, { type: "chain-event", event });
      if (state.feedbackKind === "error") throw new Error(state.feedback);
    }
  }
  state = id === "ending" ? reduce(state, { type: "navigate", view: "ending" }) : reduce(state, { type: "travel", nodeId: id });
  if (!parseAdventure(state)) throw new Error("演示场景未通过存档校验");
  return state;
}
