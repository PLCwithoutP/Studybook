import React, { useState, useMemo } from 'react';
import { AppSessionLog } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyCalendarProps {
  history: AppSessionLog[];
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ history }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start if desired, but default 0 is Sunday
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [currentDate]);

  const historyMap = useMemo(() => {
    const map: { [key: string]: number } = {};
    history.forEach(log => {
      const parts = log.duration.split(':').map(Number);
      const mins = parts.length === 3 ? parts[0] * 60 + parts[1] : parts[0];
      // Normalize date string to match JS Date string format or specific structure
      // The current history stores dates like "02 January 2024"
      map[log.date] = (map[log.date] || 0) + mins;
    });
    return map;
  }, [history]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold">{monthName}</h3>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><ChevronLeft /></button>
          <button onClick={() => changeMonth(1)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-sm font-bold text-white/40 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {daysInMonth.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-24" />;
          
          const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            .toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
          
          const focusMins = historyMap[dateString] || 0;
          const intensity = Math.min(1, focusMins / 300); // Max intensity at 5 hours

          return (
            <div key={day} className="h-24 bg-white/5 rounded-2xl p-2 relative group hover:bg-white/10 transition-colors border border-white/5">
              <span className="text-lg font-bold opacity-40">{day}</span>
              {focusMins > 0 && (
                <div 
                  className="absolute bottom-2 right-2 left-2 h-1.5 rounded-full bg-white transition-all shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ opacity: 0.2 + intensity * 0.8, width: `${Math.min(100, (focusMins/480)*100)}%` }}
                />
              )}
              {focusMins > 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm rounded-2xl text-xs font-bold">
                  {Math.floor(focusMins/60)}h {Math.round(focusMins%60)}m
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};