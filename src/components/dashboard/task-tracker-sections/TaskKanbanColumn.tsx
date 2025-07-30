import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task } from '@/services/api/tasksApi';
import TaskCard from './TaskCard.tsx'; // Corrected import path

interface TaskKanbanColumnProps {
  status: Task['status'];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

/**
 * Renders a single Kanban column for tasks.
 * @param {TaskKanbanColumnProps} props - The props for the component.
 * @param {Task['status']} props.status - The status (e.g., "To Do", "Doing", "Done") this column represents.
 * @param {Task[]} props.tasks - An array of tasks belonging to this column.
 * @param {(task: Task) => void} props.onTaskClick - Callback function when a task card is clicked.
 * @param {(task: Task) => void} props.onToggleComplete - Callback function when a task's completion status is toggled.
 */
const TaskKanbanColumn: React.FC<TaskKanbanColumnProps> = ({ status, tasks, onTaskClick, onToggleComplete }) => {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`rounded-xl p-3 sm:p-4 min-h-[200px] transition-colors duration-200 border
            ${snapshot.isDraggingOver ? 'bg-wedding-gold/20 border-wedding-gold' : 'bg-wedding-cream/50 border-wedding-cream'}
          `}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-lg text-wedding-brown">
              {status}
            </h3>
            <span className="bg-wedding-gold/20 text-wedding-orange text-xs font-semibold px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.task_id}
                task={task}
                index={index}
                onClick={onTaskClick}
                onToggleComplete={onToggleComplete}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default TaskKanbanColumn;