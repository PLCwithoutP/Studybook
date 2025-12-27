import React, { useMemo } from 'react';
import { Project } from '../types';
import { CheckCircle2, Archive, CalendarOff, Layers } from 'lucide-react';
import { isProjectFinished } from '../utils';

interface HistoryViewProps {
  projects: Project[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ projects }) => {
  const { standardFinished, dailyExpired } = useMemo(() => {
    const finished = projects.filter(p => isProjectFinished(p));
    return {
      standardFinished: finished.filter(p => !p.isDaily),
      dailyExpired: finished.filter(p => p.isDaily)
    };
  }, [projects]);

  const ProjectCard: React.FC<{ project: Project, icon: any, colorClass: string }> = ({ project, icon: Icon, colorClass }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-lg flex items-center gap-2">
           <Icon className={`w-5 h-5 ${colorClass}`} />
           {project.name}
        </h4>
        <span className="text-[10px] font-mono opacity-40">{new Date(project.createdAt).toLocaleDateString()}</span>
      </div>
      {project.description && <p className="text-sm text-white/60 line-clamp-2">{project.description}</p>}
      <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center text-xs opacity-50">
         <span>{project.subtasks.length} subtasks</span>
         {project.isDaily ? (
             <span>Ended: {project.recurrenceEndDate}</span>
         ) : (
             <span className="text-emerald-400">Completed</span>
         )}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-10 animate-fade-in">
      {/* Section 1: Completed Standard Projects */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-3 border-b border-white/10 pb-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" /> 
          Completed Projects
          <span className="text-xs font-normal opacity-40 ml-auto">{standardFinished.length} items</span>
        </h3>
        {standardFinished.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standardFinished.map(p => (
              <ProjectCard key={p.id} project={p} icon={Layers} colorClass="text-emerald-400" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/20 italic bg-white/5 rounded-2xl">
            No completed standard projects yet.
          </div>
        )}
      </div>

      {/* Section 2: Past Daily Projects */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-3 border-b border-white/10 pb-2">
          <Archive className="w-6 h-6 text-yellow-400" /> 
          Archived Daily Projects
          <span className="text-xs font-normal opacity-40 ml-auto">{dailyExpired.length} items</span>
        </h3>
        <p className="text-xs text-white/40 mb-4 -mt-2">Daily recurring projects that have passed their end date.</p>
        
        {dailyExpired.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyExpired.map(p => (
              <ProjectCard key={p.id} project={p} icon={CalendarOff} colorClass="text-yellow-400" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/20 italic bg-white/5 rounded-2xl">
            No expired daily projects.
          </div>
        )}
      </div>
    </div>
  );
};