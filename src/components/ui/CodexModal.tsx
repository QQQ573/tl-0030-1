import { memo, useState, useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import { X, Search, Sparkles, Filter } from 'lucide-react';
import { SCIENCE_CARDS, CARD_CATEGORY_NAMES, CARD_RARITY_COLORS, CARD_RARITY_NAMES } from '@/data/scienceCards';
import { useGameStore } from '@/store/gameStore';
import type { ScienceCard, CardCategory, CardRarity } from '@/types/game';

const CardView = memo(function CardView({
  card,
  collected,
}: {
  card: ScienceCard;
  collected: boolean;
}) {
  const colors = CARD_RARITY_COLORS[card.rarity];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl p-4 border-2 flex flex-col relative overflow-hidden transition-all duration-300 cursor-pointer h-full"
      style={{
        backgroundColor: collected ? colors.bg : 'rgba(0,0,0,0.04)',
        borderColor: collected ? colors.border : 'rgba(0,0,0,0.08)',
        boxShadow: collected
          ? `0 6px 18px ${hovered ? colors.glow : 'rgba(0,0,0,0.08)'}`
          : 'none',
        filter: collected ? 'none' : 'grayscale(0.85) opacity(0.6)',
        transform: hovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!collected && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{ fontSize: 56, opacity: 0.4 }}
        >
          🔒
        </div>
      )}

      {card.rarity === 'legendary' && collected && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity"
          style={{
            opacity: hovered ? 1 : 0.5,
            background:
              'linear-gradient(135deg, rgba(255,214,10,0.2), transparent 40%, rgba(245,159,0,0.15) 70%, transparent)',
          }}
        />
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{
              backgroundColor: collected ? `${colors.border}22` : 'rgba(0,0,0,0.06)',
              color: collected ? colors.border : '#666',
            }}
          >
            {CARD_CATEGORY_NAMES[card.category]}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
            style={{
              backgroundColor: collected ? `${colors.border}22` : 'rgba(0,0,0,0.06)',
              color: collected ? colors.border : '#666',
            }}
          >
            {collected && <Sparkles size={10} />}
            {CARD_RARITY_NAMES[card.rarity]}
          </span>
        </div>

        <div
          className="w-full aspect-square rounded-xl flex items-center justify-center mb-2"
          style={{
            backgroundColor: collected ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.04)',
            border: `1px dashed ${collected ? colors.border + '88' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <span style={{ fontSize: 48 }}>{collected ? card.imageEmoji : '❓'}</span>
        </div>

        <div
          className="font-extrabold text-sm mb-1 leading-tight"
          style={{ color: collected ? '#1B4332' : '#555' }}
        >
          {collected ? card.title : '??? 未解锁'}
        </div>

        <div
          className="text-[11px] leading-relaxed flex-1"
          style={{ color: collected ? '#444' : '#888', lineHeight: 1.55 }}
        >
          {collected ? card.content : '完成条件解锁此卡片...'}
        </div>

        {!collected && (
          <div
            className="mt-2 pt-2 text-[10px] border-t"
            style={{ borderColor: 'rgba(0,0,0,0.06)', color: '#777' }}
          >
            <strong>解锁条件:</strong> {card.unlockCondition}
          </div>
        )}
      </div>
    </div>
  );
});

export const CodexModal = memo(function CodexModal() {
  const { showCodex, setShowCodex, codexCategory, setCodexCategory } = useUiStore();
  const { collectedCardIds } = useGameStore();
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'all' | CardRarity>('all');

  useEffect(() => {
    if (!showCodex) {
      setSearch('');
    }
  }, [showCodex]);

  if (!showCodex) return null;

  const categories: ('all' | CardCategory)[] = ['all', 'species', 'habitat', 'migration', 'threat'];
  const rarities: ('all' | CardRarity)[] = ['all', 'common', 'rare', 'legendary'];

  let filtered = SCIENCE_CARDS;

  if (codexCategory !== 'all') {
    filtered = filtered.filter((c) => c.category === codexCategory);
  }
  if (rarityFilter !== 'all') {
    filtered = filtered.filter((c) => c.rarity === rarityFilter);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        CARD_CATEGORY_NAMES[c.category].toLowerCase().includes(q)
    );
  }

  const collectedCount = collectedCardIds.length;
  const total = SCIENCE_CARDS.length;
  const progress = (collectedCount / total) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={() => setShowCodex(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
        style={{ backgroundColor: '#FFFBF5' }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 36 }}>📖</span>
            <div>
              <h2 className="text-white text-xl font-extrabold">黑颈鹤科普图鉴</h2>
              <div className="text-white/75 text-xs">
                已收集 {collectedCount} / {total} 张卡片
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48">
              <div className="h-2 rounded-full overflow-hidden bg-white/20">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #FFD60A, #FB8500)',
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => setShowCodex(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索卡片标题或内容..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border outline-none transition-all"
              style={{
                borderColor: 'rgba(45,106,79,0.2)',
                backgroundColor: '#F8F9FA',
              }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCodexCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  backgroundColor:
                    codexCategory === cat ? '#2D6A4F' : 'rgba(45,106,79,0.08)',
                  color: codexCategory === cat ? '#fff' : '#2D6A4F',
                }}
              >
                {cat === 'all' ? '全部' : CARD_CATEGORY_NAMES[cat]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-500" />
            {rarities.map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  backgroundColor:
                    rarityFilter === r
                      ? r === 'all'
                        ? '#1D3557'
                        : CARD_RARITY_COLORS[r].border
                      : 'rgba(0,0,0,0.05)',
                  color: rarityFilter === r ? '#fff' : '#555',
                }}
              >
                {r === 'all' ? '全部稀有度' : CARD_RARITY_NAMES[r]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div style={{ fontSize: 60 }} className="mb-3">
                🔍
              </div>
              <div>没有找到匹配的卡片</div>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
              {filtered.map((card) => (
                <CardView
                  key={card.id}
                  card={card}
                  collected={collectedCardIds.includes(card.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
