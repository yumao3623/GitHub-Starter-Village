import { describe, expect, it } from "vitest";
import { gameReducer, initialGameState } from "@/core/game/reducer";

describe("gameReducer", () => {
  it("records a correct answer and masters unique P0 terms", () => {
    const state = gameReducer(initialGameState, { type: "answer-task", taskId: "task-1", selectedIndex: 0, correct: true, p0TermIds: ["fork", "fork", "clone"] });
    expect(state.taskAttempts["task-1"]).toEqual({ attempts: 1, correct: true, selectedIndex: 0 });
    expect(state.masteredP0TermIds).toEqual(["fork", "clone"]);
  });

  it("does not punish or erase progress after a wrong retry", () => {
    const complete = { ...initialGameState, completedMissionIds: ["chapter-4"] };
    const state = gameReducer(complete, { type: "answer-task", taskId: "task-2", selectedIndex: 1, correct: false, p0TermIds: ["branch"] });
    expect(state.completedMissionIds).toEqual(["chapter-4"]);
    expect(state.masteredP0TermIds).toEqual([]);
  });
});
