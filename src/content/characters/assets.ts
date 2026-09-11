import { z } from "zod";
import { characters, type CharacterId } from ".";

export const characterAssetSchema = z.object({
  id: z.string(), characterId: z.enum(["xingzhou", "zhiwei", "atuan"]), revision: z.number().int().positive(),
  path: z.string().startsWith("/characters/"), atlasWidth: z.number().positive(), atlasHeight: z.number().positive(),
  crop: z.object({ x: z.number().nonnegative(), y: z.number().nonnegative(), width: z.number().positive(), height: z.number().positive() }),
  sourceRecord: z.string(), provenance: z.literal("generated-original"), status: z.enum(["approved-phase-a", "phase-d-internal-reviewed"]),
  consistencyAnchors: z.array(z.string()).min(2),
}).refine(asset => asset.crop.x + asset.crop.width <= asset.atlasWidth && asset.crop.y + asset.crop.height <= asset.atlasHeight, "角色裁切超出图集");

export const characterAssets = characters.map(character => characterAssetSchema.parse({
  id: `${character.id}-standing-v1`, characterId: character.id, revision: 2,
  path: `/characters/${character.id}-standing.png`, atlasWidth: 420, atlasHeight: 640,
  crop: { x: 0, y: 0, width: 420, height: 640 },
  sourceRecord: "docs/assets/character-sprites-v2.json", provenance: "generated-original", status: "approved-phase-a",
  consistencyAnchors: ["保持阶段 A 原始图集中的衣着与轮廓", character.id === "atuan" ? "保持猫毛色、花纹与尾部一致" : "保持发型、面部和随身物件一致"],
}));
export type CharacterPose = "standing" | "portrait" | "walking" | "inspecting" | "celebrating";
// Transparent generated sprite atlas. Original silhouettes and spacing stay unchanged.
export const actionAssets = characters.flatMap((character, row) => (["walking", "inspecting", "celebrating"] as const).map(pose => characterAssetSchema.parse({
  id: `${character.id}-${pose}-v1`, characterId: character.id, revision: 2,
  path: `/characters/${character.id}-${pose}.png`, atlasWidth: 420, atlasHeight: 640,
  crop: { x: 0, y: 0, width: 420, height: 640 },
  sourceRecord: "docs/assets/character-sprites-v2.json", provenance: "generated-original", status: "phase-d-internal-reviewed",
  consistencyAnchors: characterAssets[row].consistencyAnchors,
})));
export function resolveCharacterAsset(id: CharacterId, pose: CharacterPose = "standing") {
  const action = actionAssets.find(item => item.id === `${id}-${pose}-v1`);
  const asset = action ?? characterAssets.find(item => item.characterId === id)!;
  return { ...asset, requestedPose: pose, renderedPose: action ? pose : "standing", fallback: !action && pose !== "standing" };
}
