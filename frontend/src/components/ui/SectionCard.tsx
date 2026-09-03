import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-card ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
