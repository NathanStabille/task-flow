import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, History } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const pageContent: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  '/atividades': {
    title: 'Histórico de atividades',
    description: 'O dashboard já exibe as atividades reais mais recentes da API.',
    icon: History,
  },
};

export function ComingSoonPage() {
  const location = useLocation();
  const content = pageContent[location.pathname] ?? pageContent['/atividades'];
  const Icon = content.icon;

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon size={24} />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
          Próxima etapa
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{content.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{content.description}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
          Voltar ao dashboard
        </Link>
      </div>
    </div>
  );
}
