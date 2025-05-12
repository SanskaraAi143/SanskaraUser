import React, { useEffect, useState } from 'react';
import TaskTracker from '@/components/dashboard/TaskTracker';
import { useAuth } from '@/context/AuthContext';
import { getUserTasks } from '@/services/api/tasksApi';

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserTasks(user.id)
      .then(setTasks)
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [user?.id]);

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
