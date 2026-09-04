import type { User, UserInput } from '../types';
import { api } from './api';

export const userService = {
  list: (signal?: AbortSignal) => api.get<User[]>('/users', signal),
  get: (id: number, signal?: AbortSignal) => api.get<User>(`/users/${id}`, signal),
  create: (data: UserInput) => api.post<User>('/users', data),
  update: (id: number, data: UserInput) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};
