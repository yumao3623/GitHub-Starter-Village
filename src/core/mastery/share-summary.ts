import { vocabulary } from "@/content/vocabulary/zh-CN";
import { chainCompleted, replayChain } from "@/core/game/contribution";
import { completedGoals, type AdventureSave } from "@/core/game/adventure";
import { learningEvidence } from "./adventure-evidence";

export function shareSummary(state: AdventureSave) {
  const total = vocabulary.filter(t => t.priority === "P0");
  const assessed = total.filter(t => {
    const evidence = learningEvidence(state, t.id);
    return evidence.assessed.length > 0 && evidence.assessed.length === evidence.practiced.length;
  }).length;
  const results = Object.values(state.journey.metrics.firstAssessment);
  const chapters = chainCompleted(replayChain(state.journey.simulation.events)!).length;
  const regions = completedGoals(state).filter(id => id.startsWith("region-")).length;
  return {
    chapters: `${chapters} / 6（区域 ${regions} / 4）`,
    title: chapters === 6 ? "百炼修图人" : "江湖历练者",
    mastery: assessed ? `${Math.round(assessed / total.length * 100)}% · ${assessed}/${total.length}` : "未评估 · 不授予掌握",
    accuracy: results.length ? `${Math.round(results.filter(Boolean).length / results.length * 100)}% · ${results.length} 次首答` : "未评估",
    duration: state.journey.metrics.activeMs ? `${Math.floor(state.journey.metrics.activeMs / 60000)} 分 ${Math.floor(state.journey.metrics.activeMs / 1000) % 60} 秒` : "暂无记录",
  };
}
