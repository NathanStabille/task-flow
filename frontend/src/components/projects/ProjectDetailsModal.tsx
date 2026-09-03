import { CalendarDays, CheckCircle2, Edit3, FolderKanban, ListTodo, UserRound } from 'lucide-react';
import { useProjectDetails } from '../../hooks/use-project-details';
import type { Project } from '../../types';
import { formatDateOnly, formatShortDate } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/StatusBadge';

interface ProjectDetailsModalProps {
  projectId: number;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

export function ProjectDetailsModal({ projectId, onClose, onEdit }: ProjectDetailsModalProps) {
  const { project, isLoading, error } = useProjectDetails(projectId);
  const completedTasks = project?.tasks.filter((task) => task.status === 'DONE').length ?? 0;
  const progress = project?.tasks.length
    ? Math.round((completedTasks / project.tasks.length) * 100)
    : 0;

  return (
    <Modal
      title="Detalhes do projeto"
      description="Informações gerais e tarefas vinculadas."
      onClose={onClose}
      size="lg"
    >
      <div className="max-h-[calc(92vh-76px)] overflow-y-auto">
        {isLoading && (
          <div className="animate-pulse space-y-5 p-6">
            <div className="h-7 w-2/3 rounded bg-slate-200" />
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-40 rounded-xl bg-slate-100" />
          </div>
        )}

        {error && !isLoading && (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Fechar
            </button>
          </div>
        )}

        {project && !isLoading && (
          <>
            <div className="px-5 py-5 sm:px-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex min-w-0 gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FolderKanban size={20} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-black tracking-tight text-slate-950">
                        {project.name}
                      </h3>
                      <StatusBadge value={project.status} />
                    </div>
                    <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                      {project.description || 'Projeto sem descrição.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(project)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <ListTodo size={12} /> Total de tarefas
                  </p>
                  <p className="mt-1.5 text-lg font-black text-slate-900">{project.tasks.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <CheckCircle2 size={12} /> Concluídas
                  </p>
                  <p className="mt-1.5 text-lg font-black text-slate-900">{completedTasks}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <CalendarDays size={12} /> Criado em
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-slate-900">
                    {formatShortDate(project.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500">Progresso das tarefas</span>
                  <span className="font-bold text-slate-700">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
              <h4 className="text-xs font-bold text-slate-800">Tarefas do projeto</h4>
              {project.tasks.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white py-8 text-center">
                  <ListTodo className="mx-auto text-slate-300" size={22} />
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Nenhuma tarefa vinculada.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  {project.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200/80 bg-white px-4 py-3.5"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800">{task.title}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge value={task.status} />
                            <StatusBadge value={task.priority} />
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-4 text-[10px] font-medium text-slate-400">
                          <span className="flex items-center gap-1.5">
                            {task.assignee ? (
                              <Avatar
                                name={task.assignee.name}
                                initials={task.assignee.avatar}
                                size="sm"
                              />
                            ) : (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                                <UserRound size={12} />
                              </span>
                            )}
                            {task.assignee?.name ?? 'Sem responsável'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={12} />
                            {task.dueDate ? formatDateOnly(task.dueDate) : 'Sem prazo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
