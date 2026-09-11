import { z } from "zod";

export const worldNodeSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), view: z.enum(["choose", "market", "pavilion"]),
  x: z.number().min(0).max(100), y: z.number().min(0).max(100),
  dependsOn: z.array(z.string()), requiredGoals: z.array(z.string()),
  kind: z.enum(["camp", "minigame", "preview"]), description: z.string(),
  chapter: z.number().int().min(7).max(12).optional(),
  region: z.enum(["guide","safety","follow","governance"]).optional(),
});
export type WorldNode = z.infer<typeof worldNodeSchema>;
export const worldNodes: WorldNode[] = [
  { id: "inn", title: "云溪客栈", view: "choose", x: 20, y: 64, dependsOn: [], requiredGoals: [], kind: "camp", description: "更换角色，保留历练" },
  { id: "market", title: "集市鉴宝", view: "market", x: 22, y: 33, dependsOn: ["inn"], requiredGoals: [], kind: "minigame", description: "核对证据，再交付推荐" },
  { id: "pavilion", title: "飞鸽台", view: "pavilion", x: 10, y: 19, dependsOn: ["market"], requiredGoals: ["market-delivered"], kind: "preview", description: "回看信使委托，或从悬赏亭开始贡献链" },
  ...[
    [7, "悬赏亭", 38, 23], [8, "双城驿站", 53, 55], [9, "分流竹林", 44, 42],
    [10, "合卷台", 76, 47], [11, "议事堂", 83, 22], [12, "百炼炉", 90, 36],
  ].map(([chapter, title, x, y]) => ({ id: `chapter-${chapter}`, title: String(title), chapter: Number(chapter), view: "pavilion" as const, x: Number(x), y: Number(y), dependsOn: [Number(chapter) === 7 ? "pavilion" : `chapter-${Number(chapter) - 1}`], requiredGoals: [Number(chapter) === 7 ? "market-delivered" : `chain-${Number(chapter) - 1}`], kind: "minigame" as const, description: `第 ${chapter} 章 · 操作型协作任务` })),
  { id:"region-guide",region:"guide",title:"村口路标",view:"pavilion",x:9,y:47,dependsOn:["market"],requiredGoals:["market-delivered"],kind:"minigame",description:"导览回访：为读说明、装应用与取源码整理行囊" },
  { id:"region-safety",region:"safety",title:"护身堂",view:"pavilion",x:38,y:64,dependsOn:["market"],requiredGoals:["market-delivered"],kind:"minigame",description:"核对域名与安全保管区，不填写真实秘密" },
  { id:"region-follow",region:"follow",title:"飞鸽分拣局",view:"pavilion",x:61,y:32,dependsOn:["market"],requiredGoals:["market-delivered"],kind:"minigame",description:"改变订阅设置，观察模拟信箱" },
  { id:"region-governance",region:"governance",title:"藏经院",view:"pavilion",x:78,y:67,dependsOn:["chapter-12"],requiredGoals:["chain-12"],kind:"minigame",description:"装配社区文书，选择私密漏洞报告渠道" },
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
