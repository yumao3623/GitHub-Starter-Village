import { z } from "zod";

export const worldNodeSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), view: z.enum(["choose", "market", "pavilion"]),
  x: z.number().min(0).max(100), y: z.number().min(0).max(100),
  dependsOn: z.array(z.string()), requiredGoals: z.array(z.string()),
  kind: z.enum(["camp", "minigame", "preview"]), description: z.string(),
});
export type WorldNode = z.infer<typeof worldNodeSchema>;
export const worldNodes: WorldNode[] = [
  { id: "inn", title: "云溪客栈", view: "choose", x: 18, y: 67, dependsOn: [], requiredGoals: [], kind: "camp", description: "更换角色，保留历练" },
  { id: "market", title: "集市鉴宝", view: "market", x: 50, y: 48, dependsOn: ["inn"], requiredGoals: [], kind: "minigame", description: "核对证据，再交付推荐" },
  { id: "pavilion", title: "飞鸽台", view: "pavilion", x: 82, y: 27, dependsOn: ["market"], requiredGoals: ["market-delivered"], kind: "preview", description: "剧情预告；完整玩法在阶段 C 制作" },
];

export function validateWorld(nodes: WorldNode[], knownGoals: string[]): string[] {
  const errors: string[] = [];
  const ids = nodes.map(node => node.id);
  if (new Set(ids).size !== ids.length) errors.push("地点 ID 重复");
  const done = new Set<string>(); const visiting = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) { errors.push(`地图存在环：${id}`); return; }
    if (done.has(id)) return;
    const node = nodes.find(item => item.id === id);
    if (!node) { errors.push(`缺少地点：${id}`); return; }
    visiting.add(id); node.dependsOn.forEach(visit); visiting.delete(id); done.add(id);
  }
  for (const node of nodes) {
    if (!worldNodeSchema.safeParse(node).success) errors.push(`地点结构不合法：${node.id}`);
    node.requiredGoals.forEach(goal => { if (!knownGoals.includes(goal)) errors.push(`未知目标：${goal}`); });
    visit(node.id);
  }
  return errors;
}

export function canEnterNode(id: string, goals: readonly string[], nodes = worldNodes): boolean {
  const visiting = new Set<string>();
  function check(key: string): boolean {
    const node = nodes.find(item => item.id === key);
    if (!node || visiting.has(key)) return false;
    visiting.add(key);
    const allowed = node.requiredGoals.every(goal => goals.includes(goal)) && node.dependsOn.every(check);
    visiting.delete(key); return allowed;
  }
  return check(id);
}
