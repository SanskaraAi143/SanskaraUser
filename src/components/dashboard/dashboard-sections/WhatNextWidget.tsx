import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from '@/services/api/tasksApi';
import { TimelineEvent } from '@/services/api/timelineApi';
import { format } from 'date-fns';

interface WhatNextWidgetProps {
  nextTasks: Task[];
  nextEvents: TimelineEvent[];
}

const WhatNextWidget: React.FC<WhatNextWidgetProps> = ({ nextTasks, nextEvents }) => {
  const allUpcomingItems = [
    ...nextTasks.map(task => ({
      type: 'task',
      id: task.task_id,
      title: task.title,
      dueDate: task.due_date,
      description: task.description,
    })),
    ...nextEvents.map(event => ({
      type: 'event',
      id: event.event_id,
      title: event.event_name,
      dueDate: event.event_date_time,
      description: event.description,
    })),
  ].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getSuggestion = (item: any) => {
    if (item.type === 'task') {
      if (item.title.toLowerCase().includes('guest list')) return "Consider sending out digital invites soon!";
      if (item.title.toLowerCase().includes('vendor')) return "Follow up with your shortlisted vendors.";
      return "Time to focus on this important task!";
    }
    if (item.type === 'event') {
      if (item.title.toLowerCase().includes('sangeet')) return "Finalize your Sangeet playlist!";
      if (item.title.toLowerCase().includes('ceremony')) return "Review the ceremony schedule with your planner.";
      return "Prepare for this exciting upcoming event!";
    }
    return "Let's get this done!";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">What's Next? ✨</CardTitle>
      </CardHeader>
      <CardContent>
        {allUpcomingItems.length > 0 ? (
          <ul className="space-y-4">
            {allUpcomingItems.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {item.type === 'task' ? (
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">T</span>
                  ) : (
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">E</span>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{item.title}</p>
                  {item.dueDate && (
                    <p className="text-sm text-muted-foreground">
                      Due: {format(new Date(item.dueDate), 'PPP')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 italic mt-1">
                    {getSuggestion(item)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p className="mb-2">No upcoming tasks or events. Time to relax or define your vision!</p>
            <p className="text-sm">Suggestions for new users:</p>
            <ul className="list-disc list-inside text-left mx-auto max-w-xs mt-2">
              <li>Define your vision & guest list</li>
              <li>Consult an astrologer for auspicious dates</li>
              <li>Explore venue options</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatNextWidget;