import type { Project, ProjectDetails, ProjectInput } from '../types';
import { api } from './api';

export const projectService = {
  list: (signal?: AbortSignal) => api.get<Project[]>('/projects', signal),
  getById: (id: number, signal?: AbortSignal) => api.get<ProjectDetails>(`/projects/${id}`, signal),
  create: (data: ProjectInput) => api.post<Project>('/projects', data),
  update: (id: number, data: ProjectInput) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};
