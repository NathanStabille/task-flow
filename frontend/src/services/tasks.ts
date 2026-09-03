import type { Task } from '../types';
import { api } from './api';

export const taskService = {
  list: (signal?: AbortSignal) => api.get<Task[]>('/tasks', signal),
};

