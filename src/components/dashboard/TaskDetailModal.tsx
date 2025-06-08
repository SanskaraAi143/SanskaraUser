import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Task } from '@/services/api/tasksApi';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
  onDelete?: (task_id: string) => void;
  onTaskAdded?: () => void;
}

import { addUserTask } from '@/services/api/tasksApi';

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, open, onClose, onSave, onDelete, onTaskAdded }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="glass-card max-w-lg w-full p-8 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-700/60 hover:text-wedding-gold text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-playfair font-bold title-gradient mb-6">
          {isNew ? 'Add New Task' : 'Edit Task'}
        </h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave({ title, description: desc, status, due_date: dueDate, priority, category });
          }}
          className="space-y-5"
        >
          <div>
            <label className="block mb-1 font-medium text-wedding-gold">Title</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="glass-card border-wedding-gold/20"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-wedding-gold">Description</label>
            <Input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="glass-card border-wedding-gold/20"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium text-wedding-gold">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="glass-card border-wedding-gold/20"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium text-wedding-gold">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="glass-card border-wedding-gold/20 w-full px-3 py-2 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-wedding-gold">Category</label>
            <Input
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="glass-card border-wedding-gold/20"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-3 mt-6">
            {onDelete && !isNew && (
              <Button type="button" variant="destructive" onClick={() => onDelete(task.task_id)}>
                Delete
              </Button>
            )}
            <Button type="button" variant="ghost" className="nav-link" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="cta-button">
              {isNew ? 'Add Task' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetailModal;
