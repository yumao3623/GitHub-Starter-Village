import { describe, expect, it } from "vitest";
import { adventureReducer, initialAdventure } from "@/core/game/adventure";

describe("阶段 F 入村主线", () => {
  it("必须先选角，再按顺序完成第 0 章三步", () => {
    let state = adventureReducer(initialAdventure(), { type: "hydrate", save: null });
    state = adventureReducer(state, { type: "character", id: "atuan" });
    state = adventureReducer(state, { type: "navigate", view: "map" });
    state = adventureReducer(state, { type: "travel", nodeId: "chapter-0" });
    expect(state.view).toBe("pavilion");
    state = adventureReducer(state, { type: "foundation-step", chapter: 0, step: 0 });
    state = adventureReducer(state, { type: "foundation-step", chapter: 0, step: 1 });
    state = adventureReducer(state, { type: "foundation-step", chapter: 0, step: 2 });
    expect(state.journey.foundations).toContain(0);
    expect(state.journey.foundationProgress["0"]).toBe(3);
  });

  it("未完成前置章节时不能进入后续主线", () => {
    let state = adventureReducer(initialAdventure(), { type: "hydrate", save: null });
    state = adventureReducer(state, { type: "character", id: "atuan" });
    state = adventureReducer(state, { type: "navigate", view: "map" });
    state = adventureReducer(state, { type: "travel", nodeId: "chapter-4" });
    expect(state.view).toBe("map");
    expect(state.feedbackKind).toBe("error");
  });
});
