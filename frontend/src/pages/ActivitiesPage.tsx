import {
  CalendarDays,
  CircleAlert,
  History,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActivityTimeline } from '../components/activities/ActivityTimeline';
import {
  getActivityCategory,
  type ActivityCategory,
} from '../components/activities/activity-category';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionCard } from '../components/ui/SectionCard';
import { useActivities } from '../hooks/use-activities';

type CategoryFilter = 'ALL' | ActivityCategory;
type PeriodFilter = 'ALL' | 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

const categoryOptions: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'ALL', label: 'Todas as categorias' },
  { value: 'PROJECT', label: 'Projetos' },
  { value: 'TASK', label: 'Tarefas' },
  { value: 'STATUS', label: 'Mudanças de status' },
  { value: 'ASSIGNMENT', label: 'Responsáveis' },
  { value: 'USER', label: 'Usuários' },
];

const periodOptions: Array<{ value: PeriodFilter; label: string }> = [
  { value: 'ALL', label: 'Todo o período' },
  { value: 'TODAY', label: 'Hoje' },
  { value: 'LAST_7_DAYS', label: 'Últimos 7 dias' },
  { value: 'LAST_30_DAYS', label: 'Últimos 30 dias' },
];

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function isWithinPeriod(value: string, period: PeriodFilter): boolean {
  if (period === 'ALL') return true;

  const activityDate = new Date(value).getTime();
  const start = startOfToday();

  if (period === 'TODAY') return activityDate >= start.getTime();

  const days = period === 'LAST_7_DAYS' ? 7 : 30;
  start.setDate(start.getDate() - (days - 1));
  return activityDate >= start.getTime();
}

function ActivitiesSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Carregando atividades">
      <div className="space-y-3">
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="h-8 w-72 rounded-lg bg-slate-200" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-[460px] rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

export function ActivitiesPage() {
  const { activities, isLoading, error, reload } = useActivities();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('ALL');

  const filteredActivities = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return activities.filter((activity) => {
      const matchesSearch =
        !normalizedSearch ||
        activity.description.toLocaleLowerCase('pt-BR').includes(normalizedSearch);
      const matchesCategory =
        categoryFilter === 'ALL' || getActivityCategory(activity.description) === categoryFilter;
      const matchesPeriod = isWithinPeriod(activity.createdAt, periodFilter);

      return matchesSearch && matchesCategory && matchesPeriod;
    });
  }, [activities, categoryFilter, periodFilter, search]);

  const todayCount = activities.filter((activity) =>
    isWithinPeriod(activity.createdAt, 'TODAY'),
  ).length;
  const weekCount = activities.filter((activity) =>
    isWithinPeriod(activity.createdAt, 'LAST_7_DAYS'),
  ).length;
  const hasFilters = search !== '' || categoryFilter !== 'ALL' || periodFilter !== 'ALL';

  function clearFilters() {
    setSearch('');
    setCategoryFilter('ALL');
    setPeriodFilter('ALL');
  }

  if (isLoading) return <ActivitiesSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-indigo-600">Auditoria do workspace</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">
            Histórico de atividades
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Acompanhe as principais alterações realizadas nos projetos e tarefas.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <RefreshCw size={14} />
          Atualizar histórico
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
          <CircleAlert className="mx-auto text-rose-500" size={25} />
          <h3 className="mt-4 text-sm font-bold text-rose-800">
            Não foi possível carregar o histórico
          </h3>
          <p className="mt-1.5 text-xs text-rose-600">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Eventos registrados"
              value={activities.length}
              icon={History}
              variant="indigo"
              detail="Até os 100 registros mais recentes"
            />
            <MetricCard
              label="Atividades hoje"
              value={todayCount}
              icon={Sparkles}
              variant="blue"
              detail="Movimentações desde meia-noite"
            />
            <MetricCard
              label="Últimos 7 dias"
              value={weekCount}
              icon={CalendarDays}
              variant="emerald"
              detail="Alterações no período recente"
            />
          </div>

          <div className="grid gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card sm:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_220px_200px_auto]">
            <label className="relative sm:col-span-2 xl:col-span-1">
              <span className="sr-only">Buscar atividade</span>
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar no histórico..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>
            <select
              aria-label="Filtrar por categoria"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrar por período"
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={13} />
              Limpar
            </button>
          </div>

          <SectionCard
            title="Linha do tempo"
            description={`${filteredActivities.length} ${filteredActivities.length === 1 ? 'evento encontrado' : 'eventos encontrados'}`}
          >
            <ActivityTimeline
              activities={filteredActivities}
              emptyMessage={
                hasFilters
                  ? 'Nenhum evento corresponde aos filtros selecionados.'
                  : 'As próximas alterações aparecerão automaticamente aqui.'
              }
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}
