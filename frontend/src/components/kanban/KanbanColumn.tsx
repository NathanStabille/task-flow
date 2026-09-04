import { useDroppable } from '@dnd-kit/react';
import type { LucideIcon } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { KanbanTaskCard } from './KanbanTaskCard';
import { columnDropId, KANBAN_TASK_TYPE } from './kanban-dnd';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  description: string;
  icon: LucideIcon;
  iconStyle: string;
  dotStyle: string;
  tasks: Task[];
  updatingTaskIds: ReadonlySet<number>;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

export function KanbanColumn({
  status,
  title,
  description,
  icon: Icon,
  iconStyle,
  dotStyle,
  tasks,
  updatingTaskIds,
  onEdit,
  onStatusChange,
}: KanbanColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: columnDropId(status),
    accept: KANBAN_TASK_TYPE,
    data: { status },
  });

  return (
    <section
      ref={ref}
      aria-label={`${title}: ${tasks.length} ${tasks.length === 1 ? 'tarefa' : 'tarefas'}`}
      className={`flex min-h-80 flex-col rounded-2xl border p-3 transition-[border-color,background-color,box-shadow] ${
        isDropTarget
          ? 'border-indigo-400 bg-indigo-50/80 shadow-lg shadow-indigo-100 ring-2 ring-indigo-500/10'
          : 'border-slate-200/80 bg-slate-100/60'
      }`}
    >
      <div className="flex items-center gap-3 px-1 pb-3 pt-1">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconStyle}`}>
          <Icon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dotStyle}`} />
            <h2 className="text-xs font-bold text-slate-800">{title}</h2>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">{description}</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="grid min-h-40 flex-1 place-items-center rounded-xl border border-dashed border-slate-300 bg-white/50 px-5 text-center">
          <div>
            <Icon className="mx-auto text-slate-300" size={20} />
            <p className="mt-2 text-[11px] font-medium text-slate-400">
              Nenhuma tarefa nesta etapa.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              isUpdating={updatingTaskIds.has(task.id)}
              onEdit={() => onEdit(task)}
              onStatusChange={(status) => onStatusChange(task, status)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
