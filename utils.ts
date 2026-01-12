
import { Project, AppSessionLog } from './types';

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

// Standardized date string for Logs (matches 'en-GB' format used in App)
export const getLogDateString = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const calculateProjectStats = (subtasks: any[]) => {
  let totalSessions = 0;
  let completedSessions = 0;

  subtasks.forEach((t: any) => {
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

// Helper to count sessions from history for a specific project on a specific date string
export const getDailyProjectCompletion = (projectId: string, dateStr: string, history: AppSessionLog[]) => {
  const logs = history.filter((log) => log.projectId === projectId && log.date === dateStr);
  return logs.length;
};

// Get completed sessions for a specific subtask on a specific date (defaults to Today)
export const getSubtaskCompletionToday = (subtaskId: string, history: AppSessionLog[], dateStr: string = getLogDateString()): number => {
  return history.filter(log => log.subtaskId === subtaskId && log.date === dateStr).length;
};

// Check if a Daily project is "Done" for the current day
export const isDailyProjectDoneToday = (project: Project, history: AppSessionLog[]): boolean => {
  if (!project.isDaily) return false;
  const todayStr = getLogDateString();
  
  // A daily project is done if all its subtasks have met their daily target
  return project.subtasks.every(task => {
    const doneToday = getSubtaskCompletionToday(task.id, history, todayStr);
    return doneToday >= task.targetSessions;
  });
};

export const isProjectFinished = (project: Project): boolean => {
  if (project.isDaily) {
    if (!project.recurrenceEndDate) return false; // Indefinite daily projects are never "finished"
    const end = new Date(project.recurrenceEndDate);
    end.setHours(23, 59, 59, 999); // End of that day
    const today = new Date();
    return end < today;
  } else {
    // Standard project: finished if has subtasks and all are completed
    if (project.subtasks.length === 0) return false;
    return project.subtasks.every(t => t.completedSessions >= t.targetSessions);
  }
};

export const getEstimatedFinishDate = (project: Project, dailyTarget: number): Date | null => {
  if (project.isDaily) {
    return project.recurrenceEndDate ? new Date(project.recurrenceEndDate) : null;
  }
  
  const totalSessions = project.subtasks.reduce((sum, t) => sum + t.targetSessions, 0);
  if (totalSessions === 0) return null;
  
  // Basic estimation: Total Sessions / Daily Target (defaulting to 1 to avoid infinity)
  const daysRequired = Math.ceil(totalSessions / (dailyTarget || 1));
  
  const startDate = new Date(project.createdAt);
  const finishDate = new Date(startDate);
  finishDate.setDate(startDate.getDate() + daysRequired);
  // Set to end of that day for comparison
  finishDate.setHours(23, 59, 59, 999);
  
  return finishDate;
};
