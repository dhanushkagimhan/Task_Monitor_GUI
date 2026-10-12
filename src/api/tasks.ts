
import { api } from './axios';
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
} from '../types/task';

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks');
  return response.data;
};

export const createTask = async (
  data: CreateTaskDto,
): Promise<Task> => {
  const response = await api.post<Task>('/tasks', data);
  return response.data;
};

export const updateTask = async (
  id: string,
  data: UpdateTaskDto,
): Promise<Task> => {
  const response = await api.patch<Task>(
    `/tasks/${id}`,
    data,
  );
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const getTask = async (id: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
};

export const startTaskProcessing = async (
  id: string,
): Promise<{ message: string; taskId: string }> => {
  const response = await api.post(`/tasks/${id}/process`);
  return response.data;
};
