import React from 'react';
import TaskTracker from '@/components/dashboard/TaskTracker';
import { useAuth } from '@/context/AuthContext';

const TasksPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-wedding-gold/80 via-wedding-cream/90 to-white rounded-xl p-6 border border-wedding-gold/30 shadow-xl">
        <h1 className="text-3xl font-playfair font-bold bg-gradient-to-r from-wedding-gold via-wedding-cream to-wedding-secondaryGold bg-clip-text text-transparent mb-2 drop-shadow">
          Wedding Tasks
        </h1>
        <p className="text-wedding-gold/90 font-medium">
          Manage and track all your wedding preparation tasks in one place.
        </p>
      </div>
      <TaskTracker />
    </div>
  );
};

export default TasksPage;
