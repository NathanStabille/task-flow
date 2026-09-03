import { ArrowUpRight, CalendarDays, Edit3, FolderKanban, ListTodo, Trash2 } from 'lucide-react';
import type { Project } from '../../types';
import { formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../ui/StatusBadge';

interface ProjectCardProps {
  project: Project;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const themes = [
  { icon: 'bg-indigo-50 text-indigo-600', accent: 'bg-indigo-500' },
  { icon: 'bg-cyan-50 text-cyan-600', accent: 'bg-cyan-500' },
  { icon: 'bg-amber-50 text-amber-600', accent: 'bg-amber-500' },
  { icon: 'bg-rose-50 text-rose-600', accent: 'bg-rose-500' },
];

export function ProjectCard({ project, index, onView, onEdit, onDelete }: ProjectCardProps) {
  const theme = themes[index % themes.length];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50">
      <span className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.icon}`}>
            <FolderKanban size={19} />
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={`Editar ${project.name}`}
              title="Editar projeto"
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-400 opacity-70 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              aria-label={`Excluir ${project.name}`}
              title="Excluir projeto"
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-400 opacity-70 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold text-slate-900">{project.name}</h3>
            <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
              {project.description || 'Projeto sem descrição.'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <StatusBadge value={project.status} />
        </div>

        <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-[11px] font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <ListTodo size={13} />
            {project._count.tasks} {project._count.tasks === 1 ? 'tarefa' : 'tarefas'}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} />
            Atualizado {formatShortDate(project.updatedAt)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onView}
        className="flex w-full items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-700"
      >
        Ver detalhes
        <ArrowUpRight size={15} />
      </button>
    </article>
  );
}
