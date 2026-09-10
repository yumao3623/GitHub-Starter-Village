import { appraisalObjectives } from "@/content/minigames/objectives";
import { achievedObjectives } from "@/core/game/objectives";
import { toLegacy, type AdventureSave } from "@/core/game/adventure";

export function learningEvidence(state: AdventureSave, termId: string) {
  const relevant = appraisalObjectives.filter(goal => goal.termIds.includes(termId)).map(goal => goal.id);
  const current = achievedObjectives(toLegacy(state));
  const practiced = relevant.filter(id => current.includes(id) || state.journey.archives.some(record => achievedObjectives(record.snapshot).includes(id)));
  const assessed = relevant.filter(id => state.journey.archives.some(record => record.origin === "phase-b" && record.run.mode === "assessment" && !record.run.aided && record.run.baselineVariant !== record.snapshot.variant && achievedObjectives(record.snapshot).includes(id)));
  return { encountered: state.journey.encountered.includes(termId), practiced, assessed, supported: relevant.length > 0 };
}
