import { memo, useState, useEffect } from 'react';
import type { ScienceCard } from '@/types/game';
import { SCIENCE_CARDS, CARD_CATEGORY_NAMES, CARD_RARITY_COLORS, CARD_RARITY_NAMES } from '@/data/scienceCards';
import { Star, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { useNavigate } from 'react-router-dom';

interface ResultModalProps {
  onClose?: () => void;
}

const StarRating = memo(function StarRating({ stars, size = 32 }: { stars: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={size}
          className="transition-all duration-500"
          fill={i <= stars ? '#FFD60A' : 'rgba(255,255,255,0.15)'}
          stroke={i <= stars ? '#FB8500' : 'rgba(255,255,255,0.3)'}
          style={{
            transform: i <= stars ? 'scale(1) rotate(0deg)' : 'scale(0.85)',
            filter: i <= stars ? 'drop-shadow(0 2px 6px rgba(251,133,0,0.45))' : 'none',
          }}
        />
      ))}
    </div>
  );
});

const CardReveal = memo(function CardReveal({
  card,
  delay,
}: {
  card: ScienceCard;
  delay: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const colors = CARD_RARITY_COLORS[card.rarity];

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="perspective-1000"
      style={{ perspective: '1000px', width: 220, minHeight: 280 }}
    >
      <div
        className="w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: revealed ? 'rotateY(0deg)' : 'rotateY(180deg)',
        }}
      >
        <div
          className="w-full h-full rounded-2xl p-4 border-2 flex flex-col relative overflow-hidden"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.border,
            boxShadow: `0 8px 24px ${colors.glow}, inset 0 0 0 1px rgba(255,255,255,0.5)`,
            backfaceVisibility: 'hidden',
          }}
        >
          {card.rarity === 'legendary' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,214,10,0.2), transparent 40%, rgba(245,159,0,0.15) 70%, transparent)',
              }}
            />
          )}
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: `${colors.border}22`,
                  color: colors.border,
                }}
              >
                {CARD_CATEGORY_NAMES[card.category]}
              </span>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                style={{
                  backgroundColor: `${colors.border}22`,
                  color: colors.border,
                }}
              >
                <Sparkles size={10} />
                {CARD_RARITY_NAMES[card.rarity]}
              </span>
            </div>

            <div
              className="w-full aspect-square rounded-xl flex items-center justify-center mb-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                border: `1px dashed ${colors.border}66`,
              }}
            >
              <span style={{ fontSize: 72 }}>{card.imageEmoji}</span>
            </div>

            <div
              className="font-extrabold text-base mb-2 leading-tight"
              style={{ color: '#1B4332' }}
            >
              {card.title}
            </div>

            <div
              className="text-xs leading-relaxed flex-1"
              style={{ color: '#333', lineHeight: 1.6 }}
            >
              {card.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const ResultModal = memo(function ResultModal({ onClose }: ResultModalProps) {
  const { result, phase, resetGame, collectedCardIds, initializeGame, difficulty, seed } =
    useGameStore();
  const { setShowResult } = useUiStore();
  const navigate = useNavigate();
  const [showCards, setShowCards] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (phase === 'won' || phase === 'lost') {
      setShowResult(true);
      const t = setTimeout(() => setShowCards(true), 600);
      return () => clearTimeout(t);
    }
  }, [phase, setShowResult]);

  if (!result || (phase !== 'won' && phase !== 'lost')) return null;

  const isWon = phase === 'won';
  const awardedCards = result.awardedCards
    .map((id) => SCIENCE_CARDS.find((c) => c.id === id))
    .filter(Boolean) as ScienceCard[];

  const totalCards = SCIENCE_CARDS.length;
  const collectedCount = collectedCardIds.length;

  const handleClose = () => {
    setShowResult(false);
    onClose?.();
  };

  const handleNextRandom = () => {
    initializeGame(difficulty.id);
    setShowCards(false);
    setShowResult(false);
  };

  const handleReplay = () => {
    resetGame();
    setShowCards(false);
    setShowResult(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl relative"
        style={{
          background: isWon
            ? 'linear-gradient(135deg, #1B4332 0%, #40916C 50%, #95D5B2 100%)'
            : 'linear-gradient(135deg, #3D0000 0%, #950101 50%, #C1121F 100%)',
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 text-white transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center relative">
          <div
            className="text-7xl mb-2 transition-all duration-700"
            style={{
              transform: showCards ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-20deg)',
            }}
          >
            {isWon ? '🎉' : '💔'}
          </div>

          <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
            {isWon ? '迁徙圆满成功！' : '征途未竟...'}
          </h2>

          <p className="text-white/80 mb-6">
            {isWon
              ? '你成功引导鹤群穿越千山万水，抵达了温暖的越冬地！'
              : '鹤群在迁徙途中遭遇困难，再次规划廊道，帮助它们回家吧。'}
          </p>

          <div className="flex justify-center mb-6">
            <StarRating stars={result.stars} size={48} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7 max-w-3xl mx-auto">
            <div className="rounded-2xl p-3 bg-white/15 backdrop-blur text-white">
              <div className="text-xs text-white/70 mb-1">总存活</div>
              <div className="text-2xl font-extrabold">
                {result.totalSurvived}
                <span className="text-sm opacity-60">/{result.totalInitial}</span>
              </div>
            </div>
            <div className="rounded-2xl p-3 bg-white/15 backdrop-blur text-white">
              <div className="text-xs text-white/70 mb-1">存活率</div>
              <div className="text-2xl font-extrabold">
                {(result.survivalRate * 100).toFixed(0)}%
              </div>
            </div>
            <div className="rounded-2xl p-3 bg-white/15 backdrop-blur text-white">
              <div className="text-xs text-white/70 mb-1">总回合</div>
              <div className="text-2xl font-extrabold">{result.totalTurns}</div>
            </div>
            <div className="rounded-2xl p-3 bg-white/15 backdrop-blur text-white">
              <div className="text-xs text-white/70 mb-1">图鉴进度</div>
              <div className="text-2xl font-extrabold">
                {collectedCount}
                <span className="text-sm opacity-60">/{totalCards}</span>
              </div>
            </div>
          </div>

          {isWon && awardedCards.length > 0 && showCards && (
            <div className="mb-7">
              <div className="text-white font-bold mb-4 flex items-center justify-center gap-2">
                <Sparkles size={18} className="text-yellow-300" />
                获得科普卡片（{awardedCards.length}张）
                <Sparkles size={18} className="text-yellow-300" />
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {awardedCards.map((card, i) => (
                  <div
                    key={card.id}
                    className="flex flex-col items-center gap-2"
                  >
                    <CardReveal card={card} delay={i * 450} />
                    <button
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [card.id]: !e[card.id] }))
                      }
                      className="text-white/70 text-xs flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {expanded[card.id] ? '收起详情' : '展开完整知识'}
                      {expanded[card.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {expanded[card.id] && (
                      <div
                        className="w-[220px] rounded-xl p-3 text-left text-xs leading-relaxed"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.12)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        <div className="font-bold mb-1">💡 解锁条件:</div>
                        <div className="opacity-80">{card.unlockCondition}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleReplay}
              className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                color: isWon ? '#2D6A4F' : '#950101',
              }}
            >
              🔄 再玩一次（同种子）
            </button>
            <button
              onClick={handleNextRandom}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              🎲 换个地图
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              🏠 返回主菜单
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
