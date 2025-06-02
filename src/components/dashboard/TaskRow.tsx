import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getPriorityColor } from '@/lib/utils';
import type { Task } from '@/services/api/tasksApi';

interface TaskRowProps {
  task: Task;
  isSelected: boolean;
  onSelect: (taskId: string, checked: boolean) => void;
  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string, updates: Partial<Task>) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, isSelected, onSelect, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    title: task.title,
    description: task.description || '',
    due_date: task.due_date || '',
    priority: task.priority,
    category: task.category || '',
  });
  const [fade, setFade] = useState(false);

  // Highlight if due within 2 days and not complete
  const isNearDue = task.due_date && !task.is_complete && (() => {
    const due = new Date(task.due_date);
    const now = new Date();
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 2;
  })();

  // Fade out on delete/complete (simulate for now)
  const handleDeleteWithFade = () => {
    setFade(true);
    setTimeout(() => onDelete(task.task_id), 400);
  };
  const handleToggleWithFade = () => {
    setFade(true);
    setTimeout(() => onToggle(task), 400);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onEdit(task.task_id, editValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority,
      category: task.category || '',
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`relative flex flex-col gap-3 p-5 rounded-2xl shadow-lg bg-white border-l-8 transition-all duration-300 ${fade ? 'opacity-0 pointer-events-none' : 'opacity-100'} hover:shadow-2xl hover:scale-[1.03] hover:z-10 group`}
      style={{ borderLeftColor: getPriorityColor(task.priority) === 'text-red-600' ? '#FFD700' : getPriorityColor(task.priority) === 'text-yellow-600' ? '#FF8F00' : '#FFF8E1', minHeight: 120 }}
    >
      {/* Title & Status Chip */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-lg truncate max-w-[140px] text-wedding-gold" title={task.title}>{task.title.length > 18 ? task.title.slice(0, 18) + '…' : task.title}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${
          task.status === 'Done' ? 'bg-gradient-to-r from-wedding-gold to-wedding-secondaryGold text-white border-wedding-gold/40' :
          task.status === 'Doing' ? 'bg-gradient-to-r from-wedding-gold/60 to-wedding-secondaryGold/60 text-wedding-gold border-wedding-gold/30' :
          task.status === 'To Do' ? 'bg-gradient-to-r from-wedding-cream to-wedding-gold/30 text-wedding-gold border-wedding-gold/20' :
          'bg-wedding-cream text-wedding-gold border-wedding-gold/30'
        }`} title={task.status}>{task.status}</span>
      </div>
      {/* Description */}
      {task.description && <div className="text-sm text-gray-600 mb-1 truncate" title={task.description}>{task.description.length > 32 ? task.description.slice(0, 32) + '…' : task.description}</div>}
      {/* Chips Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
        {task.due_date && <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full" title={`Due: ${task.due_date}`}>Due: {task.due_date}</span>}
        <span className={`px-3 py-1 rounded-full ${getPriorityColor(task.priority) === 'text-red-600' ? 'bg-red-100 text-red-600' : getPriorityColor(task.priority) === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`} title={`${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
        {task.category && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full" title={task.category}>{task.category.length > 10 ? task.category.slice(0, 10) + '…' : task.category}</span>}
      </div>
      {/* Divider */}
      <div className="border-t border-gray-100 my-2"></div>
      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-1">
        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="transition-all group-hover:border-blue-500">Edit</Button>
        <Button size="sm" variant="destructive" onClick={handleDeleteWithFade} className="transition-all group-hover:border-red-500">Delete</Button>
      </div>
      {/* Edit Mode Overlay */}
      {isEditing && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col gap-2 p-4 rounded-2xl z-20 shadow-2xl animate-fadeIn">
          <Input name="title" value={editValues.title} onChange={handleChange} className="mb-1" />
          <Input name="description" value={editValues.description} onChange={handleChange} className="mb-1" />
          <Input name="category" value={editValues.category} onChange={handleChange} className="mb-1" />
          <Input name="due_date" type="date" value={editValues.due_date} onChange={handleChange} className="mb-1" />
          <select name="priority" value={editValues.priority} onChange={handleChange} className="mb-1 border rounded px-2 py-1 text-sm">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskRow;
