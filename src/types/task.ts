export interface Task {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;