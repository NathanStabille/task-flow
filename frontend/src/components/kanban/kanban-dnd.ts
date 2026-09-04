import type { TaskStatus } from '../../types';

export const KANBAN_TASK_TYPE = 'KANBAN_TASK';

const taskPrefix = 'task:';
const columnPrefix = 'column:';
const taskStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export function taskDragId(taskId: number): string {
  return `${taskPrefix}${taskId}`;
}

export function columnDropId(status: TaskStatus): string {
  return `${columnPrefix}${status}`;
}

export function taskIdFromDragId(id: string | number): number | null {
  const value = String(id);
  if (!value.startsWith(taskPrefix)) return null;

  const taskId = Number(value.slice(taskPrefix.length));
  return Number.isInteger(taskId) && taskId > 0 ? taskId : null;
}

export function statusFromDropId(id: string | number): TaskStatus | null {
  const value = String(id);
  if (!value.startsWith(columnPrefix)) return null;

  const status = value.slice(columnPrefix.length) as TaskStatus;
  return taskStatuses.includes(status) ? status : null;
}
