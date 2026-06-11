import type { FlockConfig } from '@/types/game';

export const FLOCK_CONFIGS: Record<string, FlockConfig> = {
  grus_nigricollis_common: {
    id: 'grus_nigricollis_common',
    name: '黑颈鹤·指名亚种',
    grade: 'common',
    emoji: '🦩',
    color: '#40916C',
    initialCount: 15,
    maxLossRatio: 0.35,
    staminaCost: 4,
    staminaRecover: 25,
    restStopMultiplier: 1.0,
  },
  grus_nigricollis_secondary: {
    id: 'grus_nigricollis_secondary',
    name: '黑颈鹤·青海种群',
    grade: 'secondary',
    emoji: '🦢',
    color: '#1D3557',
    initialCount: 12,
    maxLossRatio: 0.20,
    staminaCost: 5,
    staminaRecover: 22,
    restStopMultiplier: 0.9,
  },
  grus_nigricollis_endangered: {
    id: 'grus_nigricollis_endangered',
    name: '黑颈鹤·滇西亚种（濒危）',
    grade: 'endangered',
    emoji: '🕊️',
    color: '#C1121F',
    initialCount: 8,
    maxLossRatio: 0.10,
    staminaCost: 6,
    staminaRecover: 20,
    restStopMultiplier: 0.75,
  },
};

export const GRADE_LABELS: Record<string, string> = {
  common: '国家一级',
  secondary: '国家一级·重点监测',
  endangered: '极危·优先保护',
};

export const GRADE_COLORS: Record<string, string> = {
  common: '#2D6A4F',
  secondary: '#1D3557',
  endangered: '#C1121F',
};
