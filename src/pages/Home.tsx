import { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_CONFIGS } from '@/data/difficulties';
import { SCIENCE_CARDS } from '@/data/scienceCards';
import { FLOCK_CONFIGS } from '@/data/species';
import { TERRAIN_CONFIGS } from '@/data/terrains';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { Dices, Copy, Check, Play, BookOpen, Info, ChevronRight } from 'lucide-react';
import { randomSeed, stringToSeed } from '@/lib/algorithms/seededRNG';

const DifficultyCard = memo(function DifficultyCard({
  id,
  selected,
  onClick,
}: {
  id: string;
  selected: boolean;
  onClick: () => void;
}) {
  const cfg = DIFFICULTY_CONFIGS[id];
  const accent = {
    easy: { color: '#40916C', bg: 'rgba(64,145,108,0.08)', border: 'rgba(64,145,108,0.5)' },
    medium: { color: '#F77F00', bg: 'rgba(247,127,0,0.08)', border: 'rgba(247,127,0,0.5)' },
    hard: { color: '#C1121F', bg: 'rgba(193,18,31,0.08)', border: 'rgba(193,18,31,0.5)' },
  }[id] ?? { color: '#666', bg: '#eee', border: '#ccc' };

  const flocksEmoji = cfg.flockConfigs.map((fid) => FLOCK_CONFIGS[fid]?.emoji ?? '🦩').join('');

  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl p-4 transition-all duration-200 border-2 active:scale-98"
      style={{
        backgroundColor: selected ? '#FFFFFF' : cfg?.id === 'easy' ? 'rgba(149,213,178,0.15)' : 'rgba(255,255,255,0.7)',
        borderColor: selected ? accent.color : 'rgba(0,0,0,0.06)',
        boxShadow: selected ? `0 0 0 3px ${accent.color}22, 0 10px 24px rgba(0,0,0,0.1)` : '0 4px 12px rgba(0,0,0,0.05)',
        transform: selected ? 'translateY(-2px)' : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xl font-extrabold" style={{ color: accent.color }}>
          {cfg.name.split('·')[0]}
        </div>
        <div style={{ fontSize: 22 }}>{flocksEmoji}</div>
      </div>
      <div className="text-xs text-gray-600 mb-3 leading-relaxed">{cfg.description}</div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div
          className="rounded-lg px-2 py-1 font-medium"
          style={{ backgroundColor: accent.bg, color: accent.color }}
        >
          📐 {cfg.gridWidth}×{cfg.gridHeight}
        </div>
        <div
          className="rounded-lg px-2 py-1 font-medium"
          style={{ backgroundColor: accent.bg, color: accent.color }}
        >
          🏕️ 停歇点×{cfg.baseRestStops + (cfg.flockConfigs.length > 2 ? 1 : 0)}
        </div>
      </div>
    </button>
  );
});

export const Home = memo(function Home() {
  const navigate = useNavigate();
  const initializeGame = useGameStore((s) => s.initializeGame);
  const collectedCardIds = useGameStore((s) => s.collectedCardIds);
  const { setShowCodex } = useUiStore();

  const [difficulty, setDifficulty] = useState<string>('medium');
  const [seedStr, setSeedStr] = useState<string>('');
  const [seedNum, setSeedNum] = useState<number>(() => randomSeed());
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setSeedStr(String(seedNum));
  }, [seedNum]);

  useEffect(() => {
    if (seedStr.trim() === '') return;
    if (/^\d+$/.test(seedStr.trim())) {
      setSeedNum(parseInt(seedStr.trim(), 10) >>> 0);
    } else {
      setSeedNum(stringToSeed(seedStr.trim()));
    }
  }, [seedStr]);

  const handleStart = () => {
    initializeGame(difficulty, seedNum);
    navigate('/game');
  };

  const handleRandomSeed = () => {
    setSeedNum(randomSeed());
  };

  const handleCopySeed = async () => {
    try {
      await navigator.clipboard.writeText(String(seedNum));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const progress = (collectedCardIds.length / SCIENCE_CARDS.length) * 100;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top left, #74C69D 0%, transparent 50%), radial-gradient(ellipse at bottom right, #48CAE4 0%, transparent 50%), linear-gradient(180deg, #D8F3DC 0%, #B7E4C7 50%, #95D5B2 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage:
          'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.3) 0%, transparent 35%)'
      }}/>

      <div className="absolute top-8 left-8 text-6xl opacity-20 animate-pulse">🦩</div>
      <div className="absolute top-24 right-16 text-5xl opacity-15" style={{ animation: 'float 4s ease-in-out infinite' }}>🌊</div>
      <div className="absolute bottom-20 left-20 text-5xl opacity-15">🏔️</div>
      <div className="absolute bottom-8 right-12 text-6xl opacity-20">🌾</div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
                fontSize: 32,
              }}
            >
              🦩
            </div>
            <div>
              <h1
                className="text-4xl font-extrabold leading-none"
                style={{
                  color: '#1B4332',
                  textShadow: '0 2px 0 rgba(255,255,255,0.6)',
                }}
              >
                鹤舞归途
              </h1>
              <div className="text-sm mt-1" style={{ color: '#2D6A4F' }}>
                黑颈鹤迁徙廊道科普策略游戏
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCodex(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                color: '#1D3557',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid rgba(29,53,87,0.15)',
              }}
            >
              <BookOpen size={18} />
              <span>图鉴</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs text-white font-bold"
                style={{ backgroundColor: '#1D3557' }}
              >
                {collectedCardIds.length}/{SCIENCE_CARDS.length}
              </span>
            </button>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#1D3557',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(29,53,87,0.3)',
              }}
            >
              <Info size={18} />
              玩法
            </button>
          </div>
        </header>

        {showGuide && (
          <div
            className="mb-10 rounded-3xl p-6 backdrop-blur-md border-2"
            style={{
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderColor: 'rgba(29,53,87,0.15)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
            }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { emoji: '🎯', title: '目标', desc: '放置停歇点，引导鹤群从繁殖地🥚飞到越冬地🌾' },
                { emoji: '🏕️', title: '策略', desc: '停歇点降低路径代价，让鹤群绕开城市🏙️和山脉⛰️' },
                { emoji: '🌊', title: '补给', desc: '湿地🌊可恢复体力，城市🏙️会造成减员' },
                { emoji: '⚠️', title: '保护', desc: '濒危种🕊️减员上限严，优先规划好路线！' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: 'rgba(45,106,79,0.06)',
                    border: '1px solid rgba(45,106,79,0.15)',
                  }}
                >
                  <div className="text-3xl mb-1">{item.emoji}</div>
                  <div className="font-extrabold mb-1" style={{ color: '#1B4332' }}>
                    {item.title}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: '#333' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200/70">
              <div className="text-sm font-bold mb-3" style={{ color: '#1B4332' }}>
                🗺️ 地形图例
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.values(TERRAIN_CONFIGS).map((t) => (
                  <div
                    key={t.type}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: t.bgColor + '55',
                      color: '#333',
                      border: `1px solid ${t.borderColor}`,
                    }}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div
              className="rounded-3xl p-6 backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.7)',
              }}
            >
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2" style={{ color: '#1B4332' }}>
                <span style={{ fontSize: 24 }}>🎮</span>
                选择难度
              </h2>
              <div className="grid md:grid-cols-3 gap-3">
                {Object.keys(DIFFICULTY_CONFIGS).map((id) => (
                  <DifficultyCard
                    key={id}
                    id={id}
                    selected={difficulty === id}
                    onClick={() => setDifficulty(id)}
                  />
                ))}
              </div>
            </div>

            <div
              className="rounded-3xl p-6 backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.7)',
              }}
            >
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2" style={{ color: '#1B4332' }}>
                <span style={{ fontSize: 24 }}>🌱</span>
                地图种子
                <span className="text-xs font-normal text-gray-500 ml-2">
                  相同种子生成完全相同的地图，便于课堂教学复现
                </span>
              </h2>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex-1 min-w-[240px] relative">
                  <input
                    value={seedStr}
                    onChange={(e) => setSeedStr(e.target.value)}
                    placeholder="输入任意数字或文字作为种子..."
                    className="w-full px-4 py-3 pr-24 rounded-xl font-mono text-sm outline-none transition-all"
                    style={{
                      backgroundColor: '#F8F9FA',
                      border: '2px solid rgba(45,106,79,0.2)',
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      onClick={handleCopySeed}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-200 text-gray-500"
                      title="复制种子编号"
                    >
                      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={handleRandomSeed}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-200 text-gray-500"
                      title="随机种子"
                    >
                      <Dices size={14} />
                    </button>
                  </div>
                </div>
                <div
                  className="px-3 py-2 rounded-xl font-mono font-bold text-sm"
                  style={{
                    backgroundColor: 'rgba(255,183,3,0.15)',
                    color: '#9A6A00',
                    border: '1px solid rgba(255,183,3,0.4)',
                  }}
                >
                  内部编号: #{seedNum}
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full rounded-3xl py-5 px-6 font-extrabold text-xl text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] group"
              style={{
                background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 50%, #52B788 100%)',
                boxShadow: '0 14px 40px rgba(45,106,79,0.45)',
              }}
            >
              <Play size={28} fill="currentColor" />
              开始迁徙之旅
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div
              className="rounded-3xl p-6 backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.7)',
              }}
            >
              <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2" style={{ color: '#1B4332' }}>
                <span style={{ fontSize: 24 }}>📊</span>
                图鉴进度
              </h2>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="font-bold" style={{ color: '#1D3557' }}>
                    收集完成度
                  </span>
                  <span className="font-extrabold" style={{ color: '#2D6A4F' }}>
                    {collectedCardIds.length}/{SCIENCE_CARDS.length}
                  </span>
                </div>
                <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #40916C, #95D5B2, #FFB703)',
                      boxShadow: '0 0 10px rgba(64,145,108,0.4)',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {(['common', 'rare', 'legendary'] as const).map((r) => {
                  const count = collectedCardIds.filter((id) =>
                    SCIENCE_CARDS.find((c) => c.id === id)?.rarity === r
                  ).length;
                  const total = SCIENCE_CARDS.filter((c) => c.rarity === r).length;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  const names: Record<string, string> = { common: '普通', rare: '稀有', legendary: '传说' };
                  const colors: Record<string, string> = {
                    common: '#6C757D',
                    rare: '#339AF0',
                    legendary: '#F59F00',
                  };
                  return (
                    <div
                      key={r}
                      className="rounded-xl py-2"
                      style={{
                        backgroundColor: colors[r] + '11',
                        border: `1px solid ${colors[r]}44`,
                      }}
                    >
                      <div className="text-[10px] font-bold" style={{ color: colors[r] }}>
                        {names[r]}
                      </div>
                      <div className="text-lg font-extrabold" style={{ color: colors[r] }}>
                        {count}
                        <span className="text-xs opacity-60">/{total}</span>
                      </div>
                      <div className="h-1 mx-2 mt-0.5 rounded-full" style={{ backgroundColor: colors[r] + '22' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: colors[r] }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div
                  className="rounded-xl py-2 col-span-1"
                  style={{
                    backgroundColor: 'rgba(45,106,79,0.08)',
                    border: '1px solid rgba(45,106,79,0.2)',
                  }}
                >
                  <div className="text-[10px] font-bold" style={{ color: '#2D6A4F' }}>
                    总计
                  </div>
                  <div className="text-lg font-extrabold" style={{ color: '#2D6A4F' }}>
                    {Math.round(progress)}
                    <span className="text-xs opacity-60">%</span>
                  </div>
                </div>
              </div>

              {collectedCardIds.length === 0 && (
                <div className="mt-4 p-3 rounded-xl text-center text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.03)', color: '#666' }}>
                  完成关卡即可解锁科普卡片！
                </div>
              )}
            </div>

            <div
              className="rounded-3xl p-5 backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg, rgba(255,183,3,0.15), rgba(251,133,0,0.1))',
                border: '1px solid rgba(255,183,3,0.3)',
              }}
            >
              <div className="flex items-start gap-3">
                <span style={{ fontSize: 32 }}>💡</span>
                <div className="text-sm leading-relaxed" style={{ color: '#7B4B00' }}>
                  <div className="font-extrabold mb-1">教学使用提示</div>
                  教师可指定种子编号让全班学生使用相同地图，对比不同放置策略的效果，讨论廊道保护的科学原理。
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-10 pt-6 border-t border-black/5 text-center text-xs" style={{ color: '#2D6A4F', opacity: 0.7 }}>
          鹤舞归途 · 黑颈鹤保护科普游戏 · 为科研组青少年科普活动定制
        </footer>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
});

export default Home;
