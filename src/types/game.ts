export type TerrainType = 'grass' | 'wetland' | 'mountain' | 'city' | 'breeding' | 'wintering';

export type SpeciesGrade = 'common' | 'secondary' | 'endangered';

export interface Cell {
  x: number;
  y: number;
  terrain: TerrainType;
  hasRestStop: boolean;
  restStopId?: string;
}

export interface FlockConfig {
  id: string;
  name: string;
  grade: SpeciesGrade;
  emoji: string;
  color: string;
  initialCount: number;
  maxLossRatio: number;
  staminaCost: number;
  staminaRecover: number;
  restStopMultiplier: number;
}

export interface Flock {
  configId: string;
  position: { x: number; y: number };
  breedingPos: { x: number; y: number };
  winteringPos: { x: number; y: number };
  count: number;
  initialCount: number;
  stamina: number;
  maxStamina: number;
  hasArrived: boolean;
  isDead: boolean;
  predictedPath: { x: number; y: number }[];
  events: FlockEvent[];
}

export interface FlockEvent {
  turn: number;
  type: 'move' | 'city_damage' | 'wetland_heal' | 'stamina_low' | 'arrived' | 'dead' | 'conflict_wait' | 'rest_stop';
  message: string;
}

export interface RestStop {
  id: string;
  x: number;
  y: number;
}

export interface DifficultyConfig {
  id: string;
  name: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  baseRestStops: number;
  maxTurns: number;
  cityDensity: number;
  mountainDensity: number;
  wetlandDensity: number;
  flockConfigs: string[];
}

export type CardCategory = 'species' | 'habitat' | 'migration' | 'threat';
export type CardRarity = 'common' | 'rare' | 'legendary';

export interface ScienceCard {
  id: string;
  title: string;
  category: CardCategory;
  rarity: CardRarity;
  content: string;
  imageEmoji: string;
  unlockCondition: string;
}

export type GamePhase = 'planning' | 'executing' | 'paused' | 'won' | 'lost';
export type TurnPhase = 'idle' | 'moving' | 'resolving';

export interface GameState {
  seed: number;
  difficulty: DifficultyConfig;
  grid: Cell[][];
  flocks: Flock[];
  restStops: RestStop[];
  currentTurn: number;
  maxTurns: number;
  restStopsRemaining: number;
  phase: GamePhase;
  turnPhase: TurnPhase;
  selectedFlockId: string | null;
  placingRestStop: boolean;
  result: GameResult | null;
  collectedCardIds: string[];
  eventLog: string[];
}

export interface GameResult {
  stars: number;
  totalTurns: number;
  totalSurvived: number;
  totalInitial: number;
  survivalRate: number;
  awardedCards: string[];
  isPerfect: boolean;
}

export interface TerrainConfig {
  type: TerrainType;
  name: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  moveCost: number;
  passable: boolean;
  damageToFlock: number;
  staminaRecovery: number;
  description: string;
}

export interface AStarOptions {
  terrainCosts: Record<TerrainType, number>;
  impassableTerrains: TerrainType[];
  blockedCells?: Set<string>;
  restStopBonus: number;
  avoidCity: boolean;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingPositions: Map<string, string[]>;
  waitingFlockIds: string[];
}
