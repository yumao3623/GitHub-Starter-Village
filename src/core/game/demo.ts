import { adventureReducer as reduce, initialAdventure, parseAdventure } from "./adventure";
import { categories, getProjects } from "@/content/minigames/appraisal";
import { chapterEvents } from "@/content/scenarios/demo-chain";
import { worldNodes } from "@/content/world";
import type { CharacterId } from "@/content/characters";

export const demoStops = [
  { id: "choose", title: "选角开场" }, { id: "map", title: "迷雾地图" }, { id: "market", title: "集市鉴宝" },
  ...worldNodes.filter(n => n.chapter || n.region).map(n => ({ id: n.id, title: n.title })),
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
