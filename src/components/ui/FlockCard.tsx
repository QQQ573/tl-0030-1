import { memo } from 'react';
import type { Flock } from '@/types/game';
import type { FlockConfig } from '@/types/game';
import { FLOCK_CONFIGS, GRADE_LABELS, GRADE_COLORS } from '@/data/species';
import { useGameStore } from '@/store/gameStore';
import { checkFlockLossLimit } from '@/lib/gameLogic/terrainEffects';

interface FlockCardProps {
  flock: Flock;
}

export const FlockCard = memo(function FlockCard({ flock }: FlockCardProps) {
  const cfg: FlockConfig | undefined = FLOCK_CONFIGS[flock.configId];
  const { selectedFlockId, selectFlock } = useGameStore();
  if (!cfg) return null;

  const isSelected = selectedFlockId === flock.configId;
  const lossCheck = checkFlockLossLimit(flock, cfg);
  const lossCount = flock.initialCount - flock.count;
  const lossPercent = (lossCount / flock.initialCount) * 100;
  const limitPercent = cfg.maxLossRatio * 100;

  const gradeColor = GRADE_COLORS[cfg.grade];
  const lossRatio = (lossPercent / limitPercent) * 100;
  const isNearLimit = lossRatio > 70;
  const isOverLimit = lossRatio > 100;

  const staminaColor =
    flock.stamina > 60 ? '#40916C' : flock.stamina > 30 ? '#F77F00' : '#C1121F';

  const statusBadge = flock.hasArrived
    ? { text: '已抵达', bg: '#40916C' }
    : flock.isDead || isOverLimit
      ? { text: '失败', bg: '#C1121F' }
      : flock.stamina < 20
        ? { text: '体力低', bg: '#E63946' }
        : isNearLimit
          ? { text: '减员预警', bg: '#F77F00' }
          : { text: '飞行中', bg: '#219EBC' };

  const recentEvents = flock.events.slice(-2);

  return (
    <div
      onClick={() => selectFlock(isSelected ? null : flock.configId)}
      className="rounded-2xl p-4 cursor-pointer transition-all duration-200 border-2"
      style={{
        backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.92)',
        borderColor: isSelected ? cfg.color : 'rgba(0,0,0,0.06)',
        boxShadow: isSelected
          ? `0 0 0 3px ${cfg.color}33, 0 8px 24px rgba(0,0,0,0.12)`
          : '0 4px 12px rgba(0,0,0,0.06)',
        transform: isSelected ? 'translateY(-2px)' : undefined,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex items-center justify-center rounded-xl border-2 shadow-sm"
          style={{
            width: 52,
            height: 52,
            backgroundColor: `${cfg.color}1A`,
            borderColor: `${cfg.color}66`,
          }}
        >
          <span style={{ fontSize: 28 }}>{cfg.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate" style={{ color: '#1B4332' }}>
            {cfg.name}
          </div>
          <div
            className="text-xs px-2 py-0.5 rounded-full inline-block mt-0.5"
            style={{
              backgroundColor: `${gradeColor}15`,
              color: gradeColor,
              fontWeight: 600,
            }}
          >
            {GRADE_LABELS[cfg.grade]}
          </div>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-white text-xs font-bold"
          style={{ backgroundColor: statusBadge.bg }}
        >
          {statusBadge.text}
        </div>
      </div>

      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-600 font-medium">存活数量</span>
            <span
              className="font-bold"
              style={{ color: isNearLimit || isOverLimit ? '#C1121F' : '#1B4332' }}
            >
              {flock.count} / {flock.initialCount}
            </span>
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(flock.count / flock.initialCount) * 100}%`,
                backgroundColor: isOverLimit
                  ? '#C1121F'
                  : isNearLimit
                    ? '#F77F00'
                    : '#40916C',
              }}
            />
          </div>
          <div
            className="flex items-center justify-between text-[10px] mt-1"
            style={{ color: isNearLimit ? '#C1121F' : '#888' }}
          >
            <span>减员: {lossCount}只 ({lossPercent.toFixed(0)}%)</span>
            <span>上限 {limitPercent.toFixed(0)}%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-600 font-medium">体力值</span>
            <span className="font-bold" style={{ color: staminaColor }}>
              {Math.round(flock.stamina)} / 100
            </span>
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${flock.stamina}%`,
                backgroundColor: staminaColor,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">路径长度:</span>
          <span className="font-semibold" style={{ color: '#1D3557' }}>
            {flock.predictedPath.length - 1} 格
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">终点:</span>
          <span className="font-semibold" style={{ color: '#C1121F' }}>
            ({flock.winteringPos.x},{flock.winteringPos.y})
          </span>
        </div>

        {recentEvents.length > 0 && (
          <div className="pt-2 border-t border-gray-100 space-y-1">
            {recentEvents.map((e, i) => (
              <div
                key={i}
                className="text-[11px] px-2 py-1 rounded-lg truncate"
                style={{
                  backgroundColor:
                    e.type === 'city_damage'
                      ? 'rgba(193, 18, 31, 0.08)'
                      : e.type === 'wetland_heal'
                        ? 'rgba(64, 145, 108, 0.1)'
                        : e.type === 'conflict_wait'
                          ? 'rgba(247, 127, 0, 0.1)'
                          : 'rgba(0,0,0,0.04)',
                  color:
                    e.type === 'city_damage'
                      ? '#C1121F'
                      : e.type === 'wetland_heal'
                        ? '#40916C'
                        : '#555',
                }}
              >
                {e.type === 'city_damage' && '🏙️ '}
                {e.type === 'wetland_heal' && '🌊 '}
                {e.type === 'conflict_wait' && '⏸️ '}
                {e.type === 'rest_stop' && '🏕️ '}
                {e.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
