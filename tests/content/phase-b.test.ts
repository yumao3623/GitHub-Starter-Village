import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { characterAssets, characterAssetSchema, resolveCharacterAsset } from "@/content/characters/assets";
import { validateAdventureContent } from "@/core/validation/adventure-content";

describe("phase B content contracts", () => {
  it("validates graph, goals, terms, story references and asset identities", () => {
    expect(validateAdventureContent()).toEqual([]);
    for (const asset of characterAssets) {
      expect(existsSync(join(process.cwd(), "public", asset.path))).toBe(true);
      expect(existsSync(join(process.cwd(), asset.sourceRecord))).toBe(true);
    }
  });
  it("uses a declared same-character fallback, not fabricated animation frames", () => {
    expect(resolveCharacterAsset("atuan", "walking")).toMatchObject({ characterId: "atuan", renderedPose: "standing", fallback: true });
    expect(characterAssetSchema.safeParse({ ...characterAssets[0], crop: { x: 1500, y: 0, width: 500, height: 1024 } }).success).toBe(false);
  });
});
