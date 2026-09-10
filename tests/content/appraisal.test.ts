import { describe, expect, it } from "vitest";
import { appraisalSources, categories, getProjects } from "@/content/minigames/appraisal";
import { vocabulary } from "@/content/vocabulary/zh-CN";
import { brandConfig } from "@/config/brand";
import desktopConfig from "@/config/desktop.json";
describe("appraisal content", () => {
  it("keeps desktop display identity aligned with the brand", () => {
    expect(desktopConfig.displayName).toBe(brandConfig.chineseName);
  });
  it("has sourced definitions and unique evidence per variant", () => {
    for (const variant of [0, 1]) {
      const projects = getProjects(variant);
      const facts = projects.flatMap(p => p.facts);
      expect(new Set(facts.map(f => f.id)).size).toBe(facts.length);
      expect(projects.filter(p => p.verdict === "suitable")).toHaveLength(1);
      for (const project of projects) for (const category of categories) expect(project.facts.filter(f => f.category === category)).toHaveLength(1);
      for (const fact of facts) expect(vocabulary.some(term => term.id === fact.termId)).toBe(true);
    }
    for (const source of appraisalSources) {
      expect(new URL(source.url).hostname).toBe("docs.github.com");
      expect(source.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
