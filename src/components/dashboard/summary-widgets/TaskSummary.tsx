import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface TaskSummaryProps {
  completed: number;
  total: number;
}

const TaskSummary: React.FC<TaskSummaryProps> = ({ completed, total }) => {
  return (
    <div className="space-y-4 text-center">
      <div className="flex items-baseline justify-center gap-2">
        <span className="text-4xl font-bold">{completed}</span>
        <span className="text-xl text-muted-foreground">/ {total}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Tasks Completed
      </p>
      <Link to="/dashboard/tasks">
        <Button variant="outline" className="w-full">
          View All Tasks
        </Button>
      </Link>
    </div>
  );
};

export default TaskSummary;
