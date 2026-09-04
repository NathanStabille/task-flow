import { LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { User, UserInput, UserRole } from '../../types';
import { Modal } from '../ui/Modal';

interface UserFormModalProps {
  user?: User;
  onClose: () => void;
  onSubmit: (data: UserInput) => Promise<void>;
}

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50';

export function UserFormModal({ user, onClose, onSubmit }: UserFormModalProps) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'MEMBER');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError('Informe o nome e o email do usuário.');
      return;
    }

    if (!user && password.length < 8) {
      setError('A senha inicial deve ter pelo menos 8 caracteres.');
      return;
    }

    if (user && password && password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLocaleLowerCase('pt-BR'),
        avatar: avatar.trim().toUpperCase(),
        role,
        ...(password ? { password } : {}),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Não foi possível salvar o usuário.',
      );
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title={user ? 'Editar usuário' : 'Novo usuário'}
      description={
        user
          ? 'Atualize os dados, o perfil de acesso ou defina uma nova senha.'
          : 'Cadastre uma pessoa para colaborar no workspace.'
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
            >
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-[1fr_110px]">
            <label className="block text-xs font-semibold text-slate-700">
              Nome completo <span className="text-rose-500">*</span>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Maria Oliveira"
                maxLength={100}
                disabled={isSaving}
                className={fieldClass}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Iniciais
              <input
                type="text"
                value={avatar}
                onChange={(event) => setAvatar(event.target.value)}
                placeholder="MO"
                maxLength={3}
                disabled={isSaving}
                className={`${fieldClass} uppercase`}
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-slate-700">
            Email <span className="text-rose-500">*</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="maria@empresa.com"
              maxLength={160}
              disabled={isSaving}
              className={fieldClass}
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Perfil de acesso
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              disabled={isSaving}
              className={fieldClass}
            >
              <option value="MEMBER">Membro — projetos e tarefas</option>
              <option value="ADMIN">Administrador — acesso completo</option>
            </select>
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            {user ? 'Nova senha' : 'Senha inicial'}{' '}
            {!user && <span className="text-rose-500">*</span>}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={user ? 'Deixe em branco para manter a atual' : 'Mínimo de 8 caracteres'}
              minLength={8}
              autoComplete="new-password"
              disabled={isSaving}
              className={fieldClass}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <LoaderCircle className="animate-spin" size={14} />}
            {user ? 'Salvar alterações' : 'Criar usuário'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
