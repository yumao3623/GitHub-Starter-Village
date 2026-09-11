import { describe, expect, it } from "vitest";
import { adventureReducer, initialAdventure, parseAdventure, toLegacy, completedGoals, type AdventureState, type AdventureAction } from "@/core/game/adventure";
import { getProjects, categories } from "@/content/minigames/appraisal";
import { canEnterNode, validateWorld, worldNodes } from "@/content/world";
import { learningEvidence } from "@/core/mastery/adventure-evidence";
import { ADVENTURE_STORAGE_KEY, PHASE_A_STORAGE_KEY, loadAdventure, saveAdventure, backupAdventure, serializeAdventure } from "@/core/persistence/adventure-storage";

function start() {
  let state = adventureReducer(initialAdventure(), { type: "hydrate", save: null });
  state = adventureReducer(state, { type: "character", id: "atuan" });
  return adventureReducer(state, { type: "travel", nodeId: "market" });
}
function solve(state: AdventureState) {
  for (const project of getProjects(state.variant)) {
    for (const category of categories) {
      const fact = project.facts.find(item => item.category === category)!;
      state = adventureReducer(state, { type: "inspect", project: project.id, tab: fact.tab });
      state = adventureReducer(state, { type: "collect", factId: fact.id });
      state = adventureReducer(state, { type: "attach", category });
    }
    state = adventureReducer(state, { type: "verdict", verdict: project.verdict });
  }
  return adventureReducer(state, { type: "deliver", project: getProjects(state.variant).find(item => item.verdict === "suitable")!.id });
}
describe("phase B world, actions, dialogue and evidence", () => {
  it("denies unknown IDs, navigation shortcuts and malformed actions", () => {
    const state = start();
    for (const action of [{ type: "travel", nodeId: "pavilion" }, { type: "travel", nodeId: "missing" }, { type: "navigate", view: "pavilion" }, { type: "navigate", view: "ending" }]) expect(adventureReducer(state, action as AdventureAction).view).toBe("market");
    expect(adventureReducer(state, { type: "attach", category: "invalid" } as unknown as AdventureAction)).toBe(state);
    expect(canEnterNode("missing", [])).toBe(false);
  });
  it("detects graph cycles, missing dependencies and unknown goal references", () => {
    expect(validateWorld(worldNodes, ["market-delivered", ...[7,8,9,10,11,12].map(chapter => `chain-${chapter}`)])).toEqual([]);
    expect(validateWorld([{ ...worldNodes[0], dependsOn: ["inn"] }], [])).not.toEqual([]);
    expect(validateWorld([{ ...worldNodes[0], dependsOn: ["missing"] }], [])).not.toEqual([]);
    expect(validateWorld(worldNodes, [])).not.toEqual([]);
  });
  it("preserves completed unlocks and immutable receipts across replay, duplicate delivery and reload", () => {
    const completed = solve(start());
    const duplicate = adventureReducer(completed, { type: "deliver", project: "reed" });
    expect(duplicate.journey.archives).toHaveLength(1);
    const replay = adventureReducer(duplicate, { type: "new-round" });
    expect(replay.completed).toBe(false);
    expect(completedGoals(replay)).toContain("market-delivered");
    expect(adventureReducer(replay, { type: "travel", nodeId: "pavilion" }).view).toBe("pavilion");
    expect(parseAdventure(JSON.parse(serializeAdventure(replay)))?.journey.archives).toEqual(completed.journey.archives);
    expect(learningEvidence(replay, "license").practiced).toHaveLength(1);
    expect(learningEvidence(replay, "license").assessed).toHaveLength(0);
  });
  it("does not replace an unfinished replay even after returning to map", () => {
    let state = adventureReducer(solve(start()), { type: "new-round" });
    state = adventureReducer(state, { type: "inspect", project: "reed", tab: "license" });
    state = adventureReducer(state, { type: "navigate", view: "map" });
    const attempted = adventureReducer(state, { type: "start-assessment" });
    expect(attempted.inspected).toEqual(state.inspected);
    expect(attempted.variant).toBe(state.variant);
  });
  it("records an independent transfer only after validated operation goals, never from reading or aided assessment", () => {
    const completed = solve(start());
    let test = adventureReducer(completed, { type: "start-assessment" });
    expect(test.variant).not.toBe(completed.variant);
    test = adventureReducer(test, { type: "encounter", termId: "license" });
    expect(learningEvidence(test, "license").assessed).toEqual([]);
    const aided = solve(adventureReducer(test, { type: "request-hint" }));
    expect(learningEvidence(aided, "license").assessed).toEqual([]);
    const independent = solve(adventureReducer(aided, { type: "start-assessment" }));
    expect(learningEvidence(independent, "license").assessed).toEqual(["permission-evidence"]);
    expect(learningEvidence(independent, "commit").supported).toBe(false);
    expect(parseAdventure(independent)).not.toBeNull();
    const mapped = adventureReducer(adventureReducer(completed, { type: "start-assessment" }), { type: "navigate", view: "map" });
    expect(adventureReducer(mapped, { type: "request-hint" }).journey.run.aided).toBe(true);
  });
  it("bounds dialogue cursors, saves replay position and never completes a task via dialogue", () => {
    let state = start();
    for (let i = 0; i < 8; i++) state = adventureReducer(state, { type: "dialogue", id: "market-commission", operation: "next" });
    expect(state.journey.dialogues["market-commission"].index).toBe(2);
    state = adventureReducer(state, { type: "dialogue", id: "market-commission", operation: "dismiss" });
    expect(parseAdventure(state)?.journey.dialogues["market-commission"].dismissed).toBe(true);
    expect(state.completed).toBe(false);
    expect(adventureReducer(state, { type: "dialogue", id: "pavilion-letter", operation: "next" })).toBe(state);
  });
});
describe("phase B non-destructive storage migration", () => {
  it("migrates partial phase A field-for-field, preserving the original key", () => {
    localStorage.clear();
    const partial = adventureReducer(start(), { type: "inspect", project: "cloud", tab: "license" });
    const old = JSON.stringify(toLegacy(partial));
    localStorage.setItem(PHASE_A_STORAGE_KEY, old);
    localStorage.setItem("gsv:progress:v1", "legacy-course");
    const migrated = loadAdventure(localStorage).save!;
    expect(migrated.version).toBe(2); expect(toLegacy(migrated)).toEqual(JSON.parse(old));
    saveAdventure(localStorage, migrated);
    expect(localStorage.getItem(PHASE_A_STORAGE_KEY)).toBe(old);
    expect(localStorage.getItem("gsv:progress:v1")).toBe("legacy-course");
  });
  it("preserves completed phase A as practice, not independent assessment", () => {
    const migrated = parseAdventure(toLegacy(solve(start())))!;
    expect(completedGoals(migrated)).toContain("market-delivered");
    expect(learningEvidence(migrated, "license").assessed).toEqual([]);
    expect(migrated.journey.archives[0].origin).toBe("phase-a");
  });
  it("never falls back over a corrupt/newer record and retains each backup", () => {
    localStorage.clear(); localStorage.setItem(PHASE_A_STORAGE_KEY, JSON.stringify(toLegacy(start())));
    localStorage.setItem(ADVENTURE_STORAGE_KEY, "broken");
    expect(loadAdventure(localStorage).issue).toBeTruthy();
    backupAdventure(localStorage, "reset");
    localStorage.setItem(ADVENTURE_STORAGE_KEY, "another-record");
    backupAdventure(localStorage, "reset");
    expect(localStorage.getItem(`${ADVENTURE_STORAGE_KEY}:before-reset`)).toBe("broken");
    expect(localStorage.getItem(`${ADVENTURE_STORAGE_KEY}:before-reset:1`)).toBe("another-record");
    localStorage.setItem(ADVENTURE_STORAGE_KEY, JSON.stringify({ ...start(), version: 99 }));
    expect(loadAdventure(localStorage).save).toBeNull();
  });
  it("rejects forged receipts, repeated IDs and impossible dialogue progress", () => {
    const state = start();
    expect(parseAdventure({ ...state, journey: { ...state.journey, lastNode: "pavilion" } })).toBeNull();
    const complete = solve(state);
    expect(parseAdventure({ ...complete, journey: { ...complete.journey, archives: [...complete.journey.archives, ...complete.journey.archives] } })).toBeNull();
    expect(parseAdventure({ ...state, journey: { ...state.journey, dialogues: { "market-commission": { index: 99, dismissed: false } } } })).toBeNull();
  });
});
