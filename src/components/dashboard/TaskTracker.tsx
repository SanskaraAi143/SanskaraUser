import React, { useState, useEffect } from 'react';
import TaskDetailModal, { TaskFormValues } from './TaskDetailModal';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import CategoryManager from './CategoryManager';
import { PlusCircle, LayoutGrid, List, Calendar, Filter } from 'lucide-react';

import type { Task } from '@/services/api/tasksApi';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useTaskFiltersAndSort } from '@/hooks/useTaskFiltersAndSort';
import TaskKanbanColumn from './task-tracker-sections/TaskKanbanColumn';
import TaskRow from './task-tracker-sections/TaskCard';
import TaskCalendarView from './task-tracker-sections/TaskCalendarView'; // Import TaskCalendarView
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const TaskTracker = () => {
  const {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    optimisticUpdateTask, // For optimistic DND updates
  } = useTaskManagement();

  const {
    filterStatus, setFilterStatus,
    filterPriority, setFilterPriority,
    filterCategory, setFilterCategory,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    search, setSearch,
    processedTasks,
  } = useTaskFiltersAndSort(tasks); // Pass tasks from useTaskManagement

  const [modalTask, setModalTask] = useState<Partial<Task> | null>(null);
  const [categories, setCategories] = useState<string[]>(() => JSON.parse(localStorage.getItem('categories') || '[]'));
  const [currentView, setCurrentView] = useState<'board' | 'list' | 'calendar'>('board');

  const [tasksPerPage, setTasksPerPage] = useState(() => Number(localStorage.getItem('tasksPerPage')) || 10); // Increased default
  const [currentPage, setCurrentPage] = useState(1); // Will be used for pagination if implemented

  // Persist categories and tasksPerPage
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('tasksPerPage', String(tasksPerPage));
  }, [tasksPerPage]);

  const handleModalSave = async (data: TaskFormValues, taskId?: string) => {
    if (taskId && taskId !== 'new') {
      await updateTask(taskId, data);
    } else {
      await addTask(data);
    }
    setModalTask(null);
  };

  const handleOpenNewTaskModal = () => {
    setModalTask({ task_id: 'new' });
  };

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    const taskToUpdate = tasks.find(t => t.task_id === draggableId);
    if (!taskToUpdate) return;

    const newStatus = destination.droppableId as Task['status'];
    const newIsComplete = newStatus === 'Done';

    // Optimistic UI update
    optimisticUpdateTask(draggableId, { status: newStatus, is_complete: newIsComplete });

    // Persist change to backend
    updateTask(taskToUpdate.task_id, { status: newStatus })
      .catch(() => {
        // Error handling: re-fetch tasks to revert optimistic update
        // The useTaskManagement hook already handles re-fetching on error
      });
  }

  const kanbanStatuses: Array<Task['status']> = ["Backlog", "To Do", "Doing", "Done"];

  return (
    <div className="space-y-6 p-1">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      )}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold title-gradient mb-1 sm:mb-2">
              Wedding Tasks
            </h2>
            <p className="text-sm text-wedding-brown/80">
              Organize your wedding preparations with this Kanban board.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <Button className="cta-button px-4 py-2 text-sm" onClick={handleOpenNewTaskModal}>
              <PlusCircle size={18} className="mr-2" />
              Add New Task
            </Button>
            <CategoryManager
              categories={categories}
              onAdd={cat => setCategories(prev => [...prev, cat])}
              onDelete={cat => setCategories(prev => prev.filter(c => c !== cat))}
            />

            {/* View Switcher */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('board')}
                className={currentView === 'board' ? 'bg-wedding-gold text-white' : ''}
              >
                <LayoutGrid className="h-4 w-4 mr-2" /> Board
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('list')}
                className={currentView === 'list' ? 'bg-wedding-gold text-white' : ''}
              >
                <List className="h-4 w-4 mr-2" /> List
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('calendar')}
                className={currentView === 'calendar' ? 'bg-wedding-gold text-white' : ''}
              >
                <Calendar className="h-4 w-4 mr-2" /> Calendar
              </Button>
            </div>

            {/* Filter Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 glass-card p-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none text-wedding-brown">Filter Tasks</h4>
                    <p className="text-sm text-wedding-brown/80">Filter by category, priority, or assignee.</p>
                  </div>
                  <div className="grid gap-2">
                    {/* Category Filter */}
                    <Label htmlFor="filter-category" className="text-wedding-brown">Category</Label>
                    <Select onValueChange={setFilterCategory} defaultValue={filterCategory}>
                      <SelectTrigger className="w-full glass-card border-wedding-gold/30">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Priority Filter */}
                    <Label htmlFor="filter-priority" className="text-wedding-brown">Priority</Label>
                    <Select onValueChange={(value: "high" | "low" | "all" | "medium") => setFilterPriority(value)} defaultValue={filterPriority}>
                      <SelectTrigger className="w-full glass-card border-wedding-gold/30">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Assignee Filter */}
                    <Label htmlFor="filter-assignee" className="text-wedding-brown">Assignee</Label>
                    <Select onValueChange={(value) => setSearch(value === 'all' ? '' : value)} defaultValue={search}>
                      <SelectTrigger className="w-full glass-card border-wedding-gold/30">
                        <SelectValue placeholder="Filter by assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        {Array.from(new Set(tasks.map(task => task.assignee).filter(Boolean) as string[])).map(assignee => (
                          <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-10 text-wedding-brown">Loading tasks...</div>}

      {!loading && tasks.length === 0 && (
        <div className="text-center py-10 glass-card p-6">
          <h3 className="text-xl font-semibold text-wedding-brown mb-2">No tasks yet!</h3>
          <p className="text-wedding-brown/80 mb-4">Click "Add New Task" to start planning.</p>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <>
          {currentView === 'board' && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {kanbanStatuses.map((statusValue) => (
                  <TaskKanbanColumn
                    key={statusValue}
                    status={statusValue}
                    tasks={processedTasks.filter((task) => task.status === statusValue)}
                    onTaskClick={setModalTask}
                    onToggleComplete={toggleTaskCompletion}
                  />
                ))}
              </div>
            </DragDropContext>
          )}

          {currentView === 'list' && (
            <div className="space-y-3">
              {processedTasks.map((task) => (
                <TaskRow
                  key={task.task_id}
                  task={task}
                  isSelected={false}
                  onSelect={() => {}}
                  onToggleComplete={toggleTaskCompletion}
                  onDelete={deleteTask}
                  onEdit={(taskId, updates) => updateTask(taskId, updates)}
                />
              ))}
            </div>
          )}

          {currentView === 'calendar' && (
            <TaskCalendarView />
          )}
        </>
      )}

      {modalTask && (
        <TaskDetailModal
          task={modalTask}
          open={!!modalTask}
          onClose={() => setModalTask(null)}
          onSave={handleModalSave}
          onDelete={deleteTask}
        />
      )}

      {processedTasks.length > tasksPerPage && (
        <div className="glass-card p-3 mt-6">
          <p className="text-center text-sm text-gray-500">
            Displaying {tasksPerPage} tasks per page. Pagination coming soon.
          </p>
        </div>
      )}
    </div>
  );
}

export default TaskTracker;
