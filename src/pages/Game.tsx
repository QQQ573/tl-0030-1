import { memo, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameBoard } from '@/components/game/GameBoard';
import { FlockCard } from '@/components/ui/FlockCard';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { StatusBar } from '@/components/ui/StatusBar';
import { ResultModal } from '@/components/ui/ResultModal';
import { CodexModal } from '@/components/ui/CodexModal';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { EventLogPanel } from '@/components/ui/EventLogPanel';
import { useNavigate } from 'react-router-dom';

export const Game = memo(function Game() {
  const { flocks, grid, difficulty } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (grid.length === 0 && difficulty) {
      navigate('/');
    }
  }, [grid.length, difficulty, navigate]);

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          'radial-gradient(ellipse at top, #B7E4C7 0%, transparent 60%), linear-gradient(180deg, #D8F3DC 0%, #95D5B2 100%)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <StatusBar />

        <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: '280px 1fr 300px' }}>
          <div className="space-y-3 order-1">
            <div
              className="rounded-2xl p-4 shadow-md"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
            >
              <div className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1B4332' }}>
                <span style={{ fontSize: 18 }}>🦩</span>
                迁徙队伍
              </div>
              <div className="space-y-2.5">
                {flocks.map((f) => (
                  <FlockCard key={f.configId} flock={f} />
                ))}
              </div>
            </div>
            <EventLogPanel />
          </div>

          <div className="flex flex-col items-center justify-start order-2 min-w-0">
            <GameBoard />
          </div>

          <div className="space-y-3 order-3">
            <ControlPanel />
          </div>
        </div>
      </div>

      <ResultModal />
      <CodexModal />
      <SettingsModal />
    </div>
  );
});

export default Game;
