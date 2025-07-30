import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  Task,
  useUserTasks,
  useAddUserTask,
  useUpdateUserTask,
  useRemoveUserTask,
} from '@/services/api/tasksApi';
import { TaskFormValues } from '@/components/dashboard/TaskDetailModal';

/**
 * Custom hook for managing wedding tasks, including fetching, adding, updating, and deleting.
 * It provides state for tasks, loading status, and errors.
 *
 * @returns {object} An object containing tasks, loading state, error, and CRUD operations.
 */
export const useTaskManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use the useUserTasks hook directly for fetching tasks
  const {
    data: tasks,
    isLoading: loading,
    error,
    refetch: fetchTasks,
  } = useUserTasks(user?.wedding_id || ''); // Pass wedding_id, or empty string if not available

  // Mutations
  const { mutateAsync: addTaskMutation } = useAddUserTask();
  const { mutateAsync: updateTaskMutation } = useUpdateUserTask();
  const { mutateAsync: removeTaskMutation } = useRemoveUserTask();

  /**
   * Adds a new task.
   * @param {TaskFormValues} data - The data for the new task.
   * @returns {Promise<void>}
   */
  const addTask = useCallback(
    async (data: TaskFormValues) => {
      if (!user?.wedding_id) {
        console.error('User not authenticated. Cannot add task.');
        return;
      }
      try {
        await addTaskMutation({
          wedding_id: user.wedding_id,
          title: data.title,
          description: data.description || undefined,
          due_date: data.due_date || undefined,
          priority: data.priority,
          status: data.status,
          category: data.category || undefined,
          lead_party: data.lead_party === "" ? null : data.lead_party,
        });
        await fetchTasks(); // Re-fetch tasks to update the list
      } catch (err: unknown) {
        console.error('Failed to add task:', err);
        throw new Error((err as Error).message || 'Failed to add task. Please try again.');
      }
    },
    [user?.wedding_id, addTaskMutation, fetchTasks],
  );

  /**
   * Updates an existing task.
   * @param {string} taskId - The ID of the task to update.
   * @param {Partial<TaskFormValues>} updates - The updates to apply to the task.
   * @returns {Promise<void>}
   */
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<TaskFormValues>) => {
      if (!user?.wedding_id) {
        console.error('User not authenticated. Cannot update task.');
        return;
      }
      try {
        await updateTaskMutation({
          task_id: taskId,
          updates: {
            ...updates,
            lead_party: updates.lead_party === "" ? null : updates.lead_party,
            is_complete: updates.status === 'Done',
          },
        });
        await fetchTasks(); // Re-fetch tasks to update the list
      } catch (err: unknown) {
        console.error('Failed to update task:', err);
        throw new Error((err as Error).message || 'Failed to update task. Please try again.');
      }
    },
    [user?.wedding_id, updateTaskMutation, fetchTasks],
  );

  /**
   * Deletes a task.
   * @param {string} taskId - The ID of the task to delete.
   * @returns {Promise<void>}
   */
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!user?.wedding_id) {
        console.error('User not authenticated. Cannot delete task.');
        return;
      }
      try {
        await removeTaskMutation(taskId);
        await fetchTasks(); // Re-fetch tasks to update the list
      } catch (err: unknown) {
        console.error('Failed to delete task:', err);
        throw new Error((err as Error).message || 'Failed to delete task. Please try again.');
      }
    },
    [user?.wedding_id, removeTaskMutation, fetchTasks],
  );

  /**
   * Toggles the completion status of a task.
   * @param {Task} task - The task to toggle.
   * @returns {Promise<void>}
   */
  const toggleTaskCompletion = useCallback(
    async (task: Task) => {
      if (!user?.internal_user_id) return;
      try {
        const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
        await updateTaskMutation({
          task_id: task.task_id,
          updates: {
            is_complete: newStatus === 'Done',
            status: newStatus,
          },
        });
        await fetchTasks();
      } catch (err: unknown) {
        console.error('Failed to update task completion:', err);
        throw new Error((err as Error).message || 'Failed to update task. Please try again.');
      }
    },
    [user?.internal_user_id, updateTaskMutation, fetchTasks],
  );

  const optimisticUpdateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      queryClient.setQueryData<Task[]>(['userTasks', user?.wedding_id], (oldTasks) => {
        if (!oldTasks) return [];
        return oldTasks.map((task) =>
          task.task_id === taskId ? { ...task, ...updates } : task
        );
      });
    },
    [queryClient, user?.wedding_id]
  );

  return {
    tasks: tasks || [], // Ensure tasks is always an array
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    optimisticUpdateTask,
  };
};