import { memo, useEffect, useState } from 'react';
import type { Flock } from '@/types/game';
import { FLOCK_CONFIGS } from '@/data/species';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';

interface FlockSpriteProps {
  flock: Flock;
  cellSize: number;
  index: number;
  totalFlocks: number;
}

export const FlockSprite = memo(function FlockSprite({
  flock,
  cellSize,
  index,
  totalFlocks,
}: FlockSpriteProps) {
  const cfg = FLOCK_CONFIGS[flock.configId];
  const { selectedFlockId, selectFlock, turnPhase } = useGameStore();
  const { animationSpeed } = useUiStore();
  const [displayPos, setDisplayPos] = useState({ x: flock.position.x, y: flock.position.y });
  const [jitter, setJitter] = useState(0);

  const isSelected = selectedFlockId === flock.configId;
  const offsetX = (index - (totalFlocks - 1) / 2) * (cellSize * 0.15);

  useEffect(() => {
    setDisplayPos({ x: flock.position.x, y: flock.position.y });
  }, [flock.position.x, flock.position.y]);

  useEffect(() => {
    const id = setInterval(() => {
      setJitter((j) => (j + 1) % 4);
    }, 220 / animationSpeed);
    return () => clearInterval(id);
  }, [animationSpeed]);

  if (flock.hasArrived) {
    return (
      <div
        className="absolute pointer-events-none flex items-center justify-center z-10"
        style={{
          width: cellSize,
          height: cellSize,
          left: flock.position.x * cellSize,
          top: flock.position.y * cellSize,
          transition: 'all 0.5s ease',
        }}
      >
        <div
          className="flex items-center justify-center rounded-full shadow-xl border-2"
          style={{
            width: cellSize * 0.75,
            height: cellSize * 0.75,
            backgroundColor: 'rgba(116, 198, 157, 0.95)',
            borderColor: '#2D6A4F',
          }}
        >
          <span style={{ fontSize: cellSize * 0.4 }}>✅</span>
        </div>
      </div>
    );
  }

  if (flock.isDead) {
    return (
      <div
        className="absolute pointer-events-none flex items-center justify-center z-10"
        style={{
          width: cellSize,
          height: cellSize,
          left: flock.position.x * cellSize,
          top: flock.position.y * cellSize,
          opacity: 0.6,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: cellSize * 0.6,
            height: cellSize * 0.6,
            backgroundColor: 'rgba(200, 200, 200, 0.7)',
          }}
        >
          <span style={{ fontSize: cellSize * 0.35 }}>💔</span>
        </div>
      </div>
    );
  }

  const wingPhase = jitter < 2 ? -3 : 3;
  const isMoving = turnPhase === 'moving';
  const color = cfg?.color ?? '#666';

  return (
    <div
      onClick={() => selectFlock(isSelected ? null : flock.configId)}
      className="absolute z-20 flex items-center justify-center"
      style={{
        width: cellSize,
        height: cellSize,
        left: displayPos.x * cellSize + offsetX,
        top: displayPos.y * cellSize - 2,
        transition: isMoving ? 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.25s ease',
        cursor: 'pointer',
      }}
    >
      <div
        className="relative flex items-center justify-center rounded-full border-2 shadow-lg"
        style={{
          width: cellSize * 0.78,
          height: cellSize * 0.78,
          backgroundColor: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
          borderColor: isSelected ? '#FFD60A' : color,
          boxShadow: isSelected
            ? `0 0 0 3px rgba(255,214,10,0.4), 0 4px 12px rgba(0,0,0,0.25)`
            : `0 3px 8px rgba(0,0,0,0.2)`,
        }}
      >
        <span
          style={{
            fontSize: cellSize * 0.48,
            transform: `translateY(${wingPhase}px)`,
            transition: `transform ${180 / animationSpeed}ms ease-in-out`,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          }}
        >
          {cfg?.emoji ?? '🦩'}
        </span>

        <div
          className="absolute -bottom-1 -right-1 rounded-full text-white font-bold flex items-center justify-center shadow"
          style={{
            width: cellSize * 0.34,
            height: cellSize * 0.34,
            backgroundColor: color,
            fontSize: Math.floor(cellSize * 0.18),
            fontWeight: 700,
          }}
        >
          {flock.count}
        </div>

        {cfg?.grade === 'endangered' && (
          <div
            className="absolute -top-1.5 -right-1 rounded-full flex items-center justify-center animate-bounce"
            style={{
              width: cellSize * 0.28,
              height: cellSize * 0.28,
              backgroundColor: '#FFD60A',
              fontSize: cellSize * 0.16,
            }}
          >
            ⚠️
          </div>
        )}
      </div>
    </div>
  );
});
