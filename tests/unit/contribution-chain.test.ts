import { describe, expect, it } from "vitest";
import { adventureReducer, initialAdventure, parseAdventure } from "@/core/game/adventure";
import { applyChainEvent, chainCompleted, initialChainModel, replayChain, reviewedReadme, fixedReadme } from "@/core/game/contribution";
import { loadAdventure, saveAdventure } from "@/core/persistence/adventure-storage";
import { categories, getProjects } from "@/content/minigames/appraisal";
import { chapterEvents, event } from "../helpers/chain-fixture";

function ready() {
  let state = adventureReducer(initialAdventure(), { type: "hydrate", save: null });
  state = adventureReducer(state, { type: "character", id: "atuan" });
  state = adventureReducer(state, { type: "navigate", view: "market" });
  for (const project of getProjects(0)) {
    for (const category of categories) {
      const fact = project.facts.find(item => item.category === category)!;
      state = adventureReducer(state, { type: "inspect", project: project.id, tab: fact.tab });
      state = adventureReducer(state, { type: "collect", factId: fact.id });
      state = adventureReducer(state, { type: "attach", category });
    }
    state = adventureReducer(state, { type: "verdict", verdict: project.verdict });
  }
  return adventureReducer(state, { type: "deliver", project: "reed" });
}
describe("阶段 C 独立场景与提交链", () => {
  it("六章均可从实际操作完成，并逐章序列化/恢复", () => {
    let state = ready();
    for (let chapter = 7; chapter <= 12; chapter++) {
      state = adventureReducer(state, { type: "contribution-enter", chapter });
      for (const operation of chapterEvents[chapter]) {
        state = adventureReducer(state, { type: "chain-event", event: operation });
        expect(state.feedbackKind, state.feedback).toBe("success");
        expect(parseAdventure(state)).not.toBeNull();
        saveAdventure(localStorage, state);
        state = adventureReducer(state, { type: "hydrate", save: loadAdventure(localStorage).save });
      }
      expect(chainCompleted(replayChain(state.journey.simulation.events)!)).toContain(chapter);
    }
    expect(replayChain(state.journey.simulation.events)?.release?.tag).toBe("v1.0.1");
    expect(state.completed).toBe(true);
  });
  it("无角色、无鉴宝、越级和地图外操作都不能通过", () => {
    let state = adventureReducer(initialAdventure(), { type: "hydrate", save: null });
    expect(adventureReducer(state, { type: "contribution-enter", chapter: 7 }).feedbackKind).toBe("error");
    state = ready();
    expect(adventureReducer(state, { type: "contribution-enter", chapter: 10 }).feedbackKind).toBe("error");
    expect(adventureReducer(state, { type: "chain-event", event: event("inspect-issues") }).journey.simulation.events).toHaveLength(0);
    state = adventureReducer(state, { type: "contribution-enter", chapter: 7 });
    expect(adventureReducer(state, { type: "chain-event", event: event("fetch", "upstream") }).feedbackKind).toBe("error");
  });
  it.each([7,8,9,10,11,12])("第 %i 章错误、重试、重复操作均有独立判定", chapter => {
    const prior = Object.entries(chapterEvents).filter(([id]) => Number(id) < chapter).flatMap(([,events]) => events);
    let model = replayChain(prior)!;
    const invalid = { 7:event("issue"), 8:event("remote-push","upstream"), 9:event("commit"), 10:event("pr"), 11:event("resolve"), 12:event("merge") }[chapter]!;
    expect(applyChainEvent(model, invalid).kind).toBe("error");
    for (const operation of chapterEvents[chapter]) model = applyChainEvent(model, operation).model;
    expect(chainCompleted(model)).toContain(chapter);
    expect(applyChainEvent(model, chapterEvents[chapter].at(-1)!).changed).toBe(false);
  });
  it("Stage 保存快照，不把后续工作区改动偷偷加入 Commit", () => {
    const prior = [...chapterEvents[7], ...chapterEvents[8], ...chapterEvents[9].slice(0,4)];
    let m = replayChain(prior)!;
    m = applyChainEvent(m, event("edit", reviewedReadme)).model;
    expect(m.staged).toBe(fixedReadme);
    m = applyChainEvent(m, event("commit", "fix: correct south gate")).model;
    expect(m.commits[0].readme).toBe(fixedReadme);
    expect(m.readme).toBe(reviewedReadme);
  });
  it("伪造完成、跳步日志和未来版本不能导入；旧 B 存档可接续", () => {
    const state = ready();
    const old = JSON.parse(JSON.stringify(state));
    delete old.journey.simulation;
    delete old.journey.regions;
    expect(parseAdventure(old)?.journey.simulation.events).toEqual([]);
    expect(parseAdventure(old)?.journey.regions.version).toBe(1);
    expect(parseAdventure({ ...state, journey: { ...state.journey, simulation: { ...state.journey.simulation, version:99 } } })).toBeNull();
    const fake = { ...state, journey: { ...state.journey, simulation: { ...state.journey.simulation, chapter: 12 } } };
    expect(parseAdventure(fake)).toBeNull();
    expect(replayChain([event("merge")])).toBeNull();
    expect(applyChainEvent(initialChainModel(), event("issue")).changed).toBe(false);
  });
  it("草稿和链内状态保存；新一轮鉴宝不清除贡献链，显式重练归档", () => {
    let state = adventureReducer(ready(), { type: "contribution-enter", chapter: 7 });
    state = adventureReducer(state, { type: "chain-draft", key: "issue-title", value: "未完成的标题" });
    state = adventureReducer(state, { type: "chain-event", event: event("inspect-issues") });
    saveAdventure(localStorage,state);
    expect(loadAdventure(localStorage).save?.journey.simulation.drafts["issue-title"]).toBe("未完成的标题");
    const repeat = adventureReducer(state, { type: "chain-event", event: event("inspect-issues") });
    expect(repeat.feedbackKind).toBe("info");
    expect(repeat.journey.simulation.events).toHaveLength(1);
    const reset = adventureReducer(state, { type: "chain-restart" });
    expect(reset.journey.simulation.archives).toHaveLength(1);
    expect(reset.completed).toBe(true);
  });
});
