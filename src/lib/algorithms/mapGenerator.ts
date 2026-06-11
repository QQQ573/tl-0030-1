import type { Cell, DifficultyConfig, TerrainType, Flock } from '@/types/game';
import { createSeededRNG, randomInt } from './seededRNG';
import { aStar } from './aStar';
import { TERRAIN_MOVE_COSTS, IMPASSABLE_TERRAINS } from '@/data/terrains';

export function generateMap(
  seed: number,
  config: DifficultyConfig,
  flockCount: number
): {
  grid: Cell[][];
  breedingPositions: { x: number; y: number }[];
  winteringPositions: { x: number; y: number }[];
} {
  const rng = createSeededRNG(seed);
  const { gridWidth, gridHeight, cityDensity, mountainDensity, wetlandDensity } = config;

  const grid: Cell[][] = [];
  for (let y = 0; y < gridHeight; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < gridWidth; x++) {
      row.push({
        x,
        y,
        terrain: 'grass',
        hasRestStop: false,
      });
    }
    grid.push(row);
  }

  const breedingPositions: { x: number; y: number }[] = [];
  const winteringPositions: { x: number; y: number }[] = [];

  const leftPositions = generateVerticalPositions(rng, 0, gridHeight, flockCount, 2);
  const rightPositions = generateVerticalPositions(rng, 0, gridHeight, flockCount, 2);

  for (let i = 0; i < flockCount; i++) {
    const b = { x: 0, y: leftPositions[i] };
    const w = { x: gridWidth - 1, y: rightPositions[i] };
    breedingPositions.push(b);
    winteringPositions.push(w);
    grid[b.y][b.x].terrain = 'breeding';
    grid[w.y][w.x].terrain = 'wintering';
  }

  const corridorCells: Set<string> = new Set();

  for (let i = 0; i < flockCount; i++) {
    const roughPath = generateRoughCorridor(
      rng,
      breedingPositions[i],
      winteringPositions[i],
      gridWidth,
      gridHeight
    );
    for (const p of roughPath) {
      corridorCells.add(`${p.x},${p.y}`);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = p.x + dx;
          const ny = p.y + dy;
          if (nx >= 0 && ny >= 0 && nx < gridWidth && ny < gridHeight) {
            corridorCells.add(`${nx},${ny}`);
          }
        }
      }
    }
  }

  const mountainCount = Math.floor(gridWidth * gridHeight * mountainDensity);
  const cityCount = Math.floor(gridWidth * gridHeight * cityDensity);
  const wetlandCount = Math.floor(gridWidth * gridHeight * wetlandDensity);

  placeTerrain(rng, grid, 'mountain', mountainCount, corridorCells, breedingPositions, winteringPositions);
  placeTerrain(rng, grid, 'city', cityCount, corridorCells, breedingPositions, winteringPositions);
  placeTerrain(rng, grid, 'wetland', wetlandCount, new Set(), breedingPositions, winteringPositions);

  ensureConnectivity(grid, breedingPositions, winteringPositions);

  return { grid, breedingPositions, winteringPositions };
}

function generateVerticalPositions(
  rng: () => number,
  min: number,
  max: number,
  count: number,
  margin: number
): number[] {
  const segmentHeight = (max - margin * 2) / count;
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    const segStart = margin + Math.floor(segmentHeight * i);
    const segEnd = margin + Math.floor(segmentHeight * (i + 1)) - 1;
    positions.push(randomInt(rng, segStart, Math.max(segStart, segEnd)));
  }
  return positions;
}

function generateRoughCorridor(
  rng: () => number,
  start: { x: number; y: number },
  end: { x: number; y: number },
  width: number,
  height: number
): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  let x = start.x;
  let y = start.y;

  while (x !== end.x || y !== end.y) {
    path.push({ x, y });
    const dx = Math.sign(end.x - x);
    const dy = Math.sign(end.y - y);

    const r = rng();
    if (dx !== 0 && dy !== 0) {
      if (r < 0.55) {
        x += dx;
      } else if (r < 0.85) {
        y += dy;
      } else {
        x += dx;
        y += dy;
      }
    } else if (dx !== 0) {
      if (r < 0.8) x += dx;
      else y += rng() < 0.5 ? 1 : -1;
    } else {
      if (r < 0.8) y += dy;
      else x += rng() < 0.5 ? 1 : -1;
    }

    x = Math.max(0, Math.min(width - 1, x));
    y = Math.max(0, Math.min(height - 1, y));
  }
  path.push({ x: end.x, y: end.y });
  return path;
}

