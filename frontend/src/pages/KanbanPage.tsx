import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  Clock3,
  Columns3,
  List,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { statusFromDropId, taskIdFromDragId } from '../components/kanban/kanban-dnd';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { useTasksPage } from '../hooks/use-tasks-page';
import { taskService } from '../services/tasks';
import type { Task, TaskInput, TaskStatus } from '../types';

type FormState = { mode: 'create' } | { mode: 'edit'; task: Task };

const columns = [
  {
    status: 'TODO',
    title: 'A fazer',
    description: 'Tarefas aguardando início',
    icon: Circle,
    iconStyle: 'bg-slate-200 text-slate-600',
    dotStyle: 'bg-slate-400',
  },
  {
    status: 'IN_PROGRESS',
    title: 'Em andamento',
    description: 'Trabalho em execução',
    icon: Clock3,
    iconStyle: 'bg-amber-100 text-amber-700',
    dotStyle: 'bg-amber-400',
  },
  {
    status: 'DONE',
    title: 'Concluídas',
    description: 'Entregas finalizadas',
    icon: CheckCircle2,
    iconStyle: 'bg-emerald-100 text-emerald-700',
    dotStyle: 'bg-emerald-500',
  },
] satisfies Array<{
  status: TaskStatus;
  title: string;
  description: string;
  icon: typeof Circle;
  iconStyle: string;
  dotStyle: string;
}>;

interface Notice {
  message: string;
  tone: 'success' | 'error';
}

function KanbanSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, columnIndex) => (
        <div key={columnIndex} className="min-h-96 rounded-2xl bg-slate-100 p-3">
          <div className="mb-4 h-8 w-36 rounded-lg bg-slate-200" />
          <div className="space-y-3">
            {Array.from({ length: columnIndex === 2 ? 1 : 2 }).map((_, cardIndex) => (
              <div key={cardIndex} className="h-48 rounded-xl bg-white" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function KanbanPage() {
  const { tasks, projects, users, isLoading, error, reload, replaceTask } = useTasksPage();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [formState, setFormState] = useState<FormState | null>(null);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<number>>(() => new Set());
  const [notice, setNotice] = useState<Notice | null>(null);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return tasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        task.project.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch);
      const matchesProject = projectFilter === 'ALL' || task.projectId === Number(projectFilter);
      const matchesAssignee =
        assigneeFilter === 'ALL' ||
        (assigneeFilter === 'NONE'
          ? task.assigneeId === null
          : task.assigneeId === Number(assigneeFilter));

      return matchesSearch && matchesProject && matchesAssignee;
    });
  }, [assigneeFilter, projectFilter, search, tasks]);

  const hasFilters = search !== '' || projectFilter !== 'ALL' || assigneeFilter !== 'ALL';

  async function handleSave(data: TaskInput) {
    if (formState?.mode === 'edit') {
      await taskService.update(formState.task.id, data);
      setNotice({ message: `Tarefa ${data.title} atualizada.`, tone: 'success' });
    } else {
      await taskService.create(data);
      setNotice({ message: `Tarefa ${data.title} adicionada ao quadro.`, tone: 'success' });
    }

    setFormState(null);
    reload();
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    if (task.status === status || updatingTaskIds.has(task.id)) return;

    setUpdatingTaskIds((current) => new Set(current).add(task.id));
    setNotice(null);
    replaceTask({ ...task, status });

    try {
      const updatedTask = await taskService.update(task.id, { status });
      replaceTask(updatedTask);
      setNotice({ message: `Tarefa ${task.title} movida com sucesso.`, tone: 'success' });
    } catch (updateError) {
      replaceTask(task);
      setNotice({
        message:
          updateError instanceof Error ? updateError.message : 'Não foi possível mover a tarefa.',
        tone: 'error',
      });
    } finally {
      setUpdatingTaskIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return;

    const source = event.operation.source;
    const target = event.operation.target;
    if (!source || !target) return;

    const taskId = taskIdFromDragId(source.id);
    const status = statusFromDropId(target.id);
    if (!taskId || !status) return;

    const task = tasks.find((candidate) => candidate.id === taskId);
    if (task) void handleStatusChange(task, status);
  }

  function clearFilters() {
    setSearch('');
    setProjectFilter('ALL');
    setAssigneeFilter('ALL');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-indigo-600">Fluxo de trabalho</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">
            Quadro Kanban
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Arraste as tarefas entre as etapas ou use o seletor de status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/tarefas"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <List size={15} />
            Ver lista
          </Link>
          <button
            type="button"
            onClick={() => setFormState({ mode: 'create' })}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700"
          >
            <Plus size={16} />
            Nova tarefa
          </button>
        </div>
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

      <div className="grid gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card sm:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_220px_220px_auto]">
        <label className="relative sm:col-span-2 xl:col-span-1">
          <span className="sr-only">Buscar no Kanban</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar tarefa ou projeto..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </label>
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
          <RotateCcw size={13} /> Limpar
        </button>
      </div>

      {isLoading && <KanbanSkeleton />}

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

      {!isLoading && !error && (
        <>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Columns3 size={14} />
              {filteredTasks.length}{' '}
              {filteredTasks.length === 1 ? 'tarefa visível' : 'tarefas visíveis'}
            </p>
          </div>
          <p className="sr-only">
            Para mover pelo teclado, focalize o botão de arrastar, pressione Enter, use as setas
            para escolher uma coluna e pressione Enter novamente.
          </p>
          <DragDropProvider onDragEnd={handleDragEnd}>
            <div className="grid items-start gap-4 lg:grid-cols-3">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.status}
                  {...column}
                  tasks={filteredTasks.filter((task) => task.status === column.status)}
                  updatingTaskIds={updatingTaskIds}
                  onEdit={(task) => setFormState({ mode: 'edit', task })}
                  onStatusChange={(task, status) => void handleStatusChange(task, status)}
                />
              ))}
            </div>
          </DragDropProvider>
        </>
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
    </div>
  );
}
