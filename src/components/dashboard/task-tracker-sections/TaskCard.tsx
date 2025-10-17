import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, User, CheckSquare } from 'lucide-react'; // Added User and CheckSquare
import { Task } from '@/services/api/tasksApi'; // Assuming Task interface is exported from tasksApi

interface TaskCardProps {
  task: Task;
  index?: number; // Optional as it's only used for Draggable
  onClick?: (task: Task) => void; // Made optional for list view
  onToggleComplete: (task: Task) => void;
  isSelected?: boolean; // Added for list view
  onSelect?: (task: Task) => void; // Added for list view
  onDelete?: (taskId: string) => void; // Added for list view
  onEdit?: (taskId: string, updates: Partial<Task>) => void; // Added for list view
}

/**
 * Renders an individual task card in the Kanban board.
 * @param {TaskCardProps} props - The props for the component.
 * @param {Task} props.task - The task object to display.
 * @param {number} props.index - The index of the task in the list, used for Draggable.
 * @param {(task: Task) => void} props.onClick - Callback function when the task card is clicked.
 * @param {(task: Task) => void} props.onToggleComplete - Callback function when the task's completion status is toggled.
 */
const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick, onToggleComplete, isSelected = false, onSelect, onDelete, onEdit }) => {
  const cardContent = (
    <div
      className={`glass-card p-3 rounded-lg border shadow-sm hover:shadow-md cursor-pointer
        ${isSelected ? 'border-wedding-orange ring-2 ring-wedding-orange' : 'border-wedding-gold/30'}
      `}
      onClick={() => onClick?.(task)} // Use optional chaining for onClick
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <Checkbox
            id={`task-checkbox-${task.task_id}`}
            checked={task.is_complete}
            onCheckedChange={() => onToggleComplete(task)}
            aria-label={`Mark task ${task.title} as ${task.is_complete ? 'incomplete' : 'complete'}`}
            className="mt-1 border-wedding-gold data-[state=checked]:bg-wedding-gold data-[state=checked]:text-white"
          />
          <div className="min-w-0">
            <h4 className="font-medium text-sm text-wedding-brown truncate" title={task.title}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-wedding-brown/70 truncate mt-0.5" title={task.description}>
                {task.description}
              </p>
            )}
            {task.assignee && (
              <div className="flex items-center text-xs text-wedding-brown/70 mt-0.5">
                <div className="h-5 w-5 rounded-full bg-wedding-gold/20 flex items-center justify-center text-wedding-orange text-[10px] font-semibold mr-1">
                  {task.assignee.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <span title={`Assigned to ${task.assignee}`}>{task.assignee}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border self-start
          ${task.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
            'bg-green-100 text-green-700 border-green-200'
          }`}>
          {task.priority}
        </div>
      </div>
      {(task.due_date || task.category || task.subtasks) && (
        <div className="mt-2 pt-2 border-t border-wedding-gold/10 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {task.due_date && (
            <div className={`flex items-center ${new Date(task.due_date) < new Date() && !task.is_complete ? 'text-red-500 font-semibold' : 'text-wedding-brown/70'}`}>
              <CalendarDays className="h-3 w-3 mr-1" />
              <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
            </div>
          )}
          {task.category && (
            <span className="bg-wedding-cream px-1.5 py-0.5 rounded text-wedding-orange border border-wedding-orange/50">
              {task.category}
            </span>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-center text-wedding-brown/70">
              <CheckSquare className="h-3 w-3 mr-1" />
              <span>{task.subtasks.filter(sub => sub.is_complete).length}/{task.subtasks.length}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return index !== undefined ? (
    <Draggable
      key={task.task_id}
      draggableId={task.task_id}
      index={index}
    >
      {(providedDraggable, snapshotDraggable) => (
        <div
          ref={providedDraggable.innerRef}
          {...providedDraggable.draggableProps}
          {...providedDraggable.dragHandleProps}
          className={`${snapshotDraggable.isDragging ? 'shadow-xl ring-2 ring-wedding-orange' : ''}`}
        >
          {cardContent}
        </div>
      )}
    </Draggable>
  ) : (
    cardContent
  );
};

export default TaskCard;