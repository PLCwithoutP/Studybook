import React from 'react';
import { Project } from '../types';

interface GanttChartProps {
  projects: Project[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-white/40 border-2 border-dashed border-white/10 rounded-3xl">
        <p>No projects created yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12">
      {projects.map(project => (
        <div key={project.id} className="bg-white/5 rounded-3xl p-6 border border-white/10">
          <h4 className="text-xl font-bold mb-6 flex items-center justify-between">
            {project.name}
            <span className="text-sm font-mono opacity-40">Created: {new Date(project.createdAt).toLocaleDateString()}</span>
          </h4>
          
          <div className="space-y-4">
            {project.subtasks.map(task => {
              const progress = (task.completedSessions / task.targetSessions) * 100;
              const isCompleted = progress >= 100;
              
              return (
                <div key={task.id} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-400' : 'text-white/70'}`}>
                      {task.name}
                    </span>
                    <span className="text-xs font-mono opacity-50">
                      {task.completedSessions} / {task.targetSessions} Sessions
                    </span>
                  </div>
                  <div className="h-6 bg-black/30 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-1000 shadow-lg relative
                        ${isCompleted ? 'bg-emerald-500' : 'bg-white/60'}`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    >
                      {progress > 5 && (
                        <div className="absolute inset-0 flex items-center justify-end px-2 text-[10px] font-bold text-black/60">
                          {Math.round(progress)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {projects.length > 0 && (
         <div className="text-center text-white/30 text-sm mt-8 italic">
            Visualizing task completion status relative to target durations.
         </div>
      )}
    </div>
  );
};