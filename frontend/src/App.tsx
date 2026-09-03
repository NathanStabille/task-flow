import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/projetos', element: <ProjectsPage /> },
      { path: '/tarefas', element: <ComingSoonPage /> },
      { path: '/atividades', element: <ComingSoonPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
