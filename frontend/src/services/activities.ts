import type { Activity } from '../types';
import { api } from './api';

export const activityService = {
  list: (limit = 8, signal?: AbortSignal) =>
    api.get<Activity[]>(`/activities?limit=${limit}`, signal),
};

