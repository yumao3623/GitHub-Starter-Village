import { z } from "zod";

export const worldNodeSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), view: z.enum(["choose", "market", "pavilion"]),
  x: z.number().min(0).max(100), y: z.number().min(0).max(100),
  dependsOn: z.array(z.string()), requiredGoals: z.array(z.string()),
  kind: z.enum(["camp", "minigame", "preview", "foundation"]), description: z.string(),
  chapter: z.number().int().min(0).max(12).optional(),
  region: z.enum(["guide","safety","follow","governance"]).optional(),
});
export type WorldNode = z.infer<typeof worldNodeSchema>;
export const worldNodes: WorldNode[] = [
  { id: "inn", title: "云溪客栈", view: "choose", x: 20, y: 64, dependsOn: [], requiredGoals: [], kind: "camp", description: "更换角色，保留历练" },
  ...[
    [0, "村口路标", 29, 58], [1, "护身堂", 36, 44], [2, "拓印坊", 44, 58], [3, "营火工坊", 52, 42], [4, "藏图阁", 60, 57],
  ].map(([chapter, title, x, y]) => ({ id: `chapter-${chapter}`, title: String(title), chapter: Number(chapter), view: "pavilion" as const, x: Number(x), y: Number(y), dependsOn: [Number(chapter) === 0 ? "inn" : `chapter-${Number(chapter) - 1}`], requiredGoals: [Number(chapter) === 0 ? "" : `foundation-${Number(chapter) - 1}`].filter(Boolean), kind: "foundation" as const, description: `第 ${chapter} 章 · 场景小游戏` })),
  { id: "market", title: "集市鉴宝", view: "market", chapter: 5, x: 68, y: 46, dependsOn: ["chapter-4"], requiredGoals: ["foundation-4"], kind: "minigame", description: "第 5 章 · 证据卡牌鉴定" },
  { id: "chapter-6", title: "飞鸽传书", view: "pavilion", chapter: 6, x: 75, y: 60, dependsOn: ["market"], requiredGoals: ["market-delivered"], kind: "foundation", description: "第 6 章 · 信件分拣小游戏" },
  { id: "pavilion", title: "飞鸽台", view: "pavilion", x: 25, y: 30, dependsOn: ["market"], requiredGoals: ["market-delivered"], kind: "preview", description: "回看信使委托，进入协作主线" },
  ...[
    [7, "悬赏亭", 34, 51], [8, "双城驿站", 45, 44], [9, "分流竹林", 56, 51],
    [10, "合卷台", 67, 43], [11, "议事堂", 78, 50], [12, "百炼炉", 89, 42],
  ].map(([chapter, title, x, y]) => ({ id: `chapter-${chapter}`, title: String(title), chapter: Number(chapter), view: "pavilion" as const, x: Number(x), y: Number(y), dependsOn: [`chapter-${Number(chapter) - 1}`], requiredGoals: [`${Number(chapter) === 7 ? "foundation-6" : `chain-${Number(chapter) - 1}`}`], kind: "minigame" as const, description: `第 ${chapter} 章 · 操作型协作任务` })),
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
    node.requiredGoals.forEach(goal => { if (!knownGoals.includes(goal) && !/^foundation-[0-6]$/.test(goal)) errors.push(`未知目标：${goal}`); });
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
