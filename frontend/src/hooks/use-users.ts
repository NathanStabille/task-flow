import { useCallback, useEffect, useState } from 'react';
import { userService } from '../services/users';
import type { User } from '../types';

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

export function useUsers() {
  const [state, setState] = useState<UsersState>({
    users: [],
    isLoading: true,
    error: null,
  });
  const [requestVersion, setRequestVersion] = useState(0);

  const reload = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const users = await userService.list(controller.signal);
        setState({ users, isLoading: false, error: null });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({
          users: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Não foi possível carregar a equipe.',
        });
      }
    }

    void loadUsers();
    return () => controller.abort();
  }, [requestVersion]);

  return { ...state, reload };
}
