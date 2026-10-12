export type TaskStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  progress: number;
  result: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;