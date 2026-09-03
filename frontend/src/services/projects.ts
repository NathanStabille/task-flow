import type { Project } from '../types';
import { api } from './api';

export const projectService = {
  list: (signal?: AbortSignal) => api.get<Project[]>('/projects', signal),
};

