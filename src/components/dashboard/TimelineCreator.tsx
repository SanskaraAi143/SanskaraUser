
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, Plus, Edit2, Trash2, Heart, Music, Gift, Camera, Cake, Clock } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

type TimelineEvent = {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: 'ceremony' | 'party' | 'ritual' | 'other';
  description: string;
};

const TimelineCreator = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: 'Mehndi Ceremony',
      date: new Date(2025, 6, 15), // July 15, 2025
      time: '16:00',
      location: 'Bride\'s Family Home',
      type: 'ritual',
      description: 'Traditional henna application ceremony with music and celebrations.'
    },
    {
      id: '2',
      title: 'Sangeet Night',
      date: new Date(2025, 6, 16), // July 16, 2025
      time: '19:00',
      location: 'Grand Ballroom, Marriott Hotel',
      type: 'party',
      description: 'Music and dance celebration with performances from both families.'
    },
    {
      id: '3',
      title: 'Wedding Ceremony',
      date: new Date(2025, 6, 17), // July 17, 2025
      time: '11:00',
      location: 'Shiva Temple Garden',
      type: 'ceremony',
      description: 'Traditional Hindu wedding ceremony followed by lunch.'
    },
    {
      id: '4',
      title: 'Reception',
      date: new Date(2025, 6, 17), // July 17, 2025
      time: '19:00',
      location: 'Golden Palace Banquet Hall',
      type: 'party',
      description: 'Formal dinner reception with speeches and celebrations.'
    }
  ]);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  
  const [formData, setFormData] = useState<Omit<TimelineEvent, 'id'>>({
    title: '',
    date: new Date(),
    time: '',
    location: '',
    type: 'ceremony',
    description: ''
  });
  
  const { toast } = useToast();
  
  const handleAddEvent = () => {
    const newEvent: TimelineEvent = {
      ...formData,
      id: Date.now().toString()
    };
    
    setEvents(prev => [...prev, newEvent]);
    resetForm();
    setShowAddDialog(false);
    
    toast({
      title: "Event added",
      description: "Your event has been added to the timeline."
    });
  };
  
  const handleUpdateEvent = () => {
    if (!editingEvent) return;
    
    setEvents(prev => prev.map(event => 
      event.id === editingEvent.id ? { ...formData, id: event.id } : event
    ));
    
    resetForm();
    setEditingEvent(null);
    
    toast({
      title: "Event updated",
      description: "Your event has been updated successfully."
    });
  };
  
  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    
    toast({
      title: "Event deleted",
      description: "The event has been removed from your timeline."
    });
  };
  
  const handleEditEvent = (event: TimelineEvent) => {
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      description: event.description
    });
    
    setEditingEvent(event);
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date(),
      time: '',
      location: '',
      type: 'ceremony',
      description: ''
    });
  };
  
  const handleDialogClose = () => {
    resetForm();
    setEditingEvent(null);
    setShowAddDialog(false);
  };
  
  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => {
    const dateComparison = a.date.getTime() - b.date.getTime();
    if (dateComparison !== 0) return dateComparison;
    return a.time.localeCompare(b.time);
  });
  
  // Group events by date
  const eventsByDate: Record<string, TimelineEvent[]> = {};
  
  sortedEvents.forEach(event => {
    const dateKey = format(event.date, 'yyyy-MM-dd');
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'ceremony':
        return <Heart className="h-5 w-5 text-wedding-red" />;
      case 'party':
        return <Music className="h-5 w-5 text-wedding-orange" />;
      case 'ritual':
        return <Gift className="h-5 w-5 text-wedding-maroon" />;
      default:
        return <Calendar className="h-5 w-5 text-blue-500" />;
    }
  };

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
            <Plus size={16} className="mr-1" />
            Add Event
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="relative mt-4">
            {/* Timeline axis */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Timeline events */}
            <div className="space-y-8 relative pl-16">
              {Object.keys(eventsByDate).length > 0 ? (
                Object.entries(eventsByDate).map(([dateKey, dayEvents]) => (
                  <div key={dateKey} className="relative">
                    <div className="mb-4">
                      <span className="text-sm font-semibold bg-wedding-red text-white px-3 py-1 rounded-full">
                        {format(new Date(dateKey), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {dayEvents.map(event => (
                        <div key={event.id} className="relative">
                          {/* Circle marker on timeline */}
                          <div className="absolute -left-16 mt-1.5 w-4 h-4 rounded-full border-2 border-wedding-red bg-white"></div>
                          
                          <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="p-2 rounded-md bg-gray-50">
                                  {getEventIcon(event.type)}
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                                  <div className="flex flex-wrap text-sm text-gray-500 mt-1 gap-y-1">
                                    <div className="flex items-center mr-4">
                                      <Clock size={14} className="mr-1" />
                                      {event.time}
                                    </div>
                                    <div className="mr-4">{event.location}</div>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <Edit2 size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No events added to your timeline yet.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Event Dialog */}
      <Dialog open={showAddDialog || editingEvent !== null} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {editingEvent 
                ? 'Update the details of your timeline event.' 
                : 'Add a new event to your wedding timeline.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Title</label>
              <Input 
                placeholder="e.g., Mehndi Ceremony" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({...formData, date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
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
              <label className="text-sm font-medium">Event Type</label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'ceremony' | 'party' | 'ritual' | 'other') => 
                  setFormData({...formData, type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceremony">Ceremony</SelectItem>
                  <SelectItem value="party">Party/Celebration</SelectItem>
                  <SelectItem value="ritual">Ritual</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                placeholder="Brief description of the event" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
              disabled={!formData.title || !formData.date || !formData.time}
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
