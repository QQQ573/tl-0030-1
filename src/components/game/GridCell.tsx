import { memo } from 'react';
import type { Cell } from '@/types/game';
import { TERRAIN_CONFIGS } from '@/data/terrains';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';

interface GridCellProps {
  cell: Cell;
  cellSize: number;
}

export const GridCell = memo(function GridCell({ cell, cellSize }: GridCellProps) {
  const cfg = TERRAIN_CONFIGS[cell.terrain];
  const { placeRestStop, removeRestStop, placingRestStop, phase } = useGameStore();
  const { hoveredCell, setHoveredCell } = useUiStore();

  const isHovered = hoveredCell?.x === cell.x && hoveredCell?.y === cell.y;
  const isInteractive = phase === 'planning';

  const canPlaceRestStop =
    isInteractive &&
    placingRestStop &&
    !cell.hasRestStop &&
    cell.terrain !== 'mountain' &&
    cell.terrain !== 'breeding' &&
    cell.terrain !== 'wintering';

  const canRemoveRestStop = isInteractive && cell.hasRestStop;

  const handleClick = () => {
    if (canPlaceRestStop) {
      placeRestStop(cell.x, cell.y);
    } else if (canRemoveRestStop) {
      removeRestStop(cell.x, cell.y);
    }
  };

  const cityNoise = cell.terrain === 'city';

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHoveredCell({ x: cell.x, y: cell.y })}
      onMouseLeave={() => setHoveredCell(null)}
      className="relative flex items-center justify-center select-none transition-all duration-150"
      style={{
        width: cellSize,
        height: cellSize,
        backgroundColor: cfg.bgColor,
        borderRight: '1px solid rgba(0,0,0,0.08)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        cursor: canPlaceRestStop
          ? 'copy'
          : canRemoveRestStop
            ? 'pointer'
            : isInteractive && placingRestStop
              ? 'not-allowed'
              : 'default',
        boxShadow: isHovered ? 'inset 0 0 0 2px #FFD60A' : undefined,
      }}
    >
      {cityNoise && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 6px)',
          }}
        />
      )}

      {cell.terrain === 'wetland' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.35), transparent 50%)',
          }}
        />
      )}

      <span
        className="pointer-events-none"
        style={{ fontSize: Math.floor(cellSize * 0.5), filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}
      >
        {cfg.emoji}
      </span>

      {cell.hasRestStop && (
        <div
          className="absolute rounded-full flex items-center justify-center border-2 animate-pulse shadow-lg"
          style={{
            width: cellSize * 0.7,
            height: cellSize * 0.7,
            backgroundColor: 'rgba(255, 214, 10, 0.9)',
            borderColor: '#FF8800',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span style={{ fontSize: cellSize * 0.4 }}>🏕️</span>
        </div>
      )}

      {canPlaceRestStop && isHovered && (
        <div
          className="absolute rounded-full flex items-center justify-center border-2 border-dashed pointer-events-none"
          style={{
            width: cellSize * 0.65,
            height: cellSize * 0.65,
            borderColor: '#FF8800',
            backgroundColor: 'rgba(255, 214, 10, 0.3)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
});
