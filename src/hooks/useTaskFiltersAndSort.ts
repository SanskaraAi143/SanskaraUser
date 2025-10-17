import { useState, useMemo } from 'react';
import type { Task } from '@/services/api/tasksApi';
import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook for managing task filtering, sorting, and search logic.
 * It provides state and memoized functions for processing a list of tasks.
 *
 * @param {Task[]} allTasks - The array of all tasks to be filtered and sorted.
 * @returns {object} An object containing filter/sort states, setters, and the processed (filtered and sorted) tasks.
 */
export const useTaskFiltersAndSort = (allTasks: Task[]) => {
  const { user } = useAuth();

  const [userPrefs, setUserPrefs] = useState(() => {
    const savedPrefs = localStorage.getItem('userPrefs');
    return savedPrefs ? JSON.parse(savedPrefs) : {
      filterStatus: 'all',
      filterPriority: 'all',
      filterCategory: 'all',
      sortBy: 'due_date',
      sortOrder: 'asc',
      search: '',
      filterStartDate: null, // New filter
      filterEndDate: null,   // New filter
    };
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'Backlog' | 'To Do' | 'Doing' | 'Done'>(userPrefs.filterStatus);
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>(userPrefs.filterPriority);
  const [filterCategory, setFilterCategory] = useState(userPrefs.filterCategory);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(userPrefs.filterStartDate ? new Date(userPrefs.filterStartDate) : null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(userPrefs.filterEndDate ? new Date(userPrefs.filterEndDate) : null);
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>(userPrefs.sortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(userPrefs.sortOrder);
  const [search, setSearch] = useState(userPrefs.search);

  // Memoized filtered and sorted tasks
  const processedTasks = useMemo(() => {
    const tasksWithDefaultStatus = allTasks.map(task => ({
      ...task,
      status: (task.status === "No Status" || !task.status) ? 'Backlog' : task.status, // Map "No Status" or undefined/null to 'Backlog'
    }));

    let filtered = tasksWithDefaultStatus.filter(task => {
      // Filter by task status (Backlog, To Do, Doing, Done)
      if (filterStatus !== 'all' && task.status !== filterStatus) {
        return false;
      }

      // Filter by date range
      if (filterStartDate && task.due_date) {
        const taskDueDate = new Date(task.due_date);
        if (taskDueDate < filterStartDate) return false;
      }
      if (filterEndDate && task.due_date) {
        const taskDueDate = new Date(task.due_date);
        if (taskDueDate > filterEndDate) return false;
      }

      // Filter by priority
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

      // Filter by category
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;

      // Filter by search term
      if (search !== '' &&
          !(task.title.toLowerCase().includes(search.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(search.toLowerCase())) ||
            (task.assignee && task.assignee.toLowerCase().includes(search.toLowerCase())))) // Added assignee to search
        return false;

      // Filter by lead_party based on user role
      if (user?.role) {
        const userRole = user.role.toLowerCase();
        const taskLeadParty = (task.lead_party || '').toLowerCase();

        if (taskLeadParty === 'shared' || taskLeadParty === 'couple') {
          return true;
        } else if (userRole.includes('bride') && taskLeadParty.includes('bride')) {
          return true;
        } else if (userRole.includes('groom') && taskLeadParty.includes('groom')) {
          return true;
        } else if (userRole.includes('planner')) {
          return true;
        } else if (taskLeadParty === '') {
          return true;
        }
        return false;
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'due_date') {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
      } else if (sortBy === 'created_at') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : Infinity;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : Infinity;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allTasks, filterStatus, filterPriority, filterCategory, filterStartDate, filterEndDate, sortBy, sortOrder, search, user?.role]);

  return {
    filterStatus, setFilterStatus,
    filterPriority, setFilterPriority,
    filterCategory, setFilterCategory,
    filterStartDate, setFilterStartDate,
    filterEndDate, setFilterEndDate,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    search, setSearch,
    processedTasks,
  };
};