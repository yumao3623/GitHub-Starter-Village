import { characterAssets, characterAssetSchema } from "@/content/characters/assets";
import { characters } from "@/content/characters";
import { dialogues, dialogueSchema } from "@/content/story";
import { worldNodes, validateWorld } from "@/content/world";
import { appraisalObjectives, objectiveSchema } from "@/content/minigames/objectives";
import { vocabulary } from "@/content/vocabulary/zh-CN";
import { contributionMissions, chainLessonSchema } from "@/content/minigames/contribution-lessons";
import { contributionGuidanceIds } from "@/content/vocabulary/zh-CN/contribution-review";
import { regionLessons } from "@/content/minigames/region-lessons";
import { practiceSteps, practiceSources } from "@/content/scenarios/field-practice";

export function validateAdventureContent() {
  const errors = validateWorld(worldNodes, [...appraisalObjectives.map(goal => goal.id), ...[7,8,9,10,11,12].map(chapter => `chain-${chapter}`)]);
  const unique = (ids: string[], scope: string) => { if (new Set(ids).size !== ids.length) errors.push(`${scope} ID 重复`); };
  unique(characterAssets.map(asset => asset.id), "角色资源");
  unique(dialogues.map(dialogue => dialogue.id), "对话");
  unique(appraisalObjectives.map(goal => goal.id), "目标");
  unique(contributionMissions.map(item => String(item.chapter)), "贡献链章节");
  unique(practiceSteps.map(step=>step.id), "真实实践步骤");
  for(const url of [...Object.values(regionLessons).map(item=>item.source),...practiceSources.map(item=>item[1])]) if(new URL(url).hostname!=="docs.github.com") errors.push(`实践/支线来源非官方：${url}`);
  if(contributionMissions.length!==6) errors.push("贡献链必须包含完整六章");
  for (const lesson of contributionMissions) {
    if (!chainLessonSchema.safeParse(lesson).success || !["docs.github.com", "git-scm.com"].includes(new URL(lesson.sourceUrl).hostname)) errors.push(`贡献链来源/结构不合法：${lesson.chapter}`);
    for (const id of lesson.termIds) {
      if (!vocabulary.some(term => term.id === id)) errors.push(`贡献链未知词条：${id}`);
      if (!contributionGuidanceIds.includes(id)) errors.push(`贡献链词条未逐条审读：${id}`);
    }
  }
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
