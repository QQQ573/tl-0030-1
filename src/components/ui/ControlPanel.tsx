import { memo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { Home, Play, SkipForward, RotateCcw, Trash2, Tent, BookOpen, ScrollText, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ControlPanel = memo(function ControlPanel() {
  const {
    phase,
    turnPhase,
    restStopsRemaining,
    placingRestStop,
    togglePlacingRestStop,
    clearAllRestStops,
    executeTurn,
    executeAuto,
    resetGame,
  } = useGameStore();
  const { setShowCodex, setShowEventLog, showEventLog } = useUiStore();
  const navigate = useNavigate();
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  const isPlanning = phase === 'planning';
  const canExecute =
    (phase === 'planning' || phase === 'executing') && turnPhase === 'idle' && !isAutoRunning;

  const handleAuto = () => {
    setIsAutoRunning(true);
    executeAuto();
    setTimeout(() => setIsAutoRunning(false), 3000);
  };

  const buttonBase =
    'w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-95';

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-4 shadow-md border"
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderColor: 'rgba(255, 136, 0, 0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 136, 0, 0.12)' }}
            >
              <Tent size={20} style={{ color: '#FF8800' }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: '#1B4332' }}>
                停歇点 🏕️
              </div>
              <div className="text-xs text-gray-500">引导鹤群选择更优路径</div>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full font-bold text-lg"
            style={{
              backgroundColor:
                restStopsRemaining > 0 ? 'rgba(255, 136, 0, 0.12)' : 'rgba(193,18,31,0.1)',
              color: restStopsRemaining > 0 ? '#FF8800' : '#C1121F',
            }}
          >
            ×{restStopsRemaining}
          </div>
        </div>

        <div
          className="mb-3 p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2"
          style={{
            backgroundColor: 'rgba(33, 158, 188, 0.08)',
            border: '1px solid rgba(33, 158, 188, 0.2)',
            color: '#005F73',
          }}
        >
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <div>
            <strong>操作说明：</strong>
            直接点击地图上的草地🌿即可放置停歇点；
            再次点击已有停歇点可撤销。
            停歇点会降低寻路代价，让鹤群绕开城市。
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={togglePlacingRestStop}
            disabled={!isPlanning || restStopsRemaining <= 0}
            className={`${buttonBase}`}
            style={{
              backgroundColor: placingRestStop
                ? 'linear-gradient(135deg, #FF8800, #FFB703)'
                : 'rgba(255, 136, 0, 0.12)',
              color: placingRestStop ? '#FFFFFF' : '#FF8800',
              opacity: !isPlanning || restStopsRemaining <= 0 ? 0.45 : 1,
              cursor: !isPlanning || restStopsRemaining <= 0 ? 'not-allowed' : 'pointer',
              border: placingRestStop ? 'none' : '2px solid rgba(255, 136, 0, 0.3)',
              boxShadow: placingRestStop ? '0 4px 14px rgba(255,136,0,0.35)' : undefined,
            }}
          >
            {placingRestStop ? '✓ 连续放置模式（点击任意草地放置）' : '🏕️ 开启连续放置模式'}
          </button>

          <button
            onClick={clearAllRestStops}
            disabled={!isPlanning}
            className={`${buttonBase}`}
            style={{
              backgroundColor: 'rgba(108, 88, 76, 0.08)',
              color: '#6C584C',
              opacity: !isPlanning ? 0.45 : 1,
              cursor: !isPlanning ? 'not-allowed' : 'pointer',
            }}
          >
            <Trash2 size={16} />
            清空所有停歇点
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl p-4 shadow-md"
        style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
      >
        <div className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ color: '#1B4332' }}>
          <span style={{ fontSize: 18 }}>🎮</span>
          迁徙控制
        </div>

        <div className="space-y-2">
          <button
            onClick={executeTurn}
            disabled={!canExecute}
            className={`${buttonBase} text-white`}
            style={{
              background: canExecute
                ? 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)'
                : '#95A5A6',
              opacity: canExecute ? 1 : 0.6,
              cursor: canExecute ? 'pointer' : 'not-allowed',
              boxShadow: canExecute ? '0 4px 14px rgba(45, 106, 79, 0.3)' : undefined,
            }}
          >
            <Play size={18} fill="currentColor" />
            ▶ 执行 1 回合
          </button>

          <button
            onClick={handleAuto}
            disabled={!canExecute}
            className={`${buttonBase}`}
            style={{
              backgroundColor: canExecute ? 'rgba(33, 158, 188, 0.12)' : 'rgba(0,0,0,0.04)',
              color: canExecute ? '#219EBC' : '#999',
              border: '2px solid rgba(33, 158, 188, 0.3)',
              opacity: canExecute ? 1 : 0.5,
              cursor: canExecute ? 'pointer' : 'not-allowed',
            }}
          >
            <SkipForward size={16} />
            ⏩ 自动迁徙（快速）
          </button>

          <button
            onClick={resetGame}
            className={`${buttonBase}`}
            style={{
              backgroundColor: 'rgba(230, 57, 70, 0.08)',
              color: '#E63946',
              border: '1px solid rgba(230, 57, 70, 0.2)',
            }}
          >
            <RotateCcw size={16} />
            🔄 重置关卡（同种子）
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl p-4 shadow-md"
        style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
      >
        <div className="space-y-2">
          <button
            onClick={() => setShowCodex(true)}
            className={`${buttonBase}`}
            style={{
              backgroundColor: 'rgba(29, 53, 87, 0.08)',
              color: '#1D3557',
            }}
          >
            <BookOpen size={16} />
            📖 科普图鉴
          </button>

          <button
            onClick={() => setShowEventLog(!showEventLog)}
            className={`${buttonBase}`}
            style={{
              backgroundColor: showEventLog
                ? 'rgba(247, 127, 0, 0.15)'
                : 'rgba(247, 127, 0, 0.08)',
              color: '#F77F00',
              border: showEventLog ? '2px solid rgba(247, 127, 0, 0.3)' : undefined,
            }}
          >
            <ScrollText size={16} />
            {showEventLog ? '✓ 关闭' : '📜 查看'}事件日志
          </button>

          <button
            onClick={() => navigate('/')}
            className={`${buttonBase}`}
            style={{
              backgroundColor: 'rgba(0,0,0,0.04)',
              color: '#444',
            }}
          >
            <Home size={16} />
            🏠 返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
});
