import { characterAssets, characterAssetSchema } from "@/content/characters/assets";
import { characters } from "@/content/characters";
import { dialogues, dialogueSchema } from "@/content/story";
import { worldNodes, validateWorld } from "@/content/world";
import { appraisalObjectives, objectiveSchema } from "@/content/minigames/objectives";
import { vocabulary } from "@/content/vocabulary/zh-CN";

export function validateAdventureContent() {
  const errors = validateWorld(worldNodes, appraisalObjectives.map(goal => goal.id));
  const unique = (ids: string[], scope: string) => { if (new Set(ids).size !== ids.length) errors.push(`${scope} ID 重复`); };
  unique(characterAssets.map(asset => asset.id), "角色资源");
  unique(dialogues.map(dialogue => dialogue.id), "对话");
  unique(appraisalObjectives.map(goal => goal.id), "目标");
  for (const character of characters) if (!characterAssets.some(asset => asset.characterId === character.id)) errors.push(`角色无资源：${character.id}`);
  for (const asset of characterAssets) if (!characterAssetSchema.safeParse(asset).success) errors.push(`资源不合法：${asset.id}`);
  for (const goal of appraisalObjectives) {
    if (!objectiveSchema.safeParse(goal).success) errors.push(`目标不合法：${goal.id}`);
    goal.termIds.forEach(id => { if (!vocabulary.some(term => term.id === id)) errors.push(`目标引用未知术语：${id}`); });
  }
  for (const dialogue of dialogues) {
    if (!dialogueSchema.safeParse(dialogue).success) errors.push(`对话不合法：${dialogue.id}`);
    if (!worldNodes.some(node => node.id === dialogue.nodeId)) errors.push(`对话引用未知地点：${dialogue.id}`);
    for (const goal of dialogue.requiredGoals) if (!appraisalObjectives.some(item => item.id === goal)) errors.push(`对话引用未知目标：${goal}`);
  }
  return errors;
}
