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
  const { placeRestStop, removeRestStop, placingRestStop, phase, restStopsRemaining } = useGameStore();
  const { hoveredCell, setHoveredCell } = useUiStore();

  const isHovered = hoveredCell?.x === cell.x && hoveredCell?.y === cell.y;
  const isInteractive = phase === 'planning';

  const canPlaceByClick =
    isInteractive &&
    !cell.hasRestStop &&
    cell.terrain !== 'mountain' &&
    cell.terrain !== 'breeding' &&
    cell.terrain !== 'wintering' &&
    restStopsRemaining > 0;

  const canPlaceInMode = placingRestStop && canPlaceByClick;

  const canRemoveRestStop = isInteractive && cell.hasRestStop;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canRemoveRestStop) {
      removeRestStop(cell.x, cell.y);
    } else if (placingRestStop && canPlaceByClick) {
      placeRestStop(cell.x, cell.y);
    } else if (!placingRestStop && canPlaceByClick) {
      placeRestStop(cell.x, cell.y);
    }
  };

  const cityNoise = cell.terrain === 'city';

  const cursor =
    canRemoveRestStop
      ? 'pointer'
      : canPlaceByClick
        ? 'copy'
        : isInteractive
          ? 'help'
          : 'default';

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHoveredCell({ x: cell.x, y: cell.y })}
      onMouseLeave={() => setHoveredCell(null)}
      className="relative flex items-center justify-center select-none transition-all duration-100"
      style={{
        width: cellSize,
        height: cellSize,
        backgroundColor: cfg.bgColor,
        borderRight: '1px solid rgba(0,0,0,0.08)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        cursor,
        boxShadow: isHovered
          ? canPlaceByClick
            ? 'inset 0 0 0 2.5px #FFD60A'
            : canRemoveRestStop
              ? 'inset 0 0 0 2.5px #E63946'
              : 'inset 0 0 0 2px rgba(255,255,255,0.4)'
          : undefined,
      }}
    >
      {cityNoise && (
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
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
              'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.45), transparent 55%)',
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
          className="absolute rounded-full flex items-center justify-center border-2 shadow-xl z-10"
          style={{
            width: cellSize * 0.72,
            height: cellSize * 0.72,
            backgroundColor: 'rgba(255, 214, 10, 0.95)',
            borderColor: '#FF8800',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 12px rgba(255, 136, 0, 0.5)',
          }}
        >
          <span style={{ fontSize: cellSize * 0.4 }}>🏕️</span>
        </div>
      )}

      {canPlaceByClick && isHovered && !cell.hasRestStop && (
        <div
          className="absolute rounded-full flex items-center justify-center border-2 border-dashed pointer-events-none z-10"
          style={{
            width: cellSize * 0.65,
            height: cellSize * 0.65,
            borderColor: '#FF8800',
            backgroundColor: 'rgba(255, 214, 10, 0.35)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span style={{ fontSize: cellSize * 0.32, opacity: 0.7 }}>🏕️</span>
        </div>
      )}
    </div>
  );
});
