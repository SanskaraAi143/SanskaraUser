import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Task } from '@/services/api/tasksApi'; // Assuming Task interface is exported from tasksApi

interface DashboardUpcomingTasksProps {
  nextTasks: Task[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Renders the upcoming tasks section of the dashboard.
 * @param {DashboardUpcomingTasksProps} props - The props for the component.
 * @param {Task[]} props.nextTasks - An array of upcoming tasks to display.
 */
const DashboardUpcomingTasks: React.FC<DashboardUpcomingTasksProps> = ({ nextTasks }) => {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
      <Card className="">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Tasks</CardTitle>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link to="/dashboard/tasks">
              <span className="flex items-center"><Plus className="h-4 w-4 mr-1" /> Add Task</span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextTasks.length > 0 ? nextTasks.map((task) => (
              <div key={task.task_id} className="flex items-center p-2 rounded-md hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={task.is_complete}
                  readOnly
                  className="h-4 w-4 rounded border-gray-300 text-wedding-red focus:ring-wedding-red"
                />
                <span className={`ml-3 ${task.is_complete ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${((task.status || '').toLowerCase() === 'to do') ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {(task.status || '').toLowerCase() === 'to do' ? 'To Do' : 'Doing'}
                </span>
              </div>
            )) : <span className="text-gray-400">No upcoming tasks</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardUpcomingTasks;