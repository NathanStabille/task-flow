import {
  CheckCircle2,
  CircleAlert,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../auth/use-auth';
import { DeleteUserDialog } from '../components/users/DeleteUserDialog';
import { UserFormModal } from '../components/users/UserFormModal';
import { Avatar } from '../components/ui/Avatar';
import { MetricCard } from '../components/ui/MetricCard';
import { useUsers } from '../hooks/use-users';
import { userService } from '../services/users';
import type { User, UserInput, UserRole } from '../types';

type RoleFilter = 'ALL' | UserRole;
type FormState = { mode: 'create' } | { mode: 'edit'; user: User };

const joinedAtFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function UsersSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-slate-100 p-5 last:border-0"
        >
          <span className="h-10 w-10 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-36 rounded bg-slate-200" />
            <div className="h-2.5 w-48 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { users, isLoading, error, reload } = useUsers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [formState, setFormState] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return users.filter((user) => {
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        user.email.toLocaleLowerCase('pt-BR').includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, users]);

  const adminCount = users.filter((user) => user.role === 'ADMIN').length;
  const memberCount = users.length - adminCount;

  async function handleSave(data: UserInput) {
    if (formState?.mode === 'edit') {
      await userService.update(formState.user.id, data);
      setNotice(`Usuário ${data.name} atualizado com sucesso.`);
    } else {
      await userService.create(data);
      setNotice(`Usuário ${data.name} adicionado à equipe.`);
    }

    setFormState(null);
    reload();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const userName = deleteTarget.name;
    await userService.delete(deleteTarget.id);
    setDeleteTarget(null);
    setNotice(`Usuário ${userName} removido do workspace.`);
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-indigo-600">Administração</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">
            Equipe e acessos
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Gerencie as pessoas que colaboram no workspace e seus níveis de permissão.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormState({ mode: 'create' })}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
        >
          <Plus size={16} />
          Novo usuário
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"
        >
          <CheckCircle2 size={16} />
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => setNotice(null)}
            className="rounded-md p-1 hover:bg-emerald-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Pessoas na equipe"
          value={users.length}
          icon={UsersRound}
          variant="indigo"
          detail="Contas com acesso ao workspace"
        />
        <MetricCard
          label="Administradores"
          value={adminCount}
          icon={ShieldCheck}
          variant="blue"
          detail="Podem gerenciar usuários e acessos"
        />
        <MetricCard
          label="Membros"
          value={memberCount}
          icon={UserRound}
          variant="emerald"
          detail="Acesso a projetos, tarefas e Kanban"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Buscar usuários</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </label>
        <select
          aria-label="Filtrar por perfil"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        >
          <option value="ALL">Todos os perfis</option>
          <option value="ADMIN">Administradores</option>
          <option value="MEMBER">Membros</option>
        </select>
      </div>

      {isLoading && <UsersSkeleton />}

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

      {!isLoading && !error && filteredUsers.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
          <div className="hidden grid-cols-[minmax(250px,1.5fr)_minmax(180px,1fr)_150px_110px] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid">
            <span>Usuário</span>
            <span>Perfil</span>
            <span>Entrada</span>
            <span className="text-right">Ações</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => {
              const isCurrentUser = user.id === currentUser?.id;

              return (
                <article
                  key={user.id}
                  className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(250px,1.5fr)_minmax(180px,1fr)_150px_110px] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={user.name} initials={user.avatar} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                        {isCurrentUser && (
                          <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        user.role === 'ADMIN'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.role === 'ADMIN' && <ShieldCheck size={12} />}
                      {user.role === 'ADMIN' ? 'Administrador' : 'Membro'}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-500">
                    <span className="mr-1 text-[10px] font-bold uppercase text-slate-400 md:hidden">
                      Entrada:
                    </span>
                    {joinedAtFormatter.format(new Date(user.createdAt)).replace('.', '')}
                  </p>

                  <div className="flex items-center gap-1 md:justify-end">
                    <button
                      type="button"
                      aria-label={`Editar ${user.name}`}
                      title={
                        isCurrentUser ? 'A conta atual não é editada nesta tela' : 'Editar usuário'
                      }
                      disabled={isCurrentUser}
                      onClick={() => setFormState({ mode: 'edit', user })}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Excluir ${user.name}`}
                      title={
                        isCurrentUser ? 'Você não pode excluir a própria conta' : 'Excluir usuário'
                      }
                      disabled={isCurrentUser}
                      onClick={() => setDeleteTarget(user)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {!isLoading && !error && filteredUsers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
          <UsersRound className="mx-auto text-slate-300" size={30} />
          <h3 className="mt-4 text-sm font-bold text-slate-800">Nenhum usuário encontrado</h3>
          <p className="mt-1.5 text-xs text-slate-500">
            {users.length === 0
              ? 'Cadastre a primeira pessoa da equipe.'
              : 'Tente alterar a busca ou o perfil selecionado.'}
          </p>
        </div>
      )}

      {formState && (
        <UserFormModal
          user={formState.mode === 'edit' ? formState.user : undefined}
          onClose={() => setFormState(null)}
          onSubmit={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteUserDialog
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
