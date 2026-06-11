import { create } from 'zustand';
import type {
  GameState,
  DifficultyConfig,
  Flock,
  RestStop,
  Cell,
  GameResult,
  FlockConfig,
} from '@/types/game';
import { DIFFICULTY_CONFIGS } from '@/data/difficulties';
import { FLOCK_CONFIGS } from '@/data/species';
import { generateMap, getReservedCellsForOtherFlocks } from '../lib/algorithms/mapGenerator';
import { predictAllPaths, advanceTurn } from '../lib/gameLogic/turnSystem';
import { calculateResult } from '../lib/gameLogic/scoring';
import { randomSeed } from '../lib/algorithms/seededRNG';

const STORAGE_KEY = 'crane-migration-cards-v1';

function loadCollectedCards(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveCollectedCards(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

function initializeFlocks(
  difficulty: DifficultyConfig,
  breedingPositions: { x: number; y: number }[],
  winteringPositions: { x: number; y: number }[]
): Flock[] {
  return difficulty.flockConfigs.map((configId, i) => {
    const cfg = FLOCK_CONFIGS[configId] as FlockConfig;
    const breed = breedingPositions[i];
    const winter = winteringPositions[i];
    return {
      configId,
      position: { ...breed },
      breedingPos: { ...breed },
      winteringPos: { ...winter },
      count: cfg.initialCount,
      initialCount: cfg.initialCount,
      stamina: 100,
      maxStamina: 100,
      hasArrived: false,
      isDead: false,
      predictedPath: [{ ...breed }],
      events: [],
    };
  });
}

function calcRestStopBudget(difficulty: DifficultyConfig, flocks: Flock[]): number {
  let budget = difficulty.baseRestStops;
  for (const f of flocks) {
    const cfg = FLOCK_CONFIGS[f.configId];
    if (cfg?.grade === 'endangered') budget += 1;
    if (cfg?.grade === 'secondary') budget += 0;
  }
  return budget;
}

interface GameStoreState extends GameState {
  initializeGame: (difficultyId: string, seed?: number) => void;
  placeRestStop: (x: number, y: number) => boolean;
  removeRestStop: (x: number, y: number) => boolean;
  clearAllRestStops: () => void;
  executeTurn: () => void;
  executeAuto: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  togglePlacingRestStop: () => void;
  selectFlock: (configId: string | null) => void;
  getResult: () => GameResult | null;
  claimResult: () => GameResult | null;
  setPlacingRestStop: (v: boolean) => void;
}

const defaultDifficulty = DIFFICULTY_CONFIGS['easy'];

const createEmptyState = (): GameState => ({
  seed: 0,
  difficulty: defaultDifficulty,
  grid: [],
  flocks: [],
  restStops: [],
  currentTurn: 0,
  maxTurns: defaultDifficulty.maxTurns,
  restStopsRemaining: 0,
  phase: 'planning',
  turnPhase: 'idle',
  selectedFlockId: null,
  placingRestStop: false,
  result: null,
  collectedCardIds: loadCollectedCards(),
  eventLog: [],
});

export const useGameStore = create<GameStoreState>((set, get) => ({
  ...createEmptyState(),

  initializeGame: (difficultyId: string, seed?: number) => {
    const difficulty = DIFFICULTY_CONFIGS[difficultyId] ?? defaultDifficulty;
    const gameSeed = seed ?? randomSeed();

    const { grid, breedingPositions, winteringPositions } = generateMap(
      gameSeed,
      difficulty,
      difficulty.flockConfigs.length
    );

    const flocks = initializeFlocks(difficulty, breedingPositions, winteringPositions);
    const budget = calcRestStopBudget(difficulty, flocks);

    const stateWithFlocks: GameState = {
      ...createEmptyState(),
      seed: gameSeed,
      difficulty,
      grid,
      flocks,
      maxTurns: difficulty.maxTurns,
      restStopsRemaining: budget,
      collectedCardIds: loadCollectedCards(),
      eventLog: [`种子编号: ${gameSeed} | 难度: ${difficulty.name}`],
    };

    const predictedFlocks = predictAllPaths(grid, flocks, []);
    set({
      ...stateWithFlocks,
      flocks: predictedFlocks,
    });
  },

  placeRestStop: (x: number, y: number) => {
    const state = get();
    if (state.restStopsRemaining <= 0) return false;
    if (state.phase !== 'planning') return false;

    const cell = state.grid[y]?.[x];
    if (!cell) return false;
    if (cell.hasRestStop) return false;
    if (cell.terrain === 'mountain') return false;
    if (cell.terrain === 'breeding' || cell.terrain === 'wintering') return false;

    const newGrid: Cell[][] = state.grid.map((row) =>
      row.map((c) => (c.x === x && c.y === y ? { ...c, hasRestStop: true } : c))
    );

    const restStopId = `stop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newStop: RestStop = { id: restStopId, x, y };

    const newRestStops = [...state.restStops, newStop];
    const newFlocks = predictAllPaths(newGrid, state.flocks, newRestStops);

    set({
      grid: newGrid,
      restStops: newRestStops,
      flocks: newFlocks,
      restStopsRemaining: state.restStopsRemaining - 1,
      placingRestStop: false,
    });
    return true;
  },

  removeRestStop: (x: number, y: number) => {
    const state = get();
    if (state.phase !== 'planning') return false;
    const cell = state.grid[y]?.[x];
    if (!cell || !cell.hasRestStop) return false;

    const newGrid: Cell[][] = state.grid.map((row) =>
      row.map((c) => (c.x === x && c.y === y ? { ...c, hasRestStop: false } : c))
    );
    const newRestStops = state.restStops.filter((s) => !(s.x === x && s.y === y));
    const newFlocks = predictAllPaths(newGrid, state.flocks, newRestStops);

    set({
      grid: newGrid,
      restStops: newRestStops,
      flocks: newFlocks,
      restStopsRemaining: state.restStopsRemaining + 1,
    });
    return true;
  },

  clearAllRestStops: () => {
    const state = get();
    if (state.phase !== 'planning') return;

    const newGrid: Cell[][] = state.grid.map((row) =>
      row.map((c) => (c.hasRestStop ? { ...c, hasRestStop: false } : c))
    );
    const totalBudget = calcRestStopBudget(state.difficulty, state.flocks);
    const newFlocks = predictAllPaths(newGrid, state.flocks, []);

    set({
      grid: newGrid,
      restStops: [],
      flocks: newFlocks,
      restStopsRemaining: totalBudget,
    });
  },

  executeTurn: () => {
    const state = get();
    if (state.phase !== 'planning' && state.phase !== 'executing') return;
    if (state.turnPhase !== 'idle') return;

    const workingState: GameState = {
      ...state,
      phase: state.phase === 'planning' ? 'executing' : state.phase,
      turnPhase: 'moving',
    };

    const newState = advanceTurn(workingState);

    if (newState.phase === 'won' || newState.phase === 'lost') {
      const result = calculateResult(newState);
      const newCollected = Array.from(new Set([...newState.collectedCardIds, ...result.awardedCards]));
      saveCollectedCards(newCollected);
      set({
        ...newState,
        result,
        turnPhase: 'idle',
        collectedCardIds: newCollected,
      });
    } else {
      set({
        ...newState,
        turnPhase: 'idle',
      });
    }
  },

  executeAuto: () => {
    const state = get();
    if (state.phase === 'won' || state.phase === 'lost') return;

    const runStep = () => {
      const s = get();
      if (s.phase === 'won' || s.phase === 'lost') return;
      if (s.currentTurn >= s.maxTurns) return;
      get().executeTurn();
      setTimeout(runStep, 500);
    };
    setTimeout(runStep, 50);
  },

  pauseGame: () => {
    const state = get();
    if (state.phase === 'executing') {
      set({ phase: 'paused' });
    }
  },

  resumeGame: () => {
    const state = get();
    if (state.phase === 'paused') {
      set({ phase: 'executing' });
    }
  },

  resetGame: () => {
    const state = get();
    get().initializeGame(state.difficulty.id, state.seed);
  },

  togglePlacingRestStop: () => {
    set((s) => ({ placingRestStop: !s.placingRestStop }));
  },

  setPlacingRestStop: (v: boolean) => {
    set({ placingRestStop: v });
  },

  selectFlock: (configId: string | null) => {
    set({ selectedFlockId: configId });
  },

  getResult: () => {
    return get().result;
  },

  claimResult: () => {
    const result = get().result;
    return result;
  },
}));
