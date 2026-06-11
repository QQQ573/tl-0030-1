import { memo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { X, Volume2, VolumeX, Zap } from 'lucide-react';
import { useState } from 'react';

export const SettingsModal = memo(function SettingsModal() {
  const { showSettings, setShowSettings, animationSpeed, setAnimationSpeed } = useUiStore();
  const [soundOn, setSoundOn] = useState(true);

  if (!showSettings) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={() => setShowSettings(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFBF5' }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #1D3557, #457B9D)',
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 32 }}>⚙️</span>
            <h2 className="text-white text-xl font-extrabold">游戏设置</h2>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap size={18} style={{ color: '#F77F00' }} />
                <span className="font-bold text-sm" style={{ color: '#1B4332' }}>
                  动画速度
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: '#F77F00' }}>
                {animationSpeed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>慢 0.5x</span>
              <span>正常 1x</span>
              <span>快 3x</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
            <div className="flex items-center gap-2">
              {soundOn ? (
                <Volume2 size={20} style={{ color: '#2D6A4F' }} />
              ) : (
                <VolumeX size={20} className="text-gray-400" />
              )}
              <span className="font-bold text-sm" style={{ color: '#1B4332' }}>
                音效开关
              </span>
            </div>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="w-14 h-7 rounded-full relative transition-all"
              style={{
                backgroundColor: soundOn ? '#40916C' : '#ccc',
              }}
            >
              <div
                className="absolute top-0.5 rounded-full bg-white shadow-md transition-all"
                style={{
                  width: 24,
                  height: 24,
                  left: soundOn ? 30 : 4,
                }}
              />
            </button>
          </div>

          <div
            className="p-4 rounded-xl text-xs leading-relaxed"
            style={{
              backgroundColor: 'rgba(45, 106, 79, 0.06)',
              color: '#2D6A4F',
              border: '1px solid rgba(45, 106, 79, 0.15)',
            }}
          >
            <strong className="block mb-1 text-sm">💡 游戏小贴士</strong>
            <ul className="space-y-1 list-disc list-inside opacity-90">
              <li>湿地可以大量恢复体力，合理规划路径</li>
              <li>停歇点会降低寻路代价，可以改变鹤群路径</li>
              <li>濒危种群减员上限严格，优先保护它们</li>
              <li>地图种子可复制，教学时能复现相同布局</li>
              <li>路径预测虚线可帮助调整策略</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});
