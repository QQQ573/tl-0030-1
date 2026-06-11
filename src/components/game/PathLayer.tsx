import { memo } from 'react';
import type { Flock } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { FLOCK_CONFIGS } from '@/data/species';

interface PathLayerProps {
  cellSize: number;
  flocks: Flock[];
  gridWidth: number;
  gridHeight: number;
}

function buildPathD(
  path: { x: number; y: number }[],
  cellSize: number,
  offset: number
): string {
  if (!path || path.length === 0) return '';
  return path
    .map((p, i) => {
      const cx = p.x * cellSize + cellSize / 2;
      const cy = p.y * cellSize + cellSize / 2 + offset;
      return `${i === 0 ? 'M' : 'L'} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
    })
    .join(' ');
}

export const PathLayer = memo(function PathLayer({
  cellSize,
  flocks,
  gridWidth,
  gridHeight,
}: PathLayerProps) {
  const { selectedFlockId } = useGameStore();
  const { animationSpeed } = useUiStore();
  const width = gridWidth * cellSize;
  const height = gridHeight * cellSize;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {flocks.map((f, i) => {
          const cfg = FLOCK_CONFIGS[f.configId];
          return (
            <linearGradient key={`grad-${f.configId}`} id={`pathgrad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={cfg?.color ?? '#666'} stopOpacity="0.9" />
              <stop offset="100%" stopColor={cfg?.color ?? '#666'} stopOpacity="0.3" />
            </linearGradient>
          );
        })}
      </defs>

      {flocks.map((flock, i) => {
        if (flock.hasArrived || flock.isDead) return null;
        const cfg = FLOCK_CONFIGS[flock.configId];
        const path = flock.predictedPath;
        if (!path || path.length < 2) return null;

        const isSelected = selectedFlockId === flock.configId;
        const color = cfg?.color ?? '#666';
        const isOther = selectedFlockId && !isSelected;
        const offset = (i - (flocks.length - 1) / 2) * 2;

        const d = buildPathD(path, cellSize, offset);

        return (
          <g key={`path-${flock.configId}`} opacity={isOther ? 0.35 : 1}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={isSelected ? 3.5 : 2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 5"
              style={{
                filter: isSelected ? `drop-shadow(0 0 4px ${color})` : undefined,
              }}
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-22"
                dur={`${1.4 / animationSpeed}s`}
                repeatCount="indefinite"
              />
            </path>

            {path.length >= 2 && (
              <>
                <circle
                  cx={path[path.length - 1].x * cellSize + cellSize / 2}
                  cy={path[path.length - 1].y * cellSize + cellSize / 2 + offset}
                  r={4}
                  fill={color}
                  opacity={0.8}
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
});
