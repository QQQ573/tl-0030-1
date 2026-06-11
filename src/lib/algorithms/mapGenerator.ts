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

  const protectedCells: Set<string> = new Set();
  for (const p of breedingPositions) protectedCells.add(`${p.x},${p.y}`);
  for (const p of winteringPositions) protectedCells.add(`${p.x},${p.y}`);

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
    }
  }

  const mountainCount = Math.floor(gridWidth * gridHeight * mountainDensity);
  const cityCount = Math.floor(gridWidth * gridHeight * cityDensity);
  const wetlandCount = Math.floor(gridWidth * gridHeight * wetlandDensity);

  placeTerrain(rng, grid, 'mountain', mountainCount, protectedCells, breedingPositions, winteringPositions);
  placeTerrain(rng, grid, 'city', cityCount, protectedCells, breedingPositions, winteringPositions);
  placeTerrain(rng, grid, 'wetland', wetlandCount, protectedCells, breedingPositions, winteringPositions);

  ensureConnectivity(rng, grid, breedingPositions, winteringPositions);

  sprinkleWetlandsInCorridors(rng, grid, corridorCells, protectedCells, wetlandCount / 2);

  return { grid, breedingPositions, winteringPositions };
}

function generateVerticalPositions(
  rng: () => number,
  min: number,
  max: number,
  count: number,
  margin: number
): number[] {
  const segmentHeight = Math.max(1, Math.floor((max - margin * 2) / count));
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    const segStart = margin + segmentHeight * i;
    const segEnd = Math.min(max - margin - 1, margin + segmentHeight * (i + 1) - 1);
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
  let iterations = 0;
  const maxIter = width * height * 3;

  while ((x !== end.x || y !== end.y) && iterations < maxIter) {
    iterations++;
    path.push({ x, y });
    const dx = Math.sign(end.x - x);
    const dy = Math.sign(end.y - y);

    const r = rng();
    if (dx !== 0 && dy !== 0) {
      if (r < 0.40) {
        x += dx;
      } else if (r < 0.65) {
        y += dy;
      } else if (r < 0.80) {
        x += dx;
        y += dy;
      } else if (r < 0.90) {
        x += dx;
        y += rng() < 0.5 ? 1 : -1;
      } else {
        y += dy;
        x += rng() < 0.5 ? 1 : -1;
      }
    } else if (dx !== 0) {
      if (r < 0.65) x += dx;
      else if (r < 0.82) y += 1;
      else y -= 1;
    } else {
      if (r < 0.65) y += dy;
      else if (r < 0.82) x += 1;
      else x -= 1;
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
  protectedSet: Set<string>,
  breedingPositions: { x: number; y: number }[],
  winteringPositions: { x: number; y: number }[]
) {
  const height = grid.length;
  const width = grid[0].length;
  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 50;

  while (placed < count && attempts < maxAttempts) {
    attempts++;
    const x = randomInt(rng, 0, width - 1);
    const y = randomInt(rng, 0, height - 1);
    const key = `${x},${y}`;

    const cell = grid[y][x];
    if (cell.terrain !== 'grass') continue;
    if (protectedSet.has(key)) continue;

    const isStartEnd = breedingPositions.some((p) => p.x === x && p.y === y) ||
      winteringPositions.some((p) => p.x === x && p.y === y);
    if (isStartEnd) continue;

    if (terrain === 'mountain') {
      let hasGrassNeighbor = false;
      for (let ddx = -1; ddx <= 1 && !hasGrassNeighbor; ddx++) {
        for (let ddy = -1; ddy <= 1 && !hasGrassNeighbor; ddy++) {
          if (ddx === 0 && ddy === 0) continue;
          const nx = x + ddx;
          const ny = y + ddy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (grid[ny][nx].terrain === 'grass') hasGrassNeighbor = true;
        }
      }
      if (!hasGrassNeighbor && attempts > count) continue;
    }

    grid[y][x].terrain = terrain;
    placed++;

    if (terrain === 'mountain' || terrain === 'city') {
      const clusterMax = terrain === 'mountain' ? 5 : 3;
      const clusterSize = randomInt(rng, 0, clusterMax);
      for (let i = 0; i < clusterSize; i++) {
        const cdx = randomInt(rng, -1, 1);
        const cdy = randomInt(rng, -1, 1);
        if (cdx === 0 && cdy === 0) continue;
        const cx = x + cdx;
        const cy = y + cdy;
        if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
        const ckey = `${cx},${cy}`;
        const ccell = grid[cy][cx];
        const cStartEnd = breedingPositions.some((p) => p.x === cx && p.y === cy) ||
          winteringPositions.some((p) => p.x === cx && p.y === cy);
        if (ccell.terrain === 'grass' && !protectedSet.has(ckey) && !cStartEnd) {
          grid[cy][cx].terrain = terrain;
          placed++;
        }
      }
    }
  }
}

function ensureConnectivity(
  rng: () => number,
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
      carveCorridor(rng, grid, start, end);
    }
  }
}

function carveCorridor(
  rng: () => number,
  grid: Cell[][],
  start: { x: number; y: number },
  end: { x: number; y: number }
) {
  let x = start.x;
  let y = start.y;
  const height = grid.length;
  const width = grid[0].length;
  let iterations = 0;
  const maxIter = width * height * 2;

  while ((x !== end.x || y !== end.y) && iterations < maxIter) {
    iterations++;
    const dx = Math.sign(end.x - x);
    const dy = Math.sign(end.y - y);

    if (grid[y] && grid[y][x] && grid[y][x].terrain === 'mountain') {
      grid[y][x].terrain = 'grass';
    }

    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const nx = x + ox;
        const ny = y + oy;
        if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
          if (grid[ny][nx].terrain === 'mountain' && Math.abs(ox) + Math.abs(oy) <= 1) {
            if (rng() < 0.55) grid[ny][nx].terrain = 'grass';
          }
        }
      }
    }

    const r = rng();
    if (dx !== 0 && dy !== 0) {
      if (r < 0.55) {
        x += dx;
      } else if (r < 0.80) {
        y += dy;
      } else {
        x += dx;
        y += dy;
      }
    } else if (dx !== 0) {
      x += dx;
    } else {
      y += dy;
    }
  }
}

function sprinkleWetlandsInCorridors(
  rng: () => number,
  grid: Cell[][],
  corridorCells: Set<string>,
  protectedCells: Set<string>,
  targetCount: number
) {
  const height = grid.length;
  const width = grid[0].length;
  let placed = 0;
  let attempts = 0;
  const maxAttempts = targetCount * 30;

  const corridorList = Array.from(corridorCells).filter((k) => {
    const [xs, ys] = k.split(',');
    const x = parseInt(xs, 10);
    const y = parseInt(ys, 10);
    return (
      grid[y] &&
      grid[y][x] &&
      grid[y][x].terrain === 'grass' &&
      !protectedCells.has(k) &&
      x > 1 &&
      x < width - 2
    );
  });

  if (corridorList.length === 0) return;

  while (placed < targetCount && attempts < maxAttempts) {
    attempts++;
    const key = corridorList[Math.floor(rng() * corridorList.length)];
    const [xs, ys] = key.split(',');
    const x = parseInt(xs, 10);
    const y = parseInt(ys, 10);
    if (grid[y][x].terrain === 'grass') {
      grid[y][x].terrain = 'wetland';
      placed++;
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
