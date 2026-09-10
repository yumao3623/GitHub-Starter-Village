import { missions } from "@/content/missions/zh-CN";

export const uiCoverage = missions.flatMap((mission) =>
  mission.uiTerms.map((english) => ({ english, missionId: mission.id })),
);
