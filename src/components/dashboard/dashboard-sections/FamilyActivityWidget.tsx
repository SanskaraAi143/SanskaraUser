import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  user: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  action: string;
  timestamp: Date;
}

const dummyActivities: Activity[] = [
  {
    id: '1',
    user: { name: 'Priya', role: 'Mother', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya' },
    action: 'just added 5 guests to the list',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '2',
    user: { name: 'Rohan', role: 'Partner', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Rohan' },
    action: "marked 'Book Photographer' as complete",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
  },
  {
    id: '3',
    user: { name: 'Anjali', role: 'Sister', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Anjali' },
    action: "suggested a new venue for the reception",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
];

const FamilyActivityWidget: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Family Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {dummyActivities.length > 0 ? (
          <ul className="space-y-4">
            {dummyActivities.map(activity => (
              <li key={activity.id} className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={activity.user.avatarUrl} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{activity.user.name} ({activity.user.role})</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-4">No recent family activity.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyActivityWidget;