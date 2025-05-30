
import React, { useState, useEffect } from 'react';
import TaskDetailModal from './TaskDetailModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/context/AuthContext';
import { getUserTasks, addUserTask, updateUserTask, removeUserTask } from '@/services/api/tasksApi';
import TaskRow from './TaskRow';
import Pagination from './Pagination';
import CategoryManager from './CategoryManager';

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
  // For comments/attachments
  const [comments, setComments] = useState<Record<string, string[]>>(JSON.parse(localStorage.getItem('comments') || '{}'));
  const [attachments, setAttachments] = useState<Record<string, File[]>>(JSON.parse(localStorage.getItem('attachments') || '{}'));







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
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);
  useEffect(() => {
    localStorage.setItem('attachments', JSON.stringify(attachments));
  }, [attachments]);
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

  return (
    <div className="w-full min-h-screen bg-[#f8f9fb] px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-2xl font-bold">Task Tracker</div>
        {/* Loading Indicator */}
        {loading && (
          <div className="w-full flex justify-center items-center py-6">
            <span className="text-gray-500 text-sm">Loading tasks...</span>
          </div>
        )}
        {/* Add New Task Button */}
        <div className="flex justify-start mb-8">
          <Button onClick={handleAdd}>Add Task</Button>
        </div>
        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-wrap justify-center gap-8">
            {['No Status', 'To Do', 'Doing', 'Done'].map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`w-72 min-h-[400px] bg-white rounded-2xl shadow-xl px-4 pt-6 pb-4 flex flex-col transition-all duration-300 relative border-t-8 ${
                      status === 'No Status' ? 'border-gray-300' :
                      status === 'To Do' ? 'border-blue-400' :
                      status === 'Doing' ? 'border-yellow-400' :
                      'border-green-400'
                    } ${snapshot.isDraggingOver ? 'ring-2 ring-blue-300 scale-[1.01]' : ''}`}
                  >
                    <div className="sticky top-0 z-10 bg-white rounded-t-2xl pb-2 mb-3 flex items-center gap-2 border-b border-gray-100">
                      <span className={`text-xl font-bold ${
                        status === 'No Status' ? 'text-gray-500' :
                        status === 'To Do' ? 'text-blue-600' :
                        status === 'Doing' ? 'text-yellow-700' :
                        'text-green-600'
                      }`}>
                        {status === 'No Status' && <span className="mr-1">🗂️</span>}
                        {status === 'To Do' && <span className="mr-1">📝</span>}
                        {status === 'Doing' && <span className="mr-1">⏳</span>}
                        {status === 'Done' && <span className="mr-1">✅</span>}
                        {status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-5 flex-1">
                      {tasks.filter(t => t.status === status).map((task, i) => (
                        <Draggable draggableId={task.task_id} index={i} key={task.task_id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-all duration-200 ${snapshot.isDragging ? 'scale-[1.03] shadow-2xl z-20 ring-2 ring-blue-200' : ''}`}
                            >
                              <TaskRow 
                                task={task}
                                isSelected={false}
                                onSelect={() => {}}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                                onEdit={() => setModalTask(task)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
        {/* Task Detail Modal */}
        <TaskDetailModal
          task={modalTask}
          open={!!modalTask}
          onClose={() => setModalTask(null)}
          onSave={handleModalSave}
          onTaskAdded={async () => {
            if (user?.id) setTasks(await getUserTasks(user.id));
          }}
        />
      </div>
    </div>
  );
}

export default TaskTracker;
