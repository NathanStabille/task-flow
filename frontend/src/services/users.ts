import type { User } from '../types';
import { api } from './api';

export const userService = {
  list: (signal?: AbortSignal) => api.get<User[]>('/users', signal),
};
