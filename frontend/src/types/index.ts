export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  _count: {
    tasks: number;
  };
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: number;
  assigneeId: number | null;
  createdAt: string;
  updatedAt: string;
  project: Project;
  assignee: User | null;
}

export interface Activity {
  id: number;
  description: string;
  createdAt: string;
}

export interface DashboardData {
  projects: Project[];
  tasks: Task[];
  activities: Activity[];
}

