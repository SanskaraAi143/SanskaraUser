import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Task } from '@/services/api/tasksApi';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
}

import { addUserTask } from '@/services/api/tasksApi';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
  onTaskAdded?: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, open, onClose, onSave, onTaskAdded }) => {
  const isNew = task?.task_id === 'new';
  const [edit, setEdit] = useState(isNew);
  const [desc, setDesc] = useState(task?.description || '');
  const [title, setTitle] = useState(task?.title || '');
  const [status, setStatus] = useState(task?.status || 'No Status');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open && task) {
      setEdit(isNew);
      setDesc(task.description || '');
      setTitle(task.title || '');
      setStatus(task.status || 'No Status');
      setDueDate(task.due_date || '');
      setPriority(task.priority || 'medium');
      setCategory(task.category || '');
      setError(null);
    }
  }, [open, task, isNew]);

  if (!open || !task) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isNew) {
        await addUserTask(
          task.user_id,
          title,
          desc,
          dueDate || null,
          priority,
          category || null,
          status
        );
        if (onTaskAdded) onTaskAdded();
        onClose();
      } else {
        onSave({ description: desc, title, status, due_date: dueDate, priority, category });
        setEdit(false);
      }
    } catch (e) {
      setError('Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setEdit(isNew);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-lg" onClick={onClose} aria-label="Close">×</button>
        <h2 className="text-xl font-bold mb-2">Task Details</h2>
        {edit ? (
          <>
            {/* Title with floating label */}
            <div className="relative mb-6">
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={`peer h-12 w-full border-2 rounded px-4 pt-6 pb-2 focus:outline-none focus:border-blue-500 text-base ${error ? 'border-red-500' : 'border-gray-300'}`}
                placeholder=" "
                id="task-title-input"
                aria-label="Task Title"
                autoFocus
              />
              <label htmlFor="task-title-input"
                className={`absolute left-4 top-1.5 bg-white px-1 text-gray-400 text-base pointer-events-none transition-all duration-200
                  peer-placeholder-shown:top-6 peer-placeholder-shown:text-base
                  peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500
                  ${title ? 'top-1.5 text-xs text-blue-500' : ''}`}
              >Title</label>
              {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
            </div>
            {/* Description with floating label */}
            <div className="relative mb-6">
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="peer border-2 rounded w-full px-4 pt-6 pb-2 min-h-[80px] focus:outline-none focus:border-blue-500 border-gray-300 resize-none text-base"
                placeholder=" "
                id="task-desc-input"
                aria-label="Task Description"
              />
              <label htmlFor="task-desc-input"
                className={`absolute left-4 top-1.5 bg-white px-1 text-gray-400 text-base pointer-events-none transition-all duration-200
                  peer-placeholder-shown:top-6 peer-placeholder-shown:text-base
                  peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500
                  ${desc ? 'top-1.5 text-xs text-blue-500' : ''}`}
              >Description</label>
            </div>
            {/* Due Date */}
            <div className="mb-6">
              <label htmlFor="task-due-input" className="block mb-2 text-gray-700 font-semibold">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="border-2 rounded w-full px-4 py-2 h-12 focus:outline-none focus:border-blue-500 border-gray-300 text-base"
                id="task-due-input"
                aria-label="Due Date"
              />
            </div>
            {/* Priority */}
            <div className="mb-6">
              <label htmlFor="task-priority-input" className="block mb-2 text-gray-700 font-semibold">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="border-2 rounded w-full px-4 py-2 h-12 focus:outline-none focus:border-blue-500 border-gray-300 bg-white text-base appearance-none"
                id="task-priority-input"
                aria-label="Priority"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            {/* Category */}
            <div className="mb-6">
              <label htmlFor="task-category-input" className="block mb-2 text-gray-700 font-semibold">Category</label>
              <Input
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="h-12 w-full border-2 rounded px-4 py-2 focus:outline-none focus:border-blue-500 border-gray-300 text-base"
                placeholder="Category"
                id="task-category-input"
                aria-label="Category"
              />
            </div>
            {/* Status */}
            <div className="mb-6">
              <label htmlFor="task-status-input" className="block mb-2 text-gray-700 font-semibold">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as 'No Status' | 'To Do' | 'Doing' | 'Done')} className="border-2 rounded w-full px-4 py-2 h-12 focus:outline-none focus:border-blue-500 border-gray-300 bg-white text-base appearance-none" id="task-status-input" aria-label="Status">
                <option value="No Status">No Status</option>
                <option value="To Do">To Do</option>
                <option value="Doing">Doing</option>
                <option value="Done">Done</option>
              </select>
            </div>
            {/* Save/Cancel */}
            <div className="flex gap-2 justify-end mt-4">
              <Button onClick={handleSave} className="mr-2" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button variant="ghost" onClick={() => setEdit(false)} disabled={loading}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 text-lg font-semibold">{title}</div>
            <div className="mb-2 whitespace-pre-line">{desc || <span className="text-gray-400">No description</span>}</div>
            <div className="mb-2">Status: <span className="font-semibold">{status}</span></div>
            <Button size="sm" onClick={() => setEdit(true)} className="mr-2">Edit</Button>
            <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
