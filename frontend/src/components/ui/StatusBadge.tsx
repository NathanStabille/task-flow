import type { ProjectStatus, TaskPriority, TaskStatus } from '../../types';

const labels: Record<ProjectStatus | TaskStatus | TaskPriority, string> = {
  ACTIVE: 'Ativo',
  COMPLETED: 'Concluído',
  ARCHIVED: 'Arquivado',
  TODO: 'A fazer',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluída',
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

const styles: Record<ProjectStatus | TaskStatus | TaskPriority, string> = {
  ACTIVE: 'bg-blue-50 text-blue-700 ring-blue-600/10',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  ARCHIVED: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  TODO: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  DONE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  LOW: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  MEDIUM: 'bg-blue-50 text-blue-700 ring-blue-600/10',
  HIGH: 'bg-rose-50 text-rose-700 ring-rose-600/10',
};

interface StatusBadgeProps {
  value: ProjectStatus | TaskStatus | TaskPriority;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${styles[value]}`}
    >
      {labels[value]}
    </span>
  );
}

