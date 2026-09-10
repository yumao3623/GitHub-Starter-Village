export const characters = [
  { id: "xingzhou", name: "陆行舟", role: "男侠客", description: "背一匣卷轴，走一程江湖。", x: 0, width: 565 },
  { id: "zhiwei", name: "沈知微", role: "女侠客", description: "查明每处细节，再落笔成章。", x: 565, width: 485 },
  { id: "atuan", name: "阿团", role: "练功小猫", description: "爪子虽小，求知的心很大。", x: 1050, width: 486 },
] as const;
export type CharacterId = typeof characters[number]["id"];

export const characterAtlas = { path: "/characters/wuxia-cast-v1.png", width: 1536, height: 1024 } as const;
