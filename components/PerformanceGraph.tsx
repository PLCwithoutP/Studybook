import React, { useMemo, useState, useEffect } from 'react';
import { AppSessionLog } from '../types';

interface PerformanceGraphProps {
  data: AppSessionLog[];
  isMainView?: boolean;
}

interface ChartItem {
  dateLabel: string;
  dayLabel: string;
  dateObj: Date;
  minutes: number;
}

interface GroupedData {
  [monthKey: string]: ChartItem[];
}

export const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ data, isMainView = false }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const { groupedData, monthKeys, maxY, allTicks } = useMemo(() => {
    if (!data || data.length === 0) {
      return { groupedData: {}, monthKeys: [], maxY: 0, allTicks: [] };
    }

    const parseDurationToMinutes = (dur: string): number => {
      const parts = dur.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
      if (parts.length === 2) return parts[0] + parts[1] / 60;
      return 0;
    };

    const parseDate = (dateStr: string): Date => {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? new Date(0) : date;
    };

    const dailyAggregates: { [key: string]: { minutes: number, dateObj: Date } } = {};
    data.forEach(log => {
      const mins = parseDurationToMinutes(log.duration);
      if (dailyAggregates[log.date]) dailyAggregates[log.date].minutes += mins;
      else dailyAggregates[log.date] = { minutes: mins, dateObj: parseDate(log.date) };
    });

    const groups: GroupedData = {};
    let globalMaxMinutes = 10;

    Object.values(dailyAggregates).forEach(item => {
      if (isNaN(item.dateObj.getTime())) return;
      const monthKey = item.dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const dayNum = item.dateObj.getDate().toString().padStart(2, '0');
      const weekDay = item.dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dayLabel = `${dayNum}/${weekDay}`;
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push({
        dateLabel: item.dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        dayLabel: dayLabel,
        dateObj: item.dateObj,
        minutes: item.minutes
      });
      if (item.minutes > globalMaxMinutes) globalMaxMinutes = item.minutes;
    });

    Object.keys(groups).forEach(key => groups[key].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()));
    const sortedMonthKeys = Object.keys(groups).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    let step = globalMaxMinutes <= 60 ? 10 : (globalMaxMinutes <= 300 ? 60 : 120);
    const top = Math.ceil(globalMaxMinutes / step) * step;
    const ticks = [];
    for (let i = 0; i <= top; i += step) ticks.push(i);

    return { groupedData: groups, monthKeys: sortedMonthKeys, maxY: top, allTicks: ticks };
  }, [data]);

  useEffect(() => {
    if (monthKeys.length > 0 && (!activeTab || !monthKeys.includes(activeTab))) {
      setActiveTab(monthKeys[monthKeys.length - 1]);
    }
  }, [monthKeys, activeTab]);

  if (monthKeys.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-white/40 border-2 border-dashed border-white/10 rounded-3xl">
        <p className="text-xl">No performance data available.</p>
        <p className="text-sm mt-2">Export and re-import to sync your session history.</p>
      </div>
    );
  }

  const formatTick = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return h > 0 ? `${h}h${m > 0 ? m + 'm' : ''}` : `${m}m`;
  };

  const chartData = activeTab ? groupedData[activeTab] : [];
  const chartHeight = isMainView ? 400 : 250;

  return (
    <div className="w-full text-white">
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 border-b border-white/10 scrollbar-thin">
        {monthKeys.map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-3 text-lg font-medium rounded-t-xl transition-all whitespace-nowrap
              ${activeTab === key ? 'bg-white/20 text-white border-b-4 border-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex flex-col justify-between items-end text-sm text-white/40 font-mono w-16 flex-shrink-0 select-none" style={{ height: chartHeight }}>
          {allTicks.slice().reverse().map((tick) => (
            <div key={tick} className="transform translate-y-2">{formatTick(tick)}</div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[600px] relative" style={{ height: chartHeight }}> 
            <div className="absolute inset-0 pointer-events-none">
              {allTicks.map((tick) => (
                <div key={tick} className="absolute w-full border-t border-white/5" style={{ bottom: `${(tick / maxY) * 100}%` }} />
              ))}
            </div>

            <div className="absolute inset-0 flex items-end justify-around px-4 z-10">
              {chartData.map((item, index) => {
                const height = (item.minutes / maxY) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group relative mx-2 h-full justify-end">
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-20 pointer-events-none shadow-xl border border-white/10">
                      <div className="font-bold">{formatTick(item.minutes)}</div>
                      <div className="text-[10px] text-white/50">{item.dateLabel}</div>
                    </div>
                    <div 
                      style={{ height: `${Math.max(height, 2)}%` }} 
                      className="w-full bg-white/80 rounded-t-lg hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] max-w-[50px]"
                    ></div>
                    <div className="absolute top-[calc(100%+8px)] text-[11px] text-white/60 font-mono rotate-45 origin-left whitespace-nowrap">
                      {item.dayLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20 text-center text-lg text-white/40">Daily Focus Intensity</div>
    </div>
  );
};