import { CalendarDays, Edit3, FolderKanban, Trash2, UserRound } from 'lucide-react';
import type { Task, TaskPriority, TaskStatus, TaskUpdateInput } from '../../types';
import { formatDateOnly, isDateOverdue } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';

interface TaskListProps {
  tasks: Task[];
  updatingTaskId: number | null;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onQuickUpdate: (task: Task, data: TaskUpdateInput) => void;
}

const statusStyles: Record<TaskStatus, string> = {
  TODO: 'border-slate-200 bg-slate-50 text-slate-600',
  IN_PROGRESS: 'border-amber-200 bg-amber-50 text-amber-700',
  DONE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const priorityStyles: Record<TaskPriority, string> = {
  LOW: 'border-slate-200 bg-white text-slate-500',
  MEDIUM: 'border-blue-200 bg-blue-50 text-blue-700',
  HIGH: 'border-rose-200 bg-rose-50 text-rose-700',
};

function isOverdue(task: Task) {
  return task.status !== 'DONE' && task.dueDate ? isDateOverdue(task.dueDate) : false;
}

function StatusSelect({
  task,
  disabled,
  onChange,
}: {
  task: Task;
  disabled: boolean;
  onChange: (status: TaskStatus) => void;
}) {
  return (
    <select
      aria-label={`Alterar status de ${task.title}`}
      value={task.status}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as TaskStatus)}
      className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 ${statusStyles[task.status]}`}
    >
      <option value="TODO">A fazer</option>
      <option value="IN_PROGRESS">Em andamento</option>
      <option value="DONE">Concluída</option>
    </select>
  );
}

function PrioritySelect({
  task,
  disabled,
  onChange,
}: {
  task: Task;
  disabled: boolean;
  onChange: (priority: TaskPriority) => void;
}) {
  return (
    <select
      aria-label={`Alterar prioridade de ${task.title}`}
      value={task.priority}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as TaskPriority)}
      className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 ${priorityStyles[task.priority]}`}
    >
      <option value="LOW">Baixa</option>
      <option value="MEDIUM">Média</option>
      <option value="HIGH">Alta</option>
    </select>
  );
}

export function TaskList({
  tasks,
  updatingTaskId,
  onEdit,
  onDelete,
  onQuickUpdate,
}: TaskListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              <th className="px-5 py-3.5">Tarefa</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Prioridade</th>
              <th className="px-4 py-3.5">Responsável</th>
              <th className="px-4 py-3.5">Prazo</th>
              <th className="w-24 px-4 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isUpdating = updatingTaskId === task.id;
              return (
                <tr key={task.id} className="group transition-colors hover:bg-slate-50/70">
                  <td className="max-w-sm px-5 py-4">
                    <p className="truncate text-xs font-bold text-slate-850">{task.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-[10px] font-medium text-slate-400">
                      <FolderKanban size={11} /> {task.project.name}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusSelect
                      task={task}
                      disabled={isUpdating}
                      onChange={(status) => onQuickUpdate(task, { status })}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <PrioritySelect
                      task={task}
                      disabled={isUpdating}
                      onChange={(priority) => onQuickUpdate(task, { priority })}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {task.assignee ? (
                        <Avatar
                          name={task.assignee.name}
                          initials={task.assignee.avatar}
                          size="sm"
                        />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <UserRound size={12} />
                        </span>
                      )}
                      <span className="max-w-28 truncate text-[11px] font-medium text-slate-600">
                        {task.assignee?.name ?? 'Não atribuído'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`flex items-center gap-1.5 text-[11px] font-medium ${isOverdue(task) ? 'text-rose-600' : 'text-slate-500'}`}
                    >
                      <CalendarDays size={13} />
                      {task.dueDate ? formatDateOnly(task.dueDate) : 'Sem prazo'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                      <button
                        type="button"
                        title="Editar tarefa"
                        aria-label={`Editar ${task.title}`}
                        onClick={() => onEdit(task)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        title="Excluir tarefa"
                        aria-label={`Excluir ${task.title}`}
                        onClick={() => onDelete(task)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {tasks.map((task) => {
          const isUpdating = updatingTaskId === task.id;
          return (
            <article
              key={task.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-850">{task.title}</h3>
                  <p className="mt-1.5 flex items-center gap-1.5 truncate text-[10px] font-medium text-slate-400">
                    <FolderKanban size={11} /> {task.project.name}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label={`Editar ${task.title}`}
                    onClick={() => onEdit(task)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir ${task.title}`}
                    onClick={() => onDelete(task)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                {task.description || 'Tarefa sem descrição.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusSelect
                  task={task}
                  disabled={isUpdating}
                  onChange={(status) => onQuickUpdate(task, { status })}
                />
                <PrioritySelect
                  task={task}
                  disabled={isUpdating}
                  onChange={(priority) => onQuickUpdate(task, { priority })}
                />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-400">
                <span className="flex min-w-0 items-center gap-1.5">
                  {task.assignee ? (
                    <Avatar name={task.assignee.name} initials={task.assignee.avatar} size="sm" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                      <UserRound size={12} />
                    </span>
                  )}
                  <span className="truncate">{task.assignee?.name ?? 'Não atribuído'}</span>
                </span>
                <span
                  className={`flex items-center gap-1.5 ${isOverdue(task) ? 'text-rose-600' : ''}`}
                >
                  <CalendarDays size={12} />
                  {task.dueDate ? formatDateOnly(task.dueDate) : 'Sem prazo'}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
