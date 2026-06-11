import { memo, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { GridCell } from './GridCell';
import { PathLayer } from './PathLayer';
import { FlockSprite } from './FlockSprite';
import { TERRAIN_CONFIGS } from '@/data/terrains';

export const GameBoard = memo(function GameBoard() {
  const { grid, flocks, difficulty } = useGameStore();
  const { cellSize, setCellSize, hoveredCell } = useUiStore();

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      let size = 52;
      if (w < 768) size = 40;
      else if (w < 1100) size = 46;
      else if (w < 1400) size = 50;
      else size = 56;
      setCellSize(size);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [setCellSize]);

  const boardWidth = difficulty.gridWidth * cellSize;
  const boardHeight = difficulty.gridHeight * cellSize;

  const hoveredInfo = useMemo(() => {
    if (!hoveredCell) return null;
    const cell = grid[hoveredCell.y]?.[hoveredCell.x];
    if (!cell) return null;
    return TERRAIN_CONFIGS[cell.terrain];
  }, [hoveredCell, grid]);

  if (grid.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400">
        正在生成地图...
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: boardWidth,
          height: boardHeight,
          backgroundColor: '#1B4332',
          border: '4px solid #1B4332',
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(45, 106, 79, 0.3), rgba(27, 67, 50, 0.8))',
        }}
      >
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: `repeat(${difficulty.gridWidth}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${difficulty.gridHeight}, ${cellSize}px)`,
          }}
        >
          {grid.flat().map((cell) => (
            <GridCell key={`${cell.x}-${cell.y}`} cell={cell} cellSize={cellSize} />
          ))}
        </div>

        <PathLayer
          cellSize={cellSize}
          flocks={flocks}
          gridWidth={difficulty.gridWidth}
          gridHeight={difficulty.gridHeight}
        />

        {flocks.map((flock, i) => (
          <FlockSprite
            key={flock.configId}
            flock={flock}
            cellSize={cellSize}
            index={i}
            totalFlocks={flocks.length}
          />
        ))}
      </div>

      <div
        className="mt-3 px-4 py-2 rounded-xl text-sm"
        style={{
          minHeight: 40,
          backgroundColor: hoveredInfo ? 'rgba(45, 106, 79, 0.1)' : 'rgba(0,0,0,0.02)',
          border: '1px solid rgba(45, 106, 79, 0.2)',
          color: '#1B4332',
          width: boardWidth,
        }}
      >
        {hoveredInfo ? (
          <span>
            <strong>
              {hoveredInfo.emoji} {hoveredInfo.name}
            </strong>
            {' — '}
            {hoveredInfo.description}
          </span>
        ) : (
          <span className="text-gray-500">
            💡 鼠标悬停查看地形说明 · 点击空地放置停歇点 · 再次点击移除
          </span>
        )}
      </div>
    </div>
  );
});
