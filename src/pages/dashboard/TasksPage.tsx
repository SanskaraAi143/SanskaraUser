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
    if (!user?.wedding_id) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserTasks(user.wedding_id)
      .then(setTasks)
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [user?.wedding_id]);

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
