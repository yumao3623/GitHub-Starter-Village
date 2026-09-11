import { describe, expect, it } from "vitest";
import { demoSnapshot, demoStops } from "@/core/game/demo";
import { adventureReducer, initialAdventure, parseAdventure } from "@/core/game/adventure";
import { shareSummary } from "@/core/mastery/share-summary";
import { actionAssets, characterAssetSchema } from "@/content/characters/assets";
describe("phase D recording, sharing and compatibility", () => {
  it("all recording presets replay valid game events for all three characters", () => {
    for (const id of ["atuan", "xingzhou", "zhiwei"] as const) for (const stop of demoStops) {
      const state = demoSnapshot(stop.id, id);
      expect(parseAdventure(state), stop.id).not.toBeNull();
      expect(state.sessionMode).toBe("demo");
    }
  });
  it("uses actual simulation events, never deprecated completion flags", () => {
    const done = demoSnapshot("ending");
    expect(done.journey.contribution.completedChapters).toEqual([]);
    expect(shareSummary(done).chapters).toContain("6 / 6");
    expect(shareSummary(done).mastery).toContain("未评估");
    expect(shareSummary(initialAdventure()).chapters).toContain("0 / 6");
  });
  it("migrates pre-D saves with zero time, no invented accuracy, audio off", () => {
    const old = JSON.parse(JSON.stringify(demoSnapshot("chapter-9")));
    delete old.journey.metrics;
    expect(parseAdventure(old)?.journey.metrics).toEqual({ activeMs: 0, sound: false, firstAssessment: {} });
  });
  it("accepts only bounded mainline time increments", () => {
    const start = adventureReducer(initialAdventure(), { type: "hydrate", save: null });
    expect(adventureReducer(start, { type: "active-time", milliseconds: 2000 }).journey.metrics.activeMs).toBe(2000);
    for (const milliseconds of [-1, NaN, Infinity, 999999]) expect(adventureReducer(start, { type: "active-time", milliseconds }).journey.metrics.activeMs).toBe(0);
    expect(adventureReducer(demoSnapshot("market"), { type: "active-time", milliseconds: 2000 }).journey.metrics.activeMs).toBe(0);
  });
  it("has valid same-identity action crops", () => {
    expect(actionAssets).toHaveLength(9);
    for (const asset of actionAssets) expect(characterAssetSchema.safeParse(asset).success).toBe(true);
  });
  it("does not wash out a wrong first assessment answer with retries", () => {
    let state = adventureReducer(demoSnapshot("ending"), { type:"start-assessment" });
    state = adventureReducer(state, { type:"deliver", project:"reed" });
    state = adventureReducer(state, { type:"inspect", project:"cloud",tab:"requirements" });
    state = adventureReducer(state, { type:"deliver", project:"cloud" });
    expect(Object.values(state.journey.metrics.firstAssessment)).toEqual([false]);
    expect(shareSummary(state).accuracy).toBe("0% · 1 次首答");
  });
});
