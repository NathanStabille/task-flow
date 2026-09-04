import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AdminRoute } from './auth/AdminRoute';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { UsersPage } from './pages/UsersPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/projetos', element: <ProjectsPage /> },
          { path: '/tarefas', element: <TasksPage /> },
          {
            path: '/kanban',
            lazy: () =>
              import('./pages/KanbanPage').then(({ KanbanPage }) => ({ Component: KanbanPage })),
          },
          { path: '/atividades', element: <ActivitiesPage /> },
          {
            element: <AdminRoute />,
            children: [{ path: '/usuarios', element: <UsersPage /> }],
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
