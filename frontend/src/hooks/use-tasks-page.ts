import { useCallback, useEffect, useState } from 'react';
import { projectService } from '../services/projects';
import { taskService } from '../services/tasks';
import { userService } from '../services/users';
import type { Project, Task, User } from '../types';

interface TasksPageState {
  tasks: Task[];
  projects: Project[];
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksPageState = {
  tasks: [],
  projects: [],
  users: [],
  isLoading: true,
  error: null,
};

export function useTasksPage() {
  const [state, setState] = useState(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  const reload = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const [tasks, projects, users] = await Promise.all([
          taskService.list(controller.signal),
          projectService.list(controller.signal),
          userService.list(controller.signal),
        ]);

        setState({ tasks, projects, users, isLoading: false, error: null });
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setState({
          ...initialState,
          isLoading: false,
          error:
            requestError instanceof Error
              ? requestError.message
              : 'Não foi possível carregar as tarefas.',
        });
      }
    }

    void loadData();
    return () => controller.abort();
  }, [requestVersion]);

  return { ...state, reload };
}
