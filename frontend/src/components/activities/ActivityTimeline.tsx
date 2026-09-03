import { History } from 'lucide-react';
import type { Activity } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { ActivityIcon } from './ActivityIcon';
import { getActivityCategory, type ActivityCategory } from './activity-category';

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

const categoryLabels: Record<ActivityCategory, string> = {
  PROJECT: 'Projeto',
  TASK: 'Tarefa',
  STATUS: 'Status',
  ASSIGNMENT: 'Responsável',
};

function dateKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatDay(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Hoje';
  if (isSameDay(date, yesterday)) return 'Ontem';

  const formatted = dayFormatter.format(date).replace(' de ', ' ').replace(' de ', ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function groupActivities(activities: Activity[]) {
  return activities.reduce<Array<{ key: string; label: string; activities: Activity[] }>>(
    (groups, activity) => {
      const key = dateKey(activity.createdAt);
      const currentGroup = groups.at(-1);

      if (currentGroup?.key === key) {
        currentGroup.activities.push(activity);
      } else {
        groups.push({ key, label: formatDay(activity.createdAt), activities: [activity] });
      }

      return groups;
    },
    [],
  );
}

interface ActivityTimelineProps {
  activities: Activity[];
  emptyMessage?: string;
}

export function ActivityTimeline({
  activities,
  emptyMessage = 'Nenhuma atividade registrada.',
}: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <History size={21} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-700">Nada por aqui</p>
        <p className="mt-1 text-xs text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  const groups = groupActivities(activities);

  return (
    <div className="px-5 py-5 sm:px-6">
      {groups.map((group, groupIndex) => (
        <section key={group.key} className={groupIndex > 0 ? 'mt-7' : ''}>
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              {group.label}
            </h3>
            <span className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] font-semibold text-slate-400">
              {group.activities.length} {group.activities.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>

          <ol>
            {group.activities.map((activity, index) => {
              const category = getActivityCategory(activity.description);

              return (
                <li key={activity.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                  {index < group.activities.length - 1 && (
                    <span className="absolute bottom-0 left-[17px] top-9 w-px bg-slate-100" />
                  )}
                  <ActivityIcon description={activity.description} />
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <p className="text-xs font-medium leading-5 text-slate-700">
                        {activity.description}
                      </p>
                      <span className="w-fit shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                        {categoryLabels[category]}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                      {timeFormatter.format(new Date(activity.createdAt))} ·{' '}
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
