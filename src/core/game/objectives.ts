import { appraisalObjectives } from "@/content/minigames/objectives";
import { getProjects, projectIds } from "@/content/minigames/appraisal";
import { allAppraised, type AdventureSave } from "./appraisal";
import { evaluateGoals } from "./minigame-contract";

export function achievedObjectives(state: AdventureSave): string[] {
  return evaluateGoals(state, appraisalObjectives, (state, rule) => {
    if (rule.kind === "delivered") return state.completed && allAppraised(state);
    if (rule.kind === "appraised") return allAppraised(state);
    return projectIds.every(id => {
      const factId = state.dossiers[id].slots[rule.category];
      const fact = getProjects(state.variant).find(project => project.id === id)?.facts.find(item => item.id === factId);
      return fact?.category === rule.category && state.inspected.includes(fact.id) && state.collected.includes(fact.id);
    });
  });
}
