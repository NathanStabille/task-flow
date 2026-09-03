import { useCallback, useEffect, useState } from 'react';
import { getDashboardData } from '../services/dashboard';
import type { DashboardData } from '../types';

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  isLoading: true,
  error: null,
};

export function useDashboard() {
  const [state, setState] = useState(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  const reload = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const data = await getDashboardData(controller.signal);
        setState({ data, isLoading: false, error: null });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.',
        });
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, [requestVersion]);

  return { ...state, reload };
}

