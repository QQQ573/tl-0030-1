import type { Flock, ConflictResult } from '@/types/game';
import { FLOCK_CONFIGS } from '@/data/species';
import type { FlockConfig } from '@/types/game';

export function detectConflicts(
  flocks: Flock[],
  nextPositions: Map<string, { x: number; y: number }>
): ConflictResult {
  const posToFlocks = new Map<string, string[]>();

  for (const [configId, pos] of nextPositions) {
    const flock = flocks.find((f) => f.configId === configId);
    if (!flock || flock.hasArrived || flock.isDead) continue;

    const key = `${pos.x},${pos.y}`;
    if (!posToFlocks.has(key)) {
      posToFlocks.set(key, []);
    }
    posToFlocks.get(key)!.push(configId);
  }

  const conflictingPositions = new Map<string, string[]>();
  const waitingFlockIds: string[] = [];

  for (const [posKey, flockIds] of posToFlocks) {
    if (flockIds.length > 1) {
      conflictingPositions.set(posKey, flockIds);

      let priorityOrder = [...flockIds].sort((aId, bId) => {
        const a = flocks.find((f) => f.configId === aId);
        const b = flocks.find((f) => f.configId === bId);
        if (!a || !b) return 0;
        const aCfg = FLOCK_CONFIGS[a.configId] as FlockConfig | undefined;
        const bCfg = FLOCK_CONFIGS[b.configId] as FlockConfig | undefined;

        const gradePriority: Record<string, number> = { endangered: 0, secondary: 1, common: 2 };
        const aGrade = aCfg?.grade ?? 'common';
        const bGrade = bCfg?.grade ?? 'common';
        const gradeDiff = (gradePriority[aGrade] ?? 2) - (gradePriority[bGrade] ?? 2);
        if (gradeDiff !== 0) return gradeDiff;

        return (b?.count ?? 0) - (a?.count ?? 0);
      });

      for (let i = 1; i < priorityOrder.length; i++) {
        waitingFlockIds.push(priorityOrder[i]);
      }
    }
  }

  return {
    hasConflict: conflictingPositions.size > 0,
    conflictingPositions,
    waitingFlockIds,
  };
}

export function detectSwaps(
  flocks: Flock[],
  nextPositions: Map<string, { x: number; y: number }>
): string[] {
  const problematic: string[] = [];
  const flockByConfig = new Map(flocks.map((f) => [f.configId, f]));

  const entries = Array.from(nextPositions.entries());

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [idA, posA] = entries[i];
      const [idB, posB] = entries[j];
      const flockA = flockByConfig.get(idA);
      const flockB = flockByConfig.get(idB);
      if (!flockA || !flockB) continue;

      const curA = flockA.position;
      const curB = flockB.position;

      if (posA.x === curB.x && posA.y === curB.y && posB.x === curA.x && posB.y === curA.y) {
        const cfgA = FLOCK_CONFIGS[idA] as FlockConfig | undefined;
        const cfgB = FLOCK_CONFIGS[idB] as FlockConfig | undefined;
        const gradePriority: Record<string, number> = { endangered: 0, secondary: 1, common: 2 };
        const priorityA = gradePriority[cfgA?.grade ?? 'common'] ?? 2;
        const priorityB = gradePriority[cfgB?.grade ?? 'common'] ?? 2;
        const loser = priorityA > priorityB ? idA : idB;
        problematic.push(loser);
      }
    }
  }

  return problematic;
}
