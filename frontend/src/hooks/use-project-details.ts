import { useEffect, useState } from 'react';
import { projectService } from '../services/projects';
import type { ProjectDetails } from '../types';

export function useProjectDetails(projectId: number) {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProject() {
      try {
        const data = await projectService.getById(projectId, controller.signal);
        setProject(data);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Não foi possível carregar o projeto.',
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadProject();
    return () => controller.abort();
  }, [projectId]);

  return { project, isLoading, error };
}
