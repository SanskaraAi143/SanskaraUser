
import React from 'react';
import TaskTracker from '@/components/dashboard/TaskTracker';

const TasksPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-wedding-maroon/5 rounded-xl p-6 border border-wedding-maroon/20">
        <h1 className="text-2xl font-playfair text-wedding-maroon mb-2">
          Wedding Tasks
        </h1>
        <p className="text-gray-600">
          Manage and track all your wedding preparation tasks in one place.
        </p>
      </div>
      
      <TaskTracker />
    </div>
  );
};

export default TasksPage;
