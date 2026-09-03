import type { DashboardData } from '../types';
import { activityService } from './activities';
import { projectService } from './projects';
import { taskService } from './tasks';

export async function getDashboardData(signal?: AbortSignal): Promise<DashboardData> {
  const [projects, tasks, activities] = await Promise.all([
    projectService.list(signal),
    taskService.list(signal),
    activityService.list(6, signal),
  ]);

  return { projects, tasks, activities };
}
