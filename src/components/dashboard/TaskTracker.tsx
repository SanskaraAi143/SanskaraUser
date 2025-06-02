import React, { useState, useEffect } from 'react';
import TaskDetailModal from './TaskDetailModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/context/AuthContext';
import { getUserTasks, addUserTask, updateUserTask, removeUserTask } from '@/services/api/tasksApi';
import TaskRow from './TaskRow';
import Pagination from './Pagination';
import CategoryManager from './CategoryManager';
import { CalendarDays } from 'lucide-react';

import type { Task } from '@/services/api/tasksApi';
import { getPriorityColor } from '@/lib/utils';

const TaskTracker = () => {
  const { user } = useAuth();
  // Modal state for task details
  const [modalTask, setModalTask] = useState<Task | null>(null);
  // Loading state for tasks
  const [loading, setLoading] = useState<boolean>(true);
  // Kanban tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Advanced features state
  const [categories, setCategories] = useState<string[]>(() => JSON.parse(localStorage.getItem('categories') || '[]'));

  // Load tasks from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getUserTasks(user.id)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [user?.id]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(() => Number(localStorage.getItem('tasksPerPage')) || 5);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [undoAction, setUndoAction] = useState<null | (() => void)>(null);
  const [userPrefs, setUserPrefs] = useState(() => JSON.parse(localStorage.getItem('userPrefs') || '{}'));

  // Inline edit handler
  const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
    setLoading(true);
    try {
      await updateUserTask(taskId, updates);
      setTasks(await getUserTasks(user.id));
    } catch (err) {
      setError('Edit failed');
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Filtering, sorting, and search state
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>(userPrefs.filterStatus || 'all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>(userPrefs.filterPriority || 'all');
  const [filterCategory, setFilterCategory] = useState(userPrefs.filterCategory || 'all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>(userPrefs.sortBy || 'due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(userPrefs.sortOrder || 'asc');
  const [search, setSearch] = useState(userPrefs.search || '');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getUserTasks(user.id)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Persist user preferences
  useEffect(() => {
    localStorage.setItem('userPrefs', JSON.stringify({ filterStatus, filterPriority, filterCategory, sortBy, sortOrder, search }));
  }, [filterStatus, filterPriority, filterCategory, sortBy, sortOrder, search]);
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem('tasksPerPage', String(tasksPerPage));
  }, [tasksPerPage]);

  // Handle save from modal
  const handleModalSave = async (updates: Partial<Task>) => {
    if (!modalTask) return;
    try {
      await updateUserTask(modalTask.task_id, updates);
      setTasks(await getUserTasks(user.id));
      setModalTask(null);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleAdd = async () => {
    setModalTask({ task_id: 'new', user_id: user?.id || '', title: '', description: '', due_date: null, priority: 'medium', category: null, status: 'No Status', is_complete: false });
  };

  const handleToggle = async (task: Task) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      await updateUserTask(task.task_id, { is_complete: !task.is_complete });
      setTasks(await getUserTasks(user.id));
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to update task.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (task_id: string) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      await removeUserTask(task_id);
      setTasks(await getUserTasks(user.id));
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to delete task.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Drag-and-drop handler for Kanban
  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    const task = tasks.find(t => t.task_id === draggableId);
    if (!task) return;
    const prevTasks = [...tasks];
    setTasks(prev => prev.map(t => t.task_id === task.task_id ? { ...t, status: destination.droppableId as 'No Status' | 'To Do' | 'Doing' | 'Done' } : t));
    updateUserTask(task.task_id, { status: destination.droppableId as 'No Status' | 'To Do' | 'Doing' | 'Done' })
      .catch(() => {
        setTasks(prevTasks);
        alert('Failed to update task status. Please try again.');
      });
  }

  const kanbanStatuses = ["No Status", "To Do", "Doing", "Done"];
  
  // Show error toast if error occurs
  useEffect(() => {
    if (error) {
      // Optionally use a toast here if you have a toast system
      // toast({ title: 'Error', description: error, variant: 'destructive' });
      // For now, just log
      console.error(error);
    }
  }, [error]);

  // Render error message if error exists
  return (
    <div className="space-y-8">
      {error && (
        <div className="glass-card p-4 bg-red-100 border border-red-300 text-red-700 text-center font-semibold">
          {error}
        </div>
      )}
      {/* Header with Actions */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-playfair font-bold title-gradient mb-2">
              Wedding Planning Tasks
            </h2>
            <p className="text-wedding-brown/80">
              Track and manage all your wedding preparation tasks in one place
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="nav-link" onClick={() => setModalTask({} as Task)}>
              Add New Task
            </Button>
            <CategoryManager
              categories={categories}
              onAdd={cat => setCategories([...categories, cat])}
              onDelete={cat => setCategories(categories.filter(c => c !== cat))}
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanStatuses.map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`glass-card p-4 ${
                    snapshot.isDraggingOver ? 'ring-2 ring-wedding-gold' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-playfair font-semibold text-lg title-gradient">
                      {status}
                    </h3>
                    <span className="bg-gradient-primary text-white text-sm px-2.5 py-1 rounded-full">
                      {tasks.filter((task) => task.status === status).length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {tasks
                      .filter((task) => task.status === status)
                      .map((task, index) => (
                        <Draggable
                          key={task.task_id}
                          draggableId={task.task_id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-gradient-glass backdrop-blur-sm rounded-xl p-4 border border-wedding-gold/10 shadow-sm transition-all duration-300 ${
                                snapshot.isDragging ? 'shadow-2xl ring-2 ring-wedding-gold scale-105' : ''
                              }`}
                              onClick={() => setModalTask(task)}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 min-w-0">
                                  <Checkbox
                                    checked={task.status === 'Done'}
                                    onCheckedChange={(checked) => {
                                      handleToggle(task);
                                    }}
                                    className="mt-1"
                                  />
                                  <div className="min-w-0">
                                    <h4 className="font-medium text-wedding-brown truncate">
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-sm text-wedding-brown/70 truncate mt-1">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  getPriorityColor(task.priority)
                                }`}>
                                  {task.priority}
                                </div>
                              </div>
                              {task.due_date && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-wedding-brown/60">
                                  <CalendarDays className="h-4 w-4" />
                                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      {modalTask && (
        <TaskDetailModal
          task={modalTask}
          open={!!modalTask}
          onClose={() => setModalTask(null)}
          onSave={handleModalSave}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      <div className="glass-card p-4 mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(tasks.length / tasksPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default TaskTracker;
