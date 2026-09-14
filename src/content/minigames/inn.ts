/** Local entertainment rules. Currency has no real-world value. */
export const innRules = {
  name: '六骰聚财', unlockChapters: 5, rounds: 3,
  stakes: [5, 10, 20], decorPrice: 1,
  payouts: [
    { score: 0, multiplier: 0, title: '初来客' },
    { score: 600, multiplier: 0.5, title: '稳手客' },
    { score: 1200, multiplier: 1, title: '听骰知音' },
    { score: 2000, multiplier: 2, title: '聚财高手' },
    { score: 3200, multiplier: 4, title: '云溪骰王' },
  ],
  combinations: ['单个一点：100 分；单个五点：50 分', '三个同点：点数 × 100；三个一点：1,000 分', '四 / 五 / 六个同点：三同分数的 2 / 4 / 8 倍', '六骰顺子：1,500 分；三对：1,500 分', '所选骰子必须全部计分；组合只在同一次掷骰内成立'],
  steps: ['掷六骰，点选一点、五点或三同等得分组合。', '留下得分骰，再决定收分，或掷剩余骰子。', '掷出零得分则本回合失手；三回合总分决定返还。'],
} as const;

export function innRank(score: number) {
  return [...innRules.payouts].reverse().find(t => score >= t.score)!;
}
