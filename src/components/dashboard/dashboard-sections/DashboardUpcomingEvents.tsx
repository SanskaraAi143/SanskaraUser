import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Plus, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TimelineEvent } from '@/services/api/timelineApi'; // Assuming TimelineEvent interface is exported from timelineApi

interface DashboardUpcomingEventsProps {
  nextEvents: TimelineEvent[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Renders the upcoming events section of the dashboard.
 * @param {DashboardUpcomingEventsProps} props - The props for the component.
 * @param {TimelineEvent[]} props.nextEvents - An array of upcoming events to display.
 */
const DashboardUpcomingEvents: React.FC<DashboardUpcomingEventsProps> = ({ nextEvents }) => {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
      <Card className="">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link to="/dashboard/timeline">
              <span className="flex items-center"><Plus className="h-4 w-4 mr-1" /> Add Event</span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextEvents.length > 0 ? nextEvents.map((event) => (
              <div key={event.event_id} className="flex p-2 rounded-md hover:bg-gray-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-wedding-red/10 text-wedding-red">
                  <Heart className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">{event.event_name}</h4>
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    {event.event_date_time ? new Date(event.event_date_time).toLocaleDateString() : "-"}
                    <Clock className="ml-2 mr-1 h-3 w-3" />
                    {event.event_date_time ? new Date(event.event_date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                  </div>
                </div>
              </div>
            )) : <span className="text-gray-400">No upcoming events</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardUpcomingEvents;