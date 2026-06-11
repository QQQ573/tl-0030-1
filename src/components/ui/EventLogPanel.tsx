import { memo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { X } from 'lucide-react';

export const EventLogPanel = memo(function EventLogPanel() {
  const { eventLog } = useGameStore();
  const { showEventLog, setShowEventLog } = useUiStore();

  if (!showEventLog) return null;

  return (
    <div
      className="w-full rounded-2xl p-4 shadow-md"
      style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-sm" style={{ color: '#1B4332' }}>
          📜 事件日志
        </div>
        <button
          onClick={() => setShowEventLog(false)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"
        >
          <X size={14} />
        </button>
      </div>
      <div
        className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1 font-mono"
        style={{ color: '#555' }}
      >
        {eventLog.length === 0 ? (
          <div className="text-gray-400 py-4 text-center">暂无事件</div>
        ) : (
          [...eventLog].reverse().map((log, i) => (
            <div
              key={i}
              className="px-2 py-1 rounded-lg"
              style={{
                backgroundColor:
                  log.includes('城市') || log.includes('-') && log.includes('只')
                    ? 'rgba(193,18,31,0.06)'
                    : log.includes('湿地') || log.includes('恢复')
                      ? 'rgba(64,145,108,0.08)'
                      : log.includes('抵达')
                        ? 'rgba(64,145,108,0.12)'
                        : 'rgba(0,0,0,0.03)',
              }}
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
});
