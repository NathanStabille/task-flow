import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CircleDot,
  Clock3,
  FolderKanban,
  ListChecks,
  RefreshCw,
  TrendingUp,
  UserRoundCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDashboard } from '../hooks/use-dashboard';
import type { Activity, Project, Task, TaskStatus } from '../types';
import { formatRelativeTime, formatToday } from '../utils/formatters';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Carregando dashboard">
      <div className="space-y-3">
        <div className="h-3 w-40 rounded bg-slate-200" />
        <div className="h-8 w-72 rounded-lg bg-slate-200" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-36 rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
        <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <CircleAlert size={24} />
        </span>
        <h2 className="mt-5 text-lg font-bold text-slate-900">Não foi possível carregar os dados</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <RefreshCw size={15} />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

function RecentProjects({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const accentColors = ['bg-indigo-500', 'bg-cyan-500', 'bg-amber-500'];

  return (
    <SectionCard
      title="Projetos recentes"
      description="Acompanhe a evolução das iniciativas em destaque."
      action={
        <Link
          to="/projetos"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Ver todos <ArrowRight size={14} />
        </Link>
      }
    >
      {projects.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-slate-500">Nenhum projeto cadastrado.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {projects.slice(0, 3).map((project, index) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id);
            const completed = projectTasks.filter((task) => task.status === 'DONE').length;
            const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;

            return (
              <div key={project.id} className="px-5 py-4 sm:px-6">
                <div className="flex items-start gap-3.5">
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${accentColors[index % accentColors.length]}`}
                  >
                    <FolderKanban size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-850">{project.name}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{project.description}</p>
                      </div>
                      <StatusBadge value={project.status} />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[11px] font-bold text-slate-600">
                        {progress}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {project._count.tasks} {project._count.tasks === 1 ? 'tarefa' : 'tarefas'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function OverallProgress({ tasks }: { tasks: Task[] }) {
  const counts: Record<TaskStatus, number> = {
    TODO: tasks.filter((task) => task.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    DONE: tasks.filter((task) => task.status === 'DONE').length,
  };
  const completionRate = tasks.length ? Math.round((counts.DONE / tasks.length) * 100) : 0;

  const distribution = [
    { label: 'Concluídas', value: counts.DONE, color: 'bg-emerald-500' },
    { label: 'Em andamento', value: counts.IN_PROGRESS, color: 'bg-amber-400' },
    { label: 'A fazer', value: counts.TODO, color: 'bg-slate-300' },
  ];

  return (
    <SectionCard title="Progresso geral" description="Visão consolidada das tarefas.">
      <div className="px-5 py-6 sm:px-6">
        <div className="flex items-center gap-6">
          <div
            className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#4f46e5 ${completionRate}%, #eef2ff ${completionRate}% 100%)`,
            }}
          >
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center">
              <div>
                <p className="text-2xl font-black tracking-tight text-slate-950">{completionRate}%</p>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">concluído</p>
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            {distribution.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <span className="flex-1 text-xs text-slate-500">{item.label}</span>
                <span className="text-xs font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-xl bg-indigo-50 px-4 py-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <TrendingUp size={15} />
            <p className="text-xs font-semibold">
              {counts.DONE} de {tasks.length} tarefas concluídas
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function activityIcon(activity: Activity) {
  const text = activity.description.toLocaleLowerCase('pt-BR');
  if (text.includes('conclu')) return { Icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-600' };
  if (text.includes('responsável')) {
    return { Icon: UserRoundCheck, style: 'bg-blue-50 text-blue-600' };
  }
  if (text.includes('movida')) return { Icon: Clock3, style: 'bg-amber-50 text-amber-600' };
  return { Icon: CircleDot, style: 'bg-indigo-50 text-indigo-600' };
}

function RecentActivities({ activities }: { activities: Activity[] }) {
  return (
    <SectionCard title="Atividades recentes" description="Últimas alterações registradas no workspace.">
      {activities.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-slate-500">Nenhuma atividade registrada.</p>
      ) : (
        <div className="px-5 py-2 sm:px-6">
          {activities.map((activity, index) => {
            const { Icon, style } = activityIcon(activity);
            return (
              <div key={activity.id} className="relative flex gap-3 py-3.5">
                {index < activities.length - 1 && (
                  <span className="absolute left-[15px] top-10 h-[calc(100%-1.5rem)] w-px bg-slate-100" />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style}`}
                >
                  <Icon size={14} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-medium leading-5 text-slate-700">{activity.description}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

export function DashboardPage() {
  const { data, isLoading, error, reload } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) return <ErrorState message={error ?? 'Dados indisponíveis.'} onRetry={reload} />;

  const inProgress = data.tasks.filter((task) => task.status === 'IN_PROGRESS').length;
  const completed = data.tasks.filter((task) => task.status === 'DONE').length;
  const overdue = data.tasks.filter(
    (task) => task.status !== 'DONE' && task.dueDate && new Date(task.dueDate) < new Date(),
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-slate-500">{formatToday()}</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">
            Bom dia, Nathan <span aria-hidden="true">👋</span>
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">Aqui está o resumo dos seus projetos hoje.</p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <RefreshCw size={14} />
          Atualizar dados
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total de projetos"
          value={data.projects.length}
          icon={FolderKanban}
          variant="indigo"
          detail={`${data.projects.filter((project) => project.status === 'ACTIVE').length} projetos ativos`}
        />
        <MetricCard
          label="Total de tarefas"
          value={data.tasks.length}
          icon={ListChecks}
          variant="blue"
          detail="Em todos os projetos"
        />
        <MetricCard
          label="Em andamento"
          value={inProgress}
          icon={Clock3}
          variant="amber"
          detail="Precisam de acompanhamento"
        />
        <MetricCard
          label="Concluídas"
          value={completed}
          icon={CheckCircle2}
          variant="emerald"
          detail="Entregas finalizadas"
        />
        <MetricCard
          label="Em atraso"
          value={overdue}
          icon={CircleAlert}
          variant="rose"
          detail={overdue ? 'Prazo precisa de atenção' : 'Nenhum prazo pendente'}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="space-y-6">
          <RecentProjects projects={data.projects} tasks={data.tasks} />
          <RecentActivities activities={data.activities} />
        </div>
        <OverallProgress tasks={data.tasks} />
      </div>
    </div>
  );
}

