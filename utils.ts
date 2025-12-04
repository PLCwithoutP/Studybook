
export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const getIstanbulDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const calculateProjectStats = (subtasks: any[]) => {
  let totalSessions = 0;
  let completedSessions = 0;

  subtasks.forEach((t) => {
    totalSessions += t.targetSessions;
    completedSessions += t.completedSessions;
  });

  const timeSpentSeconds = completedSessions * 25 * 60;
  const timeRemainingSeconds = Math.max(0, totalSessions - completedSessions) * 25 * 60;

  return {
    totalSessions,
    completedSessions,
    timeSpent: formatTime(timeSpentSeconds),
    timeRemaining: formatTime(timeRemainingSeconds),
  };
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`;
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
