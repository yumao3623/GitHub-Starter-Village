import { z } from "zod";
import { characters, characterAtlas, type CharacterId } from ".";

export const characterAssetSchema = z.object({
  id: z.string(), characterId: z.enum(["xingzhou", "zhiwei", "atuan"]), revision: z.number().int().positive(),
  path: z.string().startsWith("/characters/"), atlasWidth: z.number().positive(), atlasHeight: z.number().positive(),
  crop: z.object({ x: z.number().nonnegative(), y: z.number().nonnegative(), width: z.number().positive(), height: z.number().positive() }),
  sourceRecord: z.string(), provenance: z.literal("generated-original"), status: z.literal("approved-phase-a"),
  consistencyAnchors: z.array(z.string()).min(2),
}).refine(asset => asset.crop.x + asset.crop.width <= asset.atlasWidth && asset.crop.y + asset.crop.height <= asset.atlasHeight, "角色裁切超出图集");

export const characterAssets = characters.map(character => characterAssetSchema.parse({
  id: `${character.id}-standing-v1`, characterId: character.id, revision: 1,
  path: characterAtlas.path, atlasWidth: characterAtlas.width, atlasHeight: characterAtlas.height,
  crop: { x: character.x, y: 0, width: character.width, height: characterAtlas.height },
  sourceRecord: "docs/assets/PHASE_A_ASSETS.md", provenance: "generated-original", status: "approved-phase-a",
  consistencyAnchors: ["保持阶段 A 原始图集中的衣着与轮廓", character.id === "atuan" ? "保持猫毛色、花纹与尾部一致" : "保持发型、面部和随身物件一致"],
}));
export type CharacterPose = "standing" | "portrait" | "walking" | "celebrating";
export function resolveCharacterAsset(id: CharacterId, pose: CharacterPose = "standing") {
  const asset = characterAssets.find(item => item.characterId === id)!;
  // Phase B defines the contract, not nonexistent expression/animation frames.
  return { ...asset, requestedPose: pose, renderedPose: "standing" as const, fallback: pose !== "standing" };
}