function placeTerrain(
  rng: () => number,
  grid: Cell[][],
  terrain: TerrainType,
  count: number,
  avoidSet: Set<string>,
  breedingPositions: { x: number; y: number }[],
  winteringPositions: { x: number; y: number }[]
) {
  const height = grid.length;
  const width = grid[0].length;
  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 30;

  while (placed < count && attempts < maxAttempts) {
    attempts++;
    const x = randomInt(rng, 0, width - 1);
    const y = randomInt(rng, 0, height - 1);
    const key = `${x},${y}`;

    const cell = grid[y][x];
    if (cell.terrain !== 'grass') continue;
    if (avoidSet.has(key) && (terrain === 'mountain' || terrain === 'city')) continue;

    const isStartEnd = breedingPositions.some((p) => p.x === x && p.y === y) ||
      winteringPositions.some((p) => p.x === x && p.y === y);
    if (isStartEnd) continue;

    grid[y][x].terrain = terrain;

    if (terrain === 'mountain' || terrain === 'city') {
      const clusterSize = terrain === 'mountain' ? randomInt(rng, 0, 3) : randomInt(rng, 0, 2);
      for (let i = 0; i < clusterSize; i++) {
        const cdx = randomInt(rng, -1, 1);
        const cdy = randomInt(rng, -1, 1);
        const cx = x + cdx;
        const cy = y + cdy;
        if (cx >= 0 && cy >= 0 && cx < width && cy < height) {
          const ckey = `${cx},${cy}`;
          const ccell = grid[cy][cx];
          if (ccell.terrain === 'grass' && !avoidSet.has(ckey) && !isStartEnd) {
            grid[cy][cx].terrain = terrain;
            placed++;
          }
        }
      }
    }

    placed++;
  }
}

function ensureConnectivity(
  grid: Cell[][],
  breedingPositions: { x: number; y: number }[],
  winteringPositions: { x: number; y: number }[]
) {
  for (let i = 0; i < breedingPositions.length; i++) {
    const start = breedingPositions[i];
    const end = winteringPositions[i];
    const path = aStar(start, end, grid, {
      terrainCosts: TERRAIN_MOVE_COSTS,
      impassableTerrains: IMPASSABLE_TERRAINS,
      restStopBonus: 0.3,
      avoidCity: false,
    });

    if (!path) {
      carveCorridor(grid, start, end);
    }
  }
}

function carveCorridor(
  grid: Cell[][],
  start: { x: number; y: number },
  end: { x: number; y: number }
) {
  let x = start.x;
  let y = start.y;
  const height = grid.length;
  const width = grid[0].length;

  while (x !== end.x || y !== end.y) {
    const dx = Math.sign(end.x - x);
    const dy = Math.sign(end.y - y);

    if (grid[y][x].terrain === 'mountain') {
      grid[y][x].terrain = 'grass';
    }

    if (x + dx >= 0 && x + dx < width && grid[y] && grid[y][x + dx]) {
      if (grid[y][x + dx].terrain === 'mountain') {
        grid[y][x + dx].terrain = 'grass';
      }
    }
    if (y + dy >= 0 && y + dy < height && grid[y + dy] && grid[y + dy][x]) {
      if (grid[y + dy][x].terrain === 'mountain') {
        grid[y + dy][x].terrain = 'grass';
      }
    }

    if (dx !== 0 && dy !== 0 && Math.random() < 0.6) {
      x += dx;
    } else if (dx !== 0 && (dy === 0 || Math.random() < 0.55)) {
      x += dx;
    } else {
      y += dy;
    }
  }
}

export function countTerrainType(grid: Cell[][], terrain: TerrainType): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.terrain === terrain) count++;
    }
  }
  return count;
}

export function getReservedCellsForOtherFlocks(
  flocks: Flock[],
  excludeFlockConfigId: string,
  stepsAhead: number = 5
): Set<string> {
  const reserved = new Set<string>();
  for (const flock of flocks) {
    if (flock.configId === excludeFlockConfigId) continue;
    if (flock.hasArrived || flock.isDead) continue;

    const path = flock.predictedPath;
    const limit = Math.min(stepsAhead, path.length);
    for (let i = 0; i < limit; i++) {
      reserved.add(`${path[i].x},${path[i].y}`);
    }
  }
  return reserved;
}
