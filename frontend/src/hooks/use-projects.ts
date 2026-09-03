import { useCallback, useEffect, useState } from 'react';
import { projectService } from '../services/projects';
import type { Project } from '../types';

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export function useProjects() {
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    isLoading: true,
    error: null,
  });
  const [requestVersion, setRequestVersion] = useState(0);

  const reload = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const projects = await projectService.list(controller.signal);
        setState({ projects, isLoading: false, error: null });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({
          projects: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Não foi possível carregar os projetos.',
        });
      }
    }

    void loadProjects();
    return () => controller.abort();
  }, [requestVersion]);

  return { ...state, reload };
}
