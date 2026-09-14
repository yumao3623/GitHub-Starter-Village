import { z } from 'zod';
import { innRank, innRules } from '@/content/minigames/inn';

export const innRunSchema = z.object({
  id: z.number().int().nonnegative(), stake: z.number().int().min(0).max(20),
  round: z.number().int().min(1).max(3), scores: z.array(z.number().int().min(0).max(100000)).max(3),
  pot: z.number().int().min(0).max(100000), remaining: z.number().int().min(1).max(6),
  dice: z.array(z.number().int().min(1).max(6)).max(6),
  stage: z.enum(['roll', 'choose', 'round-end', 'finished']),
  message: z.string().max(250), rolls: z.number().int().nonnegative(), settled: z.boolean(),
});
export type InnRun = z.infer<typeof innRunSchema>;
export type InnEvent = { type: 'roll'; dice: number[] } | { type: 'keep'; indices: number[] } | { type: 'bank' | 'next' | 'abandon' };
export function newInnRun(id: number, stake: number): InnRun {
  return { id, stake, round: 1, scores: [], pot: 0, remaining: 6, dice: [], stage: 'roll', message: '先掷六骰，看看这一手。', rolls: 0, settled: false };
}
/** Zero means at least one selected die cannot score. No partial automatic scoring. */
export function scoreDice(dice: readonly number[]): number {
  if (!dice.length || dice.length > 6 || dice.some(d => !Number.isInteger(d) || d < 1 || d > 6)) return 0;
  const counts = Array.from({length: 6}, (_, i) => dice.filter(d => d === i + 1).length);
  if (dice.length === 6 && (counts.every(n => n === 1) || counts.filter(n => n === 2).length === 3)) return 1500;
  let score = 0;
  for (let i = 0; i < 6; i++) {
    const n = counts[i];
    if (n >= 3) score += (i === 0 ? 1000 : (i + 1) * 100) * 2 ** (n - 3);
    else if (i === 0) score += n * 100;
    else if (i === 4) score += n * 50;
    else if (n) return 0;
  }
  return score;
}
export function bestScoringIndices(dice: readonly number[]): number[] {
  let best: number[] = [], score = 0;
  for (let mask = 1; mask < 1 << dice.length; mask++) {
    const ids = dice.flatMap((_, i) => mask & 1 << i ? [i] : []);
    const points = scoreDice(ids.map(i => dice[i]));
    if (points > score) { score = points; best = ids; }
  }
  return best;
}
export function innTotal(run: InnRun) { return run.scores.reduce((a, b) => a + b, 0); }
export function innPayout(run: InnRun) { return Math.floor(run.stake * innRank(innTotal(run)).multiplier); }

export function advanceInn(run: InnRun, event: InnEvent): { run: InnRun; error?: string } {
  const fail = (error: string) => ({run, error});
  if (run.stage === 'finished' || run.settled) return fail('这一轮已结算，请另开一轮。');
  const r = structuredClone(run);
  const endRound = (score: number, message: string) => {
    r.scores.push(score); r.pot = 0; r.dice = []; r.remaining = 6;
    r.stage = r.round === innRules.rounds ? 'finished' : 'round-end'; r.message = message;
  };
  if (event.type === 'abandon') {
    while (r.scores.length < 3) r.scores.push(0);
    r.pot = 0; r.dice = []; r.stage = 'finished'; r.message = '提前离桌，按已经收下的分数结算。';
  } else if (event.type === 'roll') {
    if (r.stage !== 'roll') return fail('先留下得分骰。');
    if (event.dice.length !== r.remaining || event.dice.some(d => !Number.isInteger(d) || d < 1 || d > 6)) return fail('骰子记录不完整。');
    r.dice = [...event.dice]; r.rolls++;
    if (!bestScoringIndices(r.dice).length) endRound(0, `失手了，这回合的 ${r.pot} 分散去；已收分数仍在。`);
    else { r.stage = 'choose'; r.message = '点选得分骰，再将它们留下。'; }
  } else if (event.type === 'keep') {
    if (r.stage !== 'choose') return fail('先掷骰。');
    if (new Set(event.indices).size !== event.indices.length || event.indices.some(i => !Number.isInteger(i) || i < 0 || i >= r.dice.length)) return fail('请选择桌上的骰子。');
    const score = scoreDice(event.indices.map(i => r.dice[i]));
    if (!score) return fail('所选骰子不能全部计分。试试一点、五点或三个同点。');
    r.pot += score; r.remaining -= event.indices.length; r.dice = []; r.stage = 'roll';
    const hot = r.remaining === 0;
    if (hot) r.remaining = 6;
    r.message = hot ? `六骰全收！已攒 ${r.pot} 分，可重新掷六骰，或稳稳收分。` : `已攒 ${r.pot} 分。收下，还是冒险掷剩余 ${r.remaining} 颗？`;
    if (r.pot >= 100000) endRound(100000, '满堂彩！本回合已自动收分。');
  } else if (event.type === 'bank') {
    if (r.stage !== 'roll' || r.pot <= 0) return fail('先留下一组得分骰，再收分。');
    endRound(r.pot, `收下 ${r.pot} 分。`);
  } else if (event.type === 'next') {
    if (r.stage !== 'round-end') return fail('先完成当前回合。');
    r.round++; r.stage = 'roll'; r.message = `第 ${r.round} 回合，六骰重新入盅。`;
  }
  return { run: r };
}

/** Rejection sampling avoids modulo bias. Randomness is generated only on a roll action. */
export function rollDice(count: number): number[] {
  const result: number[] = [];
  while (result.length < count) {
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    for (const byte of bytes) if (byte < 252 && result.length < count) result.push(byte % 6 + 1);
  }
  return result;
}
