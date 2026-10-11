
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../api/tasks';

import type {
  CreateTaskDto,
  UpdateTaskDto,
} from '../types/task';

const tasksKey = ['tasks'];

export function useTasks() {
  return useQuery({
    queryKey: tasksKey,
    queryFn: getTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => createTask(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tasksKey }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTaskDto;
    }) => updateTask(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tasksKey }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tasksKey }),
  });
}
