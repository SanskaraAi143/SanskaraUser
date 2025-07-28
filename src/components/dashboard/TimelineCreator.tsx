// Timeline event creator and editor for wedding dashboard.
import React, { useState, useEffect } from 'react';
import { getUserTimelineEvents, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from '@/services/api/timelineApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { useAuth } from '@/context/AuthContext';

// UI TimelineEvent type
interface UITimelineEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  visibility?: string;
  relevant_party?: string;
}

// Supabase TimelineEvent type (imported from API)
import type { TimelineEvent as SupabaseTimelineEvent } from '@/services/api/timelineApi';

// Add visually hidden style for accessibility
const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute' as const,
  width: '1px',
};

const TimelineCreator = () => {
  const [events, setEvents] = useState<UITimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { user } = useAuth();

  // Utility: combine Date and time string into ISO string
  function combineDateAndTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours || 0, minutes || 0, 0, 0);
    return combined.toISOString();
  }

  // Utility: map Supabase event to UI event
  function mapSupabaseEventToUI(event: { event_id: string; event_name: string; event_date_time: string; location: string; description: string; visibility?: string; relevant_party?: string; }): UITimelineEvent {
    const dateObj = event.event_date_time ? new Date(event.event_date_time) : new Date();
    const timeStr = event.event_date_time ? dateObj.toISOString().substring(11,16) : '';
    return {
      id: event.event_id,
      title: event.event_name,
      date: dateObj,
      time: timeStr,
      location: event.location,
      description: event.description || '',
      visibility: event.visibility,
      relevant_party: event.relevant_party,
    };
  }
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UITimelineEvent | null>(null);
  
  const [formData, setFormData] = useState<Omit<UITimelineEvent, 'id'>>({
    title: '',
    date: new Date(),
    time: '',
    location: '',
    description: '',
    visibility: 'shared',
    relevant_party: 'couple',
  });
  
  const { toast } = useToast();
  
  const handleAddEvent = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast({ title: "Validation Error", description: "All fields are required." });
      return;
    }
    try {
      const eventToAdd = {
        event_name: formData.title,
        event_date_time: combineDateAndTime(formData.date, formData.time),
        location: formData.location,
        description: formData.description,
        visibility: formData.visibility,
        relevant_party: formData.relevant_party,
      };
      if (!user?.wedding_id) throw new Error('Wedding ID not available');
      await addTimelineEvent(user.wedding_id, eventToAdd);
      await fetchAndSetEvents();
      resetForm();
      setShowAddDialog(false);
      toast({
        title: "Event added",
        description: "Your event has been added to the timeline."
      });
    } catch (error) {
      console.error('Add Event Error:', error);
      toast({
        title: "Error",
        description: "Failed to add event."
      });
    }
  };
  
  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast({ title: "Validation Error", description: "All fields are required." });
      return;
    }
    try {
      await updateTimelineEvent(editingEvent.id, {
        event_name: formData.title,
        event_date_time: combineDateAndTime(formData.date, formData.time),
        location: formData.location,
        description: formData.description,
        visibility: formData.visibility,
        relevant_party: formData.relevant_party,
      });
      await fetchAndSetEvents();
      resetForm();
      setEditingEvent(null);
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully."
      });
    } catch (error) {
      console.error('Update Event Error:', error);
      toast({
        title: "Error",
        description: "Failed to update event."
      });
    }
  };
  
  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteTimelineEvent(id);
      await fetchAndSetEvents();
      toast({
        title: "Event deleted",
        description: "The event has been removed from your timeline."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event."
      });
    }
  };
  
  const handleEditEvent = (event: UITimelineEvent) => {
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      visibility: event.visibility || 'shared',
      relevant_party: event.relevant_party || 'couple',
    });
    setEditingEvent(event);
    setShowAddDialog(true); // Open dialog on edit
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date(),
      time: '',
      location: '',
      description: '',
      visibility: 'shared',
      relevant_party: 'couple',
    });
  };
  
  const handleDialogClose = () => {
    resetForm();
    setEditingEvent(null);
    setShowAddDialog(false);
  };

  // Fetch events from Supabase and map to UI format
  const fetchAndSetEvents = React.useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      if (!user?.wedding_id) {
        console.warn('Wedding ID not available, skipping timeline events fetch.');
        setEvents([]);
        return;
      }
      const data = await getUserTimelineEvents(user.wedding_id);
      setEvents(data.map(mapSupabaseEventToUI));
    } catch (e: unknown) {
      setFetchError((e as Error).message || 'Failed to load timeline events.');
    } finally {
      setLoading(false);
    }
  }, [user?.wedding_id]);

  useEffect(() => {
    fetchAndSetEvents();
  }, [fetchAndSetEvents]);

  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => {
    const dateComparison = b.date.getTime() - a.date.getTime();
    if (dateComparison !== 0) return dateComparison;
    return b.time.localeCompare(a.time);
  });

  // Group events by date
  const eventsByDate: Record<string, UITimelineEvent[]> = {};
  sortedEvents.forEach(event => {
    const dateKey = format(event.date, 'yyyy-MM-dd');
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Wedding Timeline</CardTitle>
            <CardDescription>Plan your wedding events and ceremonies</CardDescription>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}
          >
            Add Event
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedEvents.map(event => (
                    <tr key={event.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{format(event.date, 'EEEE, MMM d, yyyy')}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{event.title}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{event.time}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{event.location}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{event.description}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <Button size="sm" variant="ghost" onClick={() => handleEditEvent(event)} className="mr-2">
                          <Edit2 size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          {/* Accessible DialogTitle (visually hidden) */}
          <span style={visuallyHidden} id="timeline-dialog-title">
            {editingEvent ? 'Edit Timeline Event' : 'Add Timeline Event'}
          </span>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Title</label>
              <Input 
                placeholder="Event name" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input 
                type="date" 
                value={format(formData.date, 'yyyy-MM-dd')}
                onChange={(e) => setFormData({...formData, date: new Date(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input 
                type="time" 
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input 
                placeholder="Event venue or location" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                placeholder="Brief description of the event" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Visibility</label>
              <Select value={formData.visibility} onValueChange={(value) => setFormData({...formData, visibility: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Relevant Party</label>
              <Select value={formData.relevant_party} onValueChange={(value) => setFormData({...formData, relevant_party: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relevant party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bride_side">Bride's Side</SelectItem>
                  <SelectItem value="groom_side">Groom's Side</SelectItem>
                  <SelectItem value="couple">Couple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
              disabled={!formData.title || !formData.date || !formData.time || !formData.location}
            >
              {editingEvent ? 'Update' : 'Add'} Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default TimelineCreator;
