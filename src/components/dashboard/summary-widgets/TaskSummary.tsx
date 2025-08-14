import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TaskSummaryProps {
  completed: number;
  total: number;
}

const TaskSummary: React.FC<TaskSummaryProps> = ({ completed, total }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-4xl font-bold text-wedding-brown">{completed}</span>
        <span className="text-xl text-muted-foreground">/{total}</span>
        <p className="text-sm text-muted-foreground mt-1">Tasks Completed</p>
      </div>
      <Progress value={percentage} className="h-2 [&>div]:bg-wedding-orange" />
      <Link to="/dashboard/tasks">
        <Button variant="outline" className="w-full mt-2">
          View All Tasks
        </Button>
      </Link>
    </div>
  );
};

export default TaskSummary;
