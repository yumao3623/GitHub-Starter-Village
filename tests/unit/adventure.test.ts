import { describe, expect, it } from "vitest";
import { adventureReducer, initialAdventure, parseAdventure, type AdventureState } from "@/core/game/appraisal";
import { categories, getProjects } from "@/content/minigames/appraisal";
import { ADVENTURE_STORAGE_KEY, loadAdventure, saveAdventure } from "@/core/persistence/adventure-storage";

function start() {
  let state = adventureReducer(initialAdventure(), { type: "hydrate", save: null });
  state = adventureReducer(state, { type: "character", id: "atuan" });
  return adventureReducer(state, { type: "navigate", view: "market" });
}
function appraise(state: AdventureState) {
  for (const project of getProjects(state.variant)) {
    for (const category of categories) {
      const fact = project.facts.find(f => f.category === category)!;
      state = adventureReducer(state, { type: "inspect", project: project.id, tab: fact.tab });
      state = adventureReducer(state, { type: "collect", factId: fact.id });
      state = adventureReducer(state, { type: "attach", category });
    }
    state = adventureReducer(state, { type: "verdict", verdict: project.verdict });
  }
  return state;
}
describe("phase A evidence-based progression", () => {
  it("guards scene access before character and before completion", () => {
    expect(adventureReducer(initialAdventure(), { type: "navigate", view: "market" }).view).toBe("choose");
    const state = adventureReducer(start(), { type: "navigate", view: "pavilion" });
    expect(state.view).toBe("market"); expect(state.feedback).toContain("迷雾");
  });
  it("does not collect unseen or foreign evidence", () => {
    const state = adventureReducer(start(), { type: "collect", factId: "reed-license" });
    expect(state.collected).toEqual([]);
    expect(adventureReducer(state, { type: "collect", factId: "cloud-license" }).collected).toEqual([]);
  });
  it("rejects popularity and wrong categories without losing valid work", () => {
    let state = start();
    state = adventureReducer(state, { type: "inspect", project: "reed", tab: "stars" });
    state = adventureReducer(state, { type: "collect", factId: "reed-stars" });
    state = adventureReducer(state, { type: "attach", category: "permission" });
    expect(state.feedback).toContain("Stars"); expect(state.dossiers.reed.slots.permission).toBeNull();
    state = adventureReducer(state, { type: "inspect", project: "reed", tab: "requirements" });
    state = adventureReducer(state, { type: "collect", factId: "reed-requirements" });
    state = adventureReducer(state, { type: "attach", category: "permission" });
    expect(state.feedbackKind).toBe("error");
    state = adventureReducer(state, { type: "attach", category: "environment" });
    expect(state.dossiers.reed.slots.environment).toBe("reed-requirements");
  });
  it("does not appraise or deliver without complete evidence", () => {
    let state = adventureReducer(start(), { type: "verdict", verdict: "suitable" });
    expect(state.dossiers.reed.verdict).toBeNull();
    state = adventureReducer(state, { type: "deliver", project: "reed" });
    expect(state.completed).toBe(false);
  });
  it("completes only all dossiers plus the correct final recommendation", () => {
    let state = appraise(start());
    state = adventureReducer(state, { type: "deliver", project: "mist" });
    expect(state.completed).toBe(false);
    state = adventureReducer(state, { type: "deliver", project: "reed" });
    expect(state.completed).toBe(true); expect(state.view).toBe("ending");
    expect(parseAdventure(state)?.completed).toBe(true);
    expect(adventureReducer(state, { type: "navigate", view: "pavilion" }).view).toBe("pavilion");
  });
  it("replay changes the suitable project, clears round evidence and preserves identity", () => {
    let state = adventureReducer(appraise(start()), { type: "deliver", project: "reed" });
    state = adventureReducer(state, { type: "new-round" });
    expect(state.variant).toBe(1); expect(state.character).toBe("atuan"); expect(state.completed).toBe(false);
    expect(state.collected).toHaveLength(0);
    state = appraise(state);
    expect(adventureReducer(state, { type: "deliver", project: "reed" }).completed).toBe(false);
    expect(adventureReducer(state, { type: "deliver", project: "cloud" }).completed).toBe(true);
  });
});
describe("local save validation", () => {
  it("round-trips partial progress without touching the legacy key", () => {
    localStorage.clear(); localStorage.setItem("legacy", "untouched");
    const state = adventureReducer(start(), { type: "inspect", project: "cloud", tab: "license" });
    saveAdventure(localStorage, state);
    expect(loadAdventure(localStorage).save?.activeProject).toBe("cloud");
    expect(localStorage.getItem("legacy")).toBe("untouched");
  });
  it("leaves broken or future records intact and reports the problem", () => {
    for (const raw of ["not json", JSON.stringify({ ...start(), version: 99 })]) {
      localStorage.setItem(ADVENTURE_STORAGE_KEY, raw);
      expect(loadAdventure(localStorage).issue).toBeTruthy();
      expect(localStorage.getItem(ADVENTURE_STORAGE_KEY)).toBe(raw);
    }
  });
  it("rejects invalid IDs, impossible unlocks and unsupported completion flags", () => {
    expect(parseAdventure({ ...start(), collected: ["made-up"] })).toBeNull();
    expect(parseAdventure({ ...start(), completed: true })).toBeNull();
    expect(parseAdventure({ ...start(), view: "pavilion" })).toBeNull();
    expect(parseAdventure({ ...start(), selectedFact: "reed-license" })).toBeNull();
  });
  it("exposes storage failures instead of silently treating them as a fresh record", () => {
    expect(loadAdventure({ getItem: () => { throw new Error("denied"); } }).issue).toBeTruthy();
  });
});
