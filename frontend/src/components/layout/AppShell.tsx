import {
  Bell,
  ChevronDown,
  Columns3,
  FolderKanban,
  History,
  LayoutDashboard,
  ListTodo,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Projetos', path: '/projetos', icon: FolderKanban },
  { label: 'Tarefas', path: '/tarefas', icon: ListTodo },
  { label: 'Kanban', path: '/kanban', icon: Columns3 },
  { label: 'Atividades', path: '/atividades', icon: History },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/projetos': 'Projetos',
  '/tarefas': 'Tarefas',
  '/kanban': 'Kanban',
  '/atividades': 'Atividades',
};

interface SidebarProps {
  onNavigate?: () => void;
}

function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-slate-950 px-4 py-5 text-white">
      <div className="flex h-11 items-center gap-3 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-sm font-black shadow-lg shadow-indigo-950/30">
          TF
        </span>
        <div>
          <p className="text-[15px] font-bold tracking-tight">TaskFlow</p>
          <p className="text-[10px] font-medium tracking-wide text-slate-500">WORKSPACE</p>
        </div>
      </div>

      <nav aria-label="Navegação principal" className="mt-9 space-y-1">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
          Menu principal
        </p>
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  aria-hidden="true"
                  size={18}
                  className={
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/5 bg-white/[0.03] p-3">
        <div className="flex items-center gap-3">
          <Avatar name="Nathan" initials="NS" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-100">Nathan Stabille</p>
            <p className="truncate text-[10px] text-slate-500">Administrador</p>
          </div>
          <ChevronDown aria-hidden="true" size={14} className="text-slate-600" />
        </div>
      </div>
    </div>
  );
}

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? 'TaskFlow';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="relative h-full w-72 shadow-2xl">
            <button
              type="button"
              aria-label="Fechar menu"
              className="absolute right-4 top-6 z-10 rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={18} />
            </button>
            <Sidebar onNavigate={() => setIsMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Abrir menu"
            className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-bold text-slate-800">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Notificações"
              className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar name="Nathan" initials="NS" size="sm" />
              <span className="text-xs font-semibold text-slate-700">Nathan</span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
