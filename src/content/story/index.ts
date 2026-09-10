import { z } from "zod";

export const dialogueSchema = z.object({
  id: z.string(), nodeId: z.string(), speaker: z.string(), role: z.string(),
  lines: z.array(z.string().min(1)).min(1), requiredGoals: z.array(z.string()),
});
export const dialogues = [
  { id: "market-commission", nodeId: "market", speaker: "青砚", role: "鉴图人", requiredGoals: [], lines: [
    "少侠，村里共同维护《江湖夜行图》。在修订路线之前，我们先为它挑一件趁手的地图工具。",
    "查每卷的运行环境、使用许可与维护线索，再留下证据。受欢迎不等于适合当前委托。",
    "你可以随时回看委托、查阅武林宝典。看完故事不会自动完成鉴宝，卷宗还等你亲自查验。",
  ] },
  { id: "pavilion-letter", nodeId: "pavilion", speaker: "云笺", role: "驿站信使", requiredGoals: ["market-delivered"], lines: [
    "青砚的推荐卷宗收到了。你的证据会随信送到夜行图的维护者手中。",
    "下一段旅程将学习收藏、通知与关注的区别。这里暂时只有剧情预告，不会因为读完信就授予下一关通关。",
    "先把卷宗收好。你可以回集市复习，也可以查看真实 Fork 与 Clone 指南。",
  ] },
] .map(item => dialogueSchema.parse(item));
export const dialogueById = (id: string) => dialogues.find(item => item.id === id);
