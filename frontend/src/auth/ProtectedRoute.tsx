import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './use-auth';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-indigo-500 text-base font-black shadow-lg shadow-indigo-950/40">
            TF
          </span>
          <p className="mt-4 text-xs font-semibold text-slate-400">Carregando seu workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
