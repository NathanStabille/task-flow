import type { Task, TaskInput, TaskUpdateInput } from '../types';
import { api } from './api';

export const taskService = {
  list: (signal?: AbortSignal) => api.get<Task[]>('/tasks', signal),
  getById: (id: number, signal?: AbortSignal) => api.get<Task>(`/tasks/${id}`, signal),
  create: (data: TaskInput) => api.post<Task>('/tasks', data),
  update: (id: number, data: TaskUpdateInput) => api.put<Task>(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};
