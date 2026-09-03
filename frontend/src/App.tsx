import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { DashboardPage } from './pages/DashboardPage';
import { KanbanPage } from './pages/KanbanPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/projetos', element: <ProjectsPage /> },
      { path: '/tarefas', element: <TasksPage /> },
      { path: '/kanban', element: <KanbanPage /> },
      { path: '/atividades', element: <ActivitiesPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
