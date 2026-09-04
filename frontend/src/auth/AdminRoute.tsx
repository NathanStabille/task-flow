import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './use-auth';

export function AdminRoute() {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
