import { useDraggable } from '@dnd-kit/react';
import { CalendarDays, Edit3, FolderKanban, GripVertical, UserRound } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { formatDateOnly, isDateOverdue } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';
import { StatusBadge } from '../ui/StatusBadge';
import { KANBAN_TASK_TYPE, taskDragId } from './kanban-dnd';

interface KanbanTaskCardProps {
  task: Task;
  isUpdating: boolean;
  onEdit: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const priorityBorders = {
  LOW: 'border-l-slate-300',
  MEDIUM: 'border-l-blue-400',
  HIGH: 'border-l-rose-500',
};

export function KanbanTaskCard({ task, isUpdating, onEdit, onStatusChange }: KanbanTaskCardProps) {
  const overdue = task.status !== 'DONE' && task.dueDate ? isDateOverdue(task.dueDate) : false;
  const { ref, handleRef, isDragging } = useDraggable({
    id: taskDragId(task.id),
    type: KANBAN_TASK_TYPE,
    data: { taskId: task.id, title: task.title },
    disabled: isUpdating,
  });

  return (
    <article
      ref={ref}
      className={`rounded-xl border border-l-[3px] border-slate-200 bg-white p-4 shadow-sm transition-[box-shadow,opacity] hover:shadow-md ${priorityBorders[task.priority]} ${
        isDragging ? 'z-30 opacity-70 shadow-xl ring-2 ring-indigo-400/40' : ''
      } ${isUpdating ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <StatusBadge value={task.priority} />
        <div className="flex items-center gap-1">
          <button
            ref={handleRef}
            type="button"
            aria-label={`Arrastar tarefa ${task.title}`}
            title="Arraste para outra etapa ou use Enter e as setas"
            disabled={isUpdating}
            className="touch-none cursor-grab rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 active:cursor-grabbing disabled:cursor-wait disabled:opacity-40"
          >
            <GripVertical size={15} />
          </button>
          <button
            type="button"
            aria-label={`Editar ${task.title}`}
            title="Editar tarefa"
            disabled={isUpdating}
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-wait disabled:opacity-40"
          >
            <Edit3 size={14} />
          </button>
        </div>
      </div>

      <h3 className="mt-3 text-sm font-bold leading-5 text-slate-850">{task.title}</h3>
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-slate-500">
          {task.description}
        </p>
      )}

      <p className="mt-3 flex items-center gap-1.5 truncate text-[10px] font-semibold text-slate-400">
        <FolderKanban size={11} />
        {task.project.name}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          {task.assignee ? (
            <Avatar name={task.assignee.name} initials={task.assignee.avatar} size="sm" />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <UserRound size={12} />
            </span>
          )}
          <span className="truncate text-[10px] font-medium text-slate-500">
            {task.assignee?.name ?? 'Não atribuído'}
          </span>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 text-[10px] font-semibold ${overdue ? 'text-rose-600' : 'text-slate-400'}`}
        >
          <CalendarDays size={11} />
          {task.dueDate ? formatDateOnly(task.dueDate) : 'Sem prazo'}
        </span>
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Mover {task.title} para</span>
        <select
          value={task.status}
          disabled={isUpdating || isDragging}
          onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] font-semibold text-slate-600 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-wait disabled:opacity-50"
        >
          <option value="TODO">Mover para: A fazer</option>
          <option value="IN_PROGRESS">Mover para: Em andamento</option>
          <option value="DONE">Mover para: Concluída</option>
        </select>
      </label>
    </article>
  );
}
