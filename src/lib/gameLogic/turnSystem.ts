import type { GameState, Cell, Flock, RestStop } from '@/types/game';
import { aStar } from '../algorithms/aStar';
import { detectConflicts, detectSwaps } from '../algorithms/conflict';
import { resolveTerrainEffects, checkFlockLossLimit } from './terrainEffects';
import { shouldGameEnd } from './scoring';
import { TERRAIN_MOVE_COSTS, IMPASSABLE_TERRAINS } from '@/data/terrains';
import { FLOCK_CONFIGS } from '@/data/species';
import type { FlockConfig } from '@/types/game';

export function predictAllPaths(
  grid: Cell[][],
  flocks: Flock[],
  restStops: RestStop[]
): Flock[] {
  return flocks.map((flock) => {
    if (flock.hasArrived || flock.isDead) {
      return { ...flock, predictedPath: [flock.position] };
    }

    const otherReserved = new Set<string>();
    for (const other of flocks) {
      if (other.configId === flock.configId) continue;
      if (other.hasArrived || other.isDead) continue;
      otherReserved.add(`${other.position.x},${other.position.y}`);
      for (let i = 0; i < Math.min(3, other.predictedPath.length); i++) {
        const p = other.predictedPath[i];
        otherReserved.add(`${p.x},${p.y}`);
      }
    }

    const path = aStar(flock.position, flock.winteringPos, grid, {
      terrainCosts: TERRAIN_MOVE_COSTS,
      impassableTerrains: IMPASSABLE_TERRAINS,
      blockedCells: otherReserved,
      restStopBonus: 0.5,
      avoidCity: true,
    });

    return {
      ...flock,
      predictedPath: path ?? [flock.position],
    };
  });
}

export function advanceTurn(state: GameState): GameState {
  const { grid, flocks, restStops, currentTurn } = state;

  const nextPositions = new Map<string, { x: number; y: number }>();
  const pathMap = new Map<string, { x: number; y: number }[]>();

  for (const flock of flocks) {
    if (flock.hasArrived || flock.isDead) {
      nextPositions.set(flock.configId, flock.position);
      pathMap.set(flock.configId, [flock.position]);
      continue;
    }

    const reserved = new Set<string>();
    for (const other of flocks) {
      if (other.configId === flock.configId) continue;
      if (other.hasArrived || other.isDead) continue;
      reserved.add(`${other.position.x},${other.position.y}`);
    }

    let path = aStar(flock.position, flock.winteringPos, grid, {
      terrainCosts: TERRAIN_MOVE_COSTS,
      impassableTerrains: IMPASSABLE_TERRAINS,
      blockedCells: reserved,
      restStopBonus: 0.5,
      avoidCity: true,
    });

    if (!path || path.length < 2) {
      path = aStar(flock.position, flock.winteringPos, grid, {
        terrainCosts: TERRAIN_MOVE_COSTS,
        impassableTerrains: IMPASSABLE_TERRAINS,
        blockedCells: new Set(),
        restStopBonus: 0.3,
        avoidCity: false,
      });
    }

    if (path && path.length >= 2) {
      nextPositions.set(flock.configId, path[1]);
      pathMap.set(flock.configId, path.slice(1));
    } else {
      nextPositions.set(flock.configId, flock.position);
      pathMap.set(flock.configId, [flock.position]);
    }
  }

  const conflictResult = detectConflicts(flocks, nextPositions);
  const swapLosers = detectSwaps(flocks, nextPositions);
  const allWaiters = new Set([...conflictResult.waitingFlockIds, ...swapLosers]);

  let newFlocks = flocks.map((flock) => {
    if (flock.hasArrived || flock.isDead) return { ...flock };

    const config = FLOCK_CONFIGS[flock.configId] as FlockConfig;
    if (!config) return { ...flock };

    const isWaiting = allWaiters.has(flock.configId);

    let newPos = flock.position;
    const allEvents = [...flock.events];

    if (isWaiting) {
      allEvents.push({
        turn: currentTurn + 1,
        type: 'conflict_wait',
        message: `避让其它队伍，暂停1回合`,
      });
    } else {
      const next = nextPositions.get(flock.configId);
      if (next) newPos = next;
    }

    const cell = grid[newPos.y][newPos.x];
    const effects = resolveTerrainEffects(
      { ...flock, position: newPos, events: allEvents },
      cell,
      config,
      currentTurn + 1
    );

    allEvents.push(...effects.events);

    const newCount = Math.max(0, flock.count + effects.countChange);
    const newStamina = Math.max(0, Math.min(100, flock.stamina + effects.staminaChange));

    const lossCheck = checkFlockLossLimit(
      { ...flock, count: newCount },
      config
    );

    const isDead = effects.isDead || lossCheck.exceeded;
    const isArrived = effects.isArrived;

    return {
      ...flock,
      position: newPos,
      count: newCount,
      stamina: newStamina,
      hasArrived: isArrived,
      isDead: isDead,
      events: allEvents.slice(-30),
      predictedPath: [],
    };
  });

  newFlocks = predictAllPaths(grid, newFlocks, restStops);

  const newEventLog: string[] = [...state.eventLog];
  for (const flock of newFlocks) {
    const config = FLOCK_CONFIGS[flock.configId];
    const newEvents = flock.events.filter((e) => e.turn === currentTurn + 1);
    for (const ev of newEvents) {
      newEventLog.push(`回合${currentTurn + 1} | ${config?.name ?? flock.configId}: ${ev.message}`);
    }
  }

  const newState: GameState = {
    ...state,
    flocks: newFlocks,
    currentTurn: currentTurn + 1,
    eventLog: newEventLog.slice(-50),
  };

  const endResult = shouldGameEnd(newState);
  if (endResult === 'won') {
    newState.phase = 'won';
    newState.turnPhase = 'idle';
  } else if (endResult === 'lost') {
    newState.phase = 'lost';
    newState.turnPhase = 'idle';
  }

  return newState;
}
