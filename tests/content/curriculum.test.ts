import { describe, expect, it } from "vitest";
import { missions } from "@/content/missions/zh-CN";
import { graduationQuiz } from "@/content/quizzes/zh-CN/graduation";
import { p0TermIds, p1TermIds, vocabulary } from "@/content/vocabulary/zh-CN";

describe("curriculum coverage", () => {
  const mainline = new Set(missions.flatMap((item) => item.termIds));
  it("covers all P0 and P1 terms in the mainline", () => {
    expect(p0TermIds.every((id) => mainline.has(id))).toBe(true);
    expect(p1TermIds.every((id) => mainline.has(id))).toBe(true);
  });
  it("covers every P0 term in graduation quiz", () => {
    const covered = new Set(graduationQuiz.map((item) => item.termId));
    expect(p0TermIds.every((id) => covered.has(id))).toBe(true);
  });
  it("has no duplicate IDs", () => {
    expect(new Set(vocabulary.map((item) => item.id)).size).toBe(vocabulary.length);
    expect(new Set(missions.map((item) => item.id)).size).toBe(missions.length);
  });
  it("does not reveal answers through one repeated option position", () => {
    expect(new Set(missions.flatMap((item) => item.tasks.map((task) => task.correctIndex))).size).toBeGreaterThan(1);
    expect(new Set(graduationQuiz.map((item) => item.correctIndex)).size).toBe(2);
  });
});
