import type { GameState, GameResult, Flock } from '@/types/game';
import type { FlockConfig, ScienceCard } from '@/types/game';
import { FLOCK_CONFIGS } from '@/data/species';
import { SCIENCE_CARDS } from '@/data/scienceCards';

export function calculateResult(state: GameState): GameResult {
  const { flocks, currentTurn, maxTurns } = state;

  let totalSurvived = 0;
  let totalInitial = 0;
  let allArrived = true;
  let perfectSurvival = true;

  for (const flock of flocks) {
    totalSurvived += Math.max(0, flock.count);
    totalInitial += flock.initialCount;
    if (!flock.hasArrived) allArrived = false;
    if (flock.count < flock.initialCount) perfectSurvival = false;
  }

  const survivalRate = totalInitial > 0 ? totalSurvived / totalInitial : 0;
  const turnEfficiency = currentTurn > 0 ? Math.max(0, 1 - currentTurn / maxTurns) : 1;

  let stars = 0;
  if (allArrived) {
    stars = 1;
    if (survivalRate >= 0.85) stars = 2;
    if (survivalRate >= 0.95 && turnEfficiency >= 0.4) stars = 3;
  }

  const awardedCards = determineCardRewards(state, stars, perfectSurvival);
  const isPerfect = perfectSurvival && allArrived;

  return {
    stars,
    totalTurns: currentTurn,
    totalSurvived,
    totalInitial,
    survivalRate,
    awardedCards,
    isPerfect,
  };
}

function determineCardRewards(
  state: GameState,
  stars: number,
  perfectSurvival: boolean
): string[] {
  const rewards: string[] = [];
  const earned = new Set(state.collectedCardIds);

  const candidates = (SCIENCE_CARDS as ScienceCard[]).filter((c) => !earned.has(c.id));

  if (candidates.length === 0) return rewards;

  const commonCards = candidates.filter((c) => c.rarity === 'common');
  const rareCards = candidates.filter((c) => c.rarity === 'rare');
  const legendaryCards = candidates.filter((c) => c.rarity === 'legendary');

  if (stars >= 1 && commonCards.length > 0) {
    rewards.push(pickRandom(commonCards).id);
  }
  if (stars >= 2 && rareCards.length > 0) {
    rewards.push(pickRandom(rareCards).id);
  }
  if (stars === 3) {
    const endangeredFlock = state.flocks.find((f) => {
      const cfg = FLOCK_CONFIGS[f.configId];
      return cfg?.grade === 'endangered';
    });
    const endangeredPerfect = endangeredFlock && endangeredFlock.count === endangeredFlock.initialCount;
    if ((perfectSurvival || endangeredPerfect) && legendaryCards.length > 0) {
      rewards.push(pickRandom(legendaryCards).id);
    } else if (rareCards.length > 1) {
      const extra = rareCards.filter((c) => !rewards.includes(c.id));
      if (extra.length > 0) rewards.push(pickRandom(extra).id);
    }
  }

  return rewards;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shouldGameEnd(state: GameState): 'won' | 'lost' | null {
  const { flocks, currentTurn, maxTurns } = state;

  const allArrived = flocks.every((f) => f.hasArrived);
  if (allArrived) return 'won';

  const anyFailed = flocks.some((f) => {
    const cfg = FLOCK_CONFIGS[f.configId] as FlockConfig | undefined;
    if (!cfg) return false;
    const lossCount = f.initialCount - Math.max(0, f.count);
    const lossRatio = lossCount / f.initialCount;
    return lossRatio > cfg.maxLossRatio;
  });
  if (anyFailed) return 'lost';

  const allDead = flocks.every((f) => f.isDead || f.hasArrived);
  if (allDead && !allArrived) return 'lost';

  if (currentTurn >= maxTurns && !allArrived) return 'lost';

  return null;
}

export function formatLossRatio(flock: Flock, config: FlockConfig): string {
  const lossCount = flock.initialCount - Math.max(0, flock.count);
  const ratio = (lossCount / flock.initialCount) * 100;
  const max = config.maxLossRatio * 100;
  return `${ratio.toFixed(0)}% / ${max.toFixed(0)}%`;
}
