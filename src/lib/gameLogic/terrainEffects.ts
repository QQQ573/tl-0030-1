import type { Cell, Flock, FlockEvent } from '@/types/game';
import type { FlockConfig } from '@/types/game';
import { TERRAIN_CONFIGS } from '@/data/terrains';

export function resolveTerrainEffects(
  flock: Flock,
  cell: Cell,
  config: FlockConfig,
  turn: number
): {
  countChange: number;
  staminaChange: number;
  events: FlockEvent[];
  isDead: boolean;
  isArrived: boolean;
} {
  const events: FlockEvent[] = [];
  let countChange = 0;
  let staminaChange = 0;

  staminaChange -= config.staminaCost;

  const terrainCfg = TERRAIN_CONFIGS[cell.terrain];

  if (cell.terrain === 'wetland') {
    const recover = Math.round(config.staminaRecover);
    staminaChange += recover;
    events.push({
      turn,
      type: 'wetland_heal',
      message: `湿地休整：体力+${recover}`,
    });
  }

  if (cell.terrain === 'city') {
    const damage = terrainCfg.damageToFlock;
    if (damage > 0) {
      countChange = -damage;
      events.push({
        turn,
        type: 'city_damage',
        message: `穿越城市：-${damage}只（噪声惊扰）`,
      });
    }
  }

  if (cell.terrain === 'breeding') {
    staminaChange += Math.round(terrainCfg.staminaRecovery);
  }

  if (cell.hasRestStop) {
    const stopRecover = Math.round(15 * (config.restStopMultiplier ?? 1));
    staminaChange += stopRecover;
    events.push({
      turn,
      type: 'rest_stop',
      message: `停歇点补给：体力+${stopRecover}`,
    });
  }

  const isArrived = cell.terrain === 'wintering';
  if (isArrived) {
    staminaChange += 50;
    events.push({
      turn,
      type: 'arrived',
      message: `抵达越冬地！`,
    });
  }

  if (staminaChange + flock.stamina <= 0) {
    events.push({
      turn,
      type: 'stamina_low',
      message: `体力耗尽！`,
    });
  }

  const newCount = flock.count + countChange;
  const isDead = newCount <= 0 || (flock.stamina + staminaChange) <= 0;

  if (isDead && !isArrived) {
    events.push({
      turn,
      type: 'dead',
      message: `种群未能抵达越冬地...`,
    });
  }

  return {
    countChange,
    staminaChange,
    events,
    isDead,
    isArrived,
  };
}

export function checkFlockLossLimit(
  flock: Flock,
  config: FlockConfig
): { exceeded: boolean; lossRatio: number } {
  const lossCount = flock.initialCount - Math.max(0, flock.count);
  const lossRatio = lossCount / flock.initialCount;
  return {
    exceeded: lossRatio > config.maxLossRatio,
    lossRatio,
  };
}

export function getPassableTerrains(): string[] {
  return Object.values(TERRAIN_CONFIGS)
    .filter((t) => t.passable)
    .map((t) => t.type);
}
