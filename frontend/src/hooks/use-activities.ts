import { useCallback, useEffect, useState } from 'react';
import { activityService } from '../services/activities';
import type { Activity } from '../types';

interface ActivitiesState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivitiesState = {
  activities: [],
  isLoading: true,
  error: null,
};

export function useActivities() {
  const [state, setState] = useState(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  const reload = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivities() {
      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const activities = await activityService.list(100, controller.signal);
        setState({ activities, isLoading: false, error: null });
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setState({
          activities: [],
          isLoading: false,
          error:
            requestError instanceof Error
              ? requestError.message
              : 'Não foi possível carregar as atividades.',
        });
      }
    }

    void loadActivities();
    return () => controller.abort();
  }, [requestVersion]);

  return { ...state, reload };
}
