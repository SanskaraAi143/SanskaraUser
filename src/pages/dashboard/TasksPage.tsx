import React from 'react';
import TaskTracker from '@/components/dashboard/TaskTracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const TasksPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Wedding Tasks</CardTitle>
          <CardDescription>
            Manage and track all your wedding preparation tasks in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskTracker />
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
