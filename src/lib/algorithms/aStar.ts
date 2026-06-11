import type { Cell, AStarOptions, TerrainType } from '@/types/game';

interface AStarNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: AStarNode | null;
}

function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return manhattanDistance(x1, y1, x2, y2);
}

export function aStar(
  start: { x: number; y: number },
  goal: { x: number; y: number },
  grid: Cell[][],
  options: AStarOptions
): { x: number; y: number }[] | null {
  const width = grid[0].length;
  const height = grid.length;

  const { terrainCosts, impassableTerrains, blockedCells, restStopBonus, avoidCity } = options;

  if (start.x === goal.x && start.y === goal.y) {
    return [{ x: start.x, y: start.y }];
  }

  const openMap = new Map<string, AStarNode>();
  const closedSet = new Set<string>();

  const startNode: AStarNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start.x, start.y, goal.x, goal.y),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openMap.set(cellKey(start.x, start.y), startNode);

  const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
  ];

  let iterations = 0;
  const maxIterations = width * height * 8;

  while (openMap.size > 0 && iterations < maxIterations) {
    iterations++;

    let currentKey: string = '';
    let current: AStarNode | null = null;
    let lowestF = Infinity;

    for (const [key, node] of openMap) {
      if (node.f < lowestF) {
        lowestF = node.f;
        currentKey = key;
        current = node;
      }
    }

    if (!current) break;

    if (current.x === goal.x && current.y === goal.y) {
      const path: { x: number; y: number }[] = [];
      let node: AStarNode | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    openMap.delete(currentKey);
    closedSet.add(currentKey);

    for (const dir of directions) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const nKey = cellKey(nx, ny);

      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (closedSet.has(nKey)) continue;

      const cell = grid[ny][nx];

      if (impassableTerrains.includes(cell.terrain)) continue;

      if (blockedCells && blockedCells.has(nKey)) continue;

      let moveCost = terrainCosts[cell.terrain] || 1;

      if (avoidCity && cell.terrain === 'city') {
        moveCost *= 10;
      }

      if (cell.hasRestStop) {
        moveCost = Math.max(0.3, moveCost * (1 - restStopBonus));
      }

      if (cell.terrain === 'wetland') {
        moveCost *= 0.7;
      }

      const isDiagonal = dir.dx !== 0 && dir.dy !== 0;
      if (isDiagonal) {
        moveCost *= 1.4;
      }

      const tentativeG = current.g + moveCost;

      const existingNode = openMap.get(nKey);
      if (existingNode && tentativeG >= existingNode.g) continue;

      const neighbor: AStarNode = {
        x: nx,
        y: ny,
        g: tentativeG,
        h: heuristic(nx, ny, goal.x, goal.y),
        f: 0,
        parent: current,
      };
      neighbor.f = neighbor.g + neighbor.h;
      openMap.set(nKey, neighbor);
    }
  }

  return null;
}

export function calculatePathLength(path: { x: number; y: number }[] | null): number {
  if (!path || path.length < 2) return 0;
  let length = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

export function getPathTerrains(path: { x: number; y: number }[], grid: Cell[][]): TerrainType[] {
  return path.map((p) => {
    const row = grid[p.y];
    if (!row) return 'grass' as TerrainType;
    const cell = row[p.x];
    return cell ? cell.terrain : ('grass' as TerrainType);
  });
}
