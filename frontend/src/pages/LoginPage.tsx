import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KanbanSquare,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/use-auth';

const demoCredentials = {
  email: 'nathan@taskflow.dev',
  password: 'TaskFlow123!',
};

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = (location.state as { from?: string } | null)?.from ?? '/';

  if (user) return <Navigate to={redirectPath} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      navigate(redirectPath, { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : 'Não foi possível entrar na plataforma.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function useDemoAccount() {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError(null);
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(360px,0.85fr)_minmax(520px,1.15fr)]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-sm font-black shadow-lg shadow-indigo-950/40">
            TF
          </span>
          <div>
            <p className="text-base font-bold">TaskFlow</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Project workspace
            </p>
          </div>
        </div>

        <div className="relative my-auto max-w-lg">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-300">
            <KanbanSquare size={23} />
          </span>
          <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight">
            Organize projetos.
            <br />
            Entregue com clareza.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            Centralize tarefas, responsáveis, prazos e o histórico da sua equipe em um único
            workspace.
          </p>

          <div className="mt-9 space-y-4">
            {[
              'Visão completa do andamento dos projetos',
              'Fluxo Kanban integrado às tarefas',
              'Histórico automático das principais ações',
            ].map((benefit) => (
              <p
                key={benefit}
                className="flex items-center gap-3 text-xs font-medium text-slate-300"
              >
                <CheckCircle2 size={16} className="text-indigo-400" />
                {benefit}
              </p>
            ))}
          </div>
        </div>

        <p className="relative text-[10px] font-medium text-slate-600">
          React · Express · Prisma · SQLite
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[430px]">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white">
              TF
            </span>
            <p className="text-base font-bold text-slate-950">TaskFlow</p>
          </div>

          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShieldCheck size={21} />
          </span>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950">Bem-vindo</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Entre com suas credenciais para acessar o workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@empresa.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Senha</span>
              <span className="relative block">
                <LockKeyhole
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={17} /> Entrando...
                </>
              ) : (
                <>
                  Entrar no workspace <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-700">Acesso de demonstração</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  {demoCredentials.email}
                  <br />
                  Senha: {demoCredentials.password}
                </p>
              </div>
              <button
                type="button"
                onClick={useDemoAccount}
                className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
              >
                Preencher
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
