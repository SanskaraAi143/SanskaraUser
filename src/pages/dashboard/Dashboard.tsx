
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Clock, Plus, Heart, Bell, MessageCircle, CalendarClock, Flower, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskTracker from "@/components/dashboard/TaskTracker";
import TimelineCreator from "@/components/dashboard/TimelineCreator";
import MoodBoard from "@/components/dashboard/MoodBoard";
import BudgetManager from "@/components/dashboard/BudgetManager";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: "Mehndi Ceremony", date: "July 15, 2025", time: "4:00 PM" },
    { id: 2, title: "Sangeet Night", date: "July 16, 2025", time: "7:00 PM" },
    { id: 3, title: "Wedding Ceremony", date: "July 17, 2025", time: "11:00 AM" },
  ]);
  
  const [tasks, setTasks] = useState([
    { id: 1, title: "Book venue", completed: true },
    { id: 2, title: "Find caterer", completed: false },
    { id: 3, title: "Order invitations", completed: false },
    { id: 4, title: "Book photographer", completed: true },
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-wedding-maroon/5 rounded-xl p-6 border border-wedding-maroon/20">
        <h1 className="text-2xl font-playfair text-wedding-maroon mb-2">
          Welcome back, {user?.name || "Friend"}!
        </h1>
        <p className="text-gray-600">
          Your wedding is coming up soon. Here's what you need to know today.
        </p>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="moodboard">Mood Board</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* Stats Section */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Days Until Wedding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CalendarDays className="h-5 w-5 text-wedding-red" />
                  <span className="text-2xl font-bold ml-2">127</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">July 17, 2025</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Confirmed Guests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-wedding-red" />
                  <span className="text-2xl font-bold ml-2">78</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">of 150 invited</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Budget Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-2xl font-bold">$12,500</span>
                  <span className="text-xs text-gray-500 ml-2">/ $25,000</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                  <div className="h-2 bg-wedding-red rounded-full" style={{ width: "50%" }}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-wedding-red" />
                  <span className="text-2xl font-bold ml-2">24</span>
                  <span className="text-xs text-gray-500 ml-2">/ 45</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                  <div className="h-2 bg-wedding-red rounded-full" style={{ width: "53%" }}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks and Calendar Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Things you need to complete soon</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center p-2 rounded-md hover:bg-gray-100"
                    >
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        className="h-4 w-4 rounded border-gray-300 text-wedding-red focus:ring-wedding-red"
                      />
                      <span className={`ml-3 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Your next rituals and ceremonies</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex p-2 rounded-md hover:bg-gray-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-wedding-red/10 text-wedding-red">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarDays className="mr-1 h-3 w-3" />
                          {event.date}
                          <Clock className="ml-2 mr-1 h-3 w-3" />
                          {event.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-wedding-red" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md bg-gray-50 p-3 text-sm">
                    <p className="font-medium">Your catering quote is ready</p>
                    <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3 text-sm">
                    <p className="font-medium">5 guests have RSVP'd</p>
                    <p className="text-gray-500 text-xs mt-1">Yesterday</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flower className="mr-2 h-5 w-5 text-wedding-red" />
                  Featured Ritual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-2">Mehndi Ceremony</h3>
                <p className="text-sm text-gray-600 mb-4">
                  A beautiful ceremony where the bride's hands and feet are adorned with intricate henna designs.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <BookOpen size={18} className="mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-wedding-red" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about your wedding planning? Ask our AI assistant for help!
                </p>
                <Button className="w-full bg-wedding-red hover:bg-wedding-deepred" asChild>
                  <Link to="/dashboard/chat">Ask SanskaraAI</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="pt-4">
          <TaskTracker />
        </TabsContent>
        
        <TabsContent value="timeline" className="pt-4">
          <TimelineCreator />
        </TabsContent>
        
        <TabsContent value="moodboard" className="pt-4">
          <MoodBoard />
        </TabsContent>
        
        <TabsContent value="budget" className="pt-4">
          <BudgetManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
