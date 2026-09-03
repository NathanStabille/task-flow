import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Inbox,
  ListTodo,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { DeleteTaskDialog } from '../components/tasks/DeleteTaskDialog';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { TaskList } from '../components/tasks/TaskList';
import { useTasksPage } from '../hooks/use-tasks-page';
import { taskService } from '../services/tasks';
import type { Task, TaskInput, TaskPriority, TaskStatus, TaskUpdateInput } from '../types';

type StatusFilter = 'ALL' | TaskStatus;
type PriorityFilter = 'ALL' | TaskPriority;
type FormState = { mode: 'create' } | { mode: 'edit'; task: Task };

interface Notice {
  message: string;
  tone: 'success' | 'error';
}

function TasksSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-12 border-b border-slate-100 bg-slate-50" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex h-20 items-center gap-6 border-b border-slate-100 px-5 last:border-0"
        >
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-7 w-24 rounded-lg bg-slate-100" />
          <div className="h-7 w-20 rounded-lg bg-slate-100" />
          <div className="h-4 flex-1 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function TasksPage() {
  const { tasks, projects, users, isLoading, error, reload } = useTasksPage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [formState, setFormState] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return tasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        task.description.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        task.project.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'ALL' || task.projectId === Number(projectFilter);
      const matchesAssignee =
        assigneeFilter === 'ALL' ||
        (assigneeFilter === 'NONE'
          ? task.assigneeId === null
          : task.assigneeId === Number(assigneeFilter));

      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
    });
  }, [assigneeFilter, priorityFilter, projectFilter, search, statusFilter, tasks]);

  const counts = {
    todo: tasks.filter((task) => task.status === 'TODO').length,
    inProgress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    done: tasks.filter((task) => task.status === 'DONE').length,
  };

  const hasFilters =
    search !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    projectFilter !== 'ALL' ||
    assigneeFilter !== 'ALL';

  function clearFilters() {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setProjectFilter('ALL');
    setAssigneeFilter('ALL');
  }

  async function handleSave(data: TaskInput) {
    if (formState?.mode === 'edit') {
      await taskService.update(formState.task.id, data);
      setNotice({
        message: `Tarefa ${data.title} atualizada com sucesso.`,
        tone: 'success',
      });
    } else {
      await taskService.create(data);
      setNotice({
        message: `Tarefa ${data.title} criada com sucesso.`,
        tone: 'success',
      });
    }

    setFormState(null);
    reload();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const taskTitle = deleteTarget.title;
    await taskService.delete(deleteTarget.id);
    setDeleteTarget(null);
    setNotice({
      message: `Tarefa ${taskTitle} excluída com sucesso.`,
      tone: 'success',
    });
    reload();
  }

  async function handleQuickUpdate(task: Task, data: TaskUpdateInput) {
    setUpdatingTaskId(task.id);
    setNotice(null);

    try {
      await taskService.update(task.id, data);
      setNotice({
        message: `Tarefa ${task.title} atualizada.`,
        tone: 'success',
      });
      reload();
    } catch (updateError) {
      setNotice({
        message:
          updateError instanceof Error
            ? updateError.message
            : 'Não foi possível atualizar a tarefa.',
        tone: 'error',
      });
    } finally {
      setUpdatingTaskId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-indigo-600">Planejamento</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">
            Tarefas
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Acompanhe responsáveis, prioridades e prazos das entregas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormState({ mode: 'create' })}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
        >
          <Plus size={16} />
          Nova tarefa
        </button>
      </div>

      {notice && (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold ${
            notice.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {notice.tone === 'success' ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
          <span className="flex-1">{notice.message}</span>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => setNotice(null)}
            className="rounded-md p-1 hover:bg-black/5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card ${statusFilter === 'ALL' ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200/80 hover:border-slate-300'}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ListTodo size={17} />
          </span>
          <span>
            <span className="block text-lg font-black text-slate-900">{tasks.length}</span>
            <span className="block text-[11px] font-medium text-slate-500">Todas as tarefas</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('TODO')}
          className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card ${statusFilter === 'TODO' ? 'border-slate-400 ring-2 ring-slate-500/10' : 'border-slate-200/80 hover:border-slate-300'}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Inbox size={17} />
          </span>
          <span>
            <span className="block text-lg font-black text-slate-900">{counts.todo}</span>
            <span className="block text-[11px] font-medium text-slate-500">A fazer</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card ${statusFilter === 'IN_PROGRESS' ? 'border-amber-300 ring-2 ring-amber-500/10' : 'border-slate-200/80 hover:border-slate-300'}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock3 size={17} />
          </span>
          <span>
            <span className="block text-lg font-black text-slate-900">{counts.inProgress}</span>
            <span className="block text-[11px] font-medium text-slate-500">Em andamento</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('DONE')}
          className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card ${statusFilter === 'DONE' ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200/80 hover:border-slate-300'}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={17} />
          </span>
          <span>
            <span className="block text-lg font-black text-slate-900">{counts.done}</span>
            <span className="block text-[11px] font-medium text-slate-500">Concluídas</span>
          </span>
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card">
        <label className="relative block">
          <span className="sr-only">Buscar tarefas</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por tarefa, descrição ou projeto..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <select
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400"
          >
            <option value="ALL">Todos os status</option>
            <option value="TODO">A fazer</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="DONE">Concluídas</option>
          </select>
          <select
            aria-label="Filtrar por prioridade"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400"
          >
            <option value="ALL">Todas as prioridades</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
          </select>
          <select
            aria-label="Filtrar por projeto"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400"
          >
            <option value="ALL">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por responsável"
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400"
          >
            <option value="ALL">Todos os responsáveis</option>
            <option value="NONE">Sem responsável</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={13} /> Limpar filtros
          </button>
        </div>
      </div>

      {isLoading && <TasksSkeleton />}

      {error && !isLoading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
          <CircleAlert className="mx-auto text-rose-500" size={24} />
          <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !error && filteredTasks.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-400">
            {filteredTasks.length}{' '}
            {filteredTasks.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
          </p>
          <TaskList
            tasks={filteredTasks}
            updatingTaskId={updatingTaskId}
            onEdit={(task) => setFormState({ mode: 'edit', task })}
            onDelete={setDeleteTarget}
            onQuickUpdate={(task, data) => void handleQuickUpdate(task, data)}
          />
        </div>
      )}

      {!isLoading && !error && filteredTasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
          <ListTodo className="mx-auto text-slate-300" size={30} />
          <h3 className="mt-4 text-sm font-bold text-slate-800">Nenhuma tarefa encontrada</h3>
          <p className="mt-1.5 text-xs text-slate-500">
            {tasks.length === 0
              ? 'Adicione a primeira tarefa ao planejamento.'
              : 'Tente alterar a busca ou os filtros selecionados.'}
          </p>
          {tasks.length === 0 && projects.length > 0 && (
            <button
              type="button"
              onClick={() => setFormState({ mode: 'create' })}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white"
            >
              <Plus size={15} /> Criar tarefa
            </button>
          )}
        </div>
      )}

      {formState && (
        <TaskFormModal
          task={formState.mode === 'edit' ? formState.task : undefined}
          projects={projects}
          users={users}
          onClose={() => setFormState(null)}
          onSubmit={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteTaskDialog
          task={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
