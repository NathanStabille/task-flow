import type { LucideIcon } from 'lucide-react';

const variants = {
  indigo: 'bg-indigo-50 text-indigo-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-600',
};

interface MetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  variant: keyof typeof variants;
  detail: string;
}

export function MetricCard({ label, value, icon: Icon, variant, detail }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className={`rounded-xl p-2.5 ${variants[variant]}`}>
          <Icon aria-hidden="true" size={18} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 truncate text-[11px] font-medium text-slate-400">{detail}</p>
    </article>
  );
}

