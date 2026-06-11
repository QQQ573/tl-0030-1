import { memo, useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Pause, Play, Settings, Copy, Check, BookOpen } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

export const StatusBar = memo(function StatusBar() {
  const {
    seed,
    currentTurn,
    maxTurns,
    difficulty,
    phase,
    flocks,
    pauseGame,
    resumeGame,
  } = useGameStore();
  const { setShowSettings, setShowCodex } = useUiStore();
  const [copied, setCopied] = useState(false);

  const arrivedCount = flocks.filter((f) => f.hasArrived).length;
  const totalFlocks = flocks.length;

  const copySeed = () => {
    navigator.clipboard?.writeText(String(seed));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const turnProgress = (currentTurn / maxTurns) * 100;

  const phaseLabel = {
    planning: '🧭 规划阶段',
    executing: '✈️ 迁徙中',
    paused: '⏸️ 已暂停',
    won: '🎉 胜利',
    lost: '💔 失败',
  }[phase];

  const phaseColor = {
    planning: '#219EBC',
    executing: '#2D6A4F',
    paused: '#F77F00',
    won: '#40916C',
    lost: '#C1121F',
  }[phase];

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="w-full rounded-2xl px-5 py-3 shadow-lg border-2"
      style={{
        background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
        borderColor: '#1B4332',
      }}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 32 }}>🦩</span>
          <div>
            <div className="text-white font-extrabold text-lg leading-tight">
              鹤舞归途
            </div>
            <div className="text-white/70 text-xs">{difficulty.name}</div>
          </div>
        </div>

        <div className="h-10 w-px bg-white/20" />

        <div
          className="px-3 py-1.5 rounded-xl font-bold text-sm"
          style={{
            backgroundColor: `${phaseColor}22`,
            color: '#fff',
            border: `1px solid ${phaseColor}66`,
          }}
        >
          {phaseLabel}
        </div>

        <div className="flex-1 min-w-[180px]">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-white/80 font-medium">迁徙进度</span>
            <span className="text-white font-bold">
              {arrivedCount}/{totalFlocks} 抵达 · {currentTurn}/{maxTurns} 回合
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-white/15">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(turnProgress, (arrivedCount / Math.max(1, totalFlocks)) * 100)}%`,
                background:
                  phase === 'won'
                    ? 'linear-gradient(90deg, #40916C, #95D5B2)'
                    : phase === 'lost'
                      ? 'linear-gradient(90deg, #C1121F, #FF6B6B)'
                      : 'linear-gradient(90deg, #FFB703, #FB8500)',
              }}
            />
          </div>
        </div>

        <div
          onClick={copySeed}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:bg-white/10"
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          title="点击复制种子编号（相同种子生成相同地图）"
        >
          <span className="text-white/70 text-xs">种子</span>
          <span className="text-yellow-300 font-bold font-mono text-sm">#{seed}</span>
          {copied ? (
            <Check size={14} className="text-green-300" />
          ) : (
            <Copy size={12} className="text-white/60" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {phase === 'executing' && (
            <button
              onClick={pauseGame}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-white/80"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              title="暂停"
            >
              <Pause size={16} />
            </button>
          )}
          {phase === 'paused' && (
            <button
              onClick={resumeGame}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-yellow-300"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              title="继续"
            >
              <Play size={16} fill="currentColor" />
            </button>
          )}
          <button
            onClick={() => setShowCodex(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-white/80"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            title="图鉴"
          >
            <BookOpen size={16} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-white/80"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            title="设置"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});
