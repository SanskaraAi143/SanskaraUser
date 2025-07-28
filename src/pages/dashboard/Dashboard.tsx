import React, { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Clock, Plus, Heart, Bell, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "@/services/supabase/config"; // Import supabase client

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskTracker from "@/components/dashboard/TaskTracker";
import TimelineCreator from "@/components/dashboard/TimelineCreator";
import MoodBoard from "@/components/dashboard/MoodBoard";
import BudgetManager from "@/components/dashboard/BudgetManager";
import { getCurrentUserProfile } from "@/services/api/userApi";
import { getUserTimelineEvents } from "@/services/api/timelineApi";
import { fetchGuestList } from "@/services/api/guestListApi";
import { getUserTasks } from "@/services/api/tasksApi";
import { getUserBudgetMax, getExpenses } from "@/services/api/budgetApi";
import { getUserVendors } from "@/services/api/vendorApi";
import { getUserMoodBoards } from "@/services/api/boardApi";
import { AnimatePresence, motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // State for all dashboard widgets
  const [profile, setProfile] = useState(null);
  const [weddingDetails, setWeddingDetails] = useState(null); // New state for wedding details
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [guests, setGuests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [budgetMax, setBudgetMax] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [moodBoards, setMoodBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // If user is logged in but has no wedding_id, redirect to onboarding page to start first partner flow
        if (user && !user.wedding_id) {
          console.log("User has no wedding_id. Redirecting to onboarding page.");
          navigate('/onboarding');
          setLoading(false);
          return;
        }

        // If user has a wedding_id but onboarding is still in progress, allow them to stay on dashboard
        // but wedding-specific data might be limited or display a message
        if (user && user.wedding_id && user.wedding_status === 'onboarding_in_progress') {
          console.log("User's wedding onboarding is in progress. Displaying limited dashboard data.");
          // Clear wedding-specific states as they are not fully set up yet
          setTimelineEvents([]);
          setGuests([]);
          setTasks([]);
          setBudgetMax(null);
          setExpenses([]);
          setVendors([]);
          setMoodBoards([]);
          setLoading(false);
          return;
        }

        // Only proceed with fetching full dashboard data if user is fully onboarded (wedding_status is 'active')
        if (user && user.wedding_id && user.wedding_status === 'active') {
          const profileData = await getCurrentUserProfile(user.internal_user_id);
          setProfile(profileData);
          const weddingId = user.wedding_id;

          const [
            weddingDataArray, // Fetch wedding details using Supabase
            events,
            guestList,
            userTasks,
            maxBudget,
            userExpenses,
            userVendors,
            userMoodBoards,
          ] = await Promise.all([
            supabase.from('weddings').select('*').eq('wedding_id', weddingId).single(),
            getUserTimelineEvents(weddingId),
            fetchGuestList(weddingId),
            getUserTasks(weddingId),
            getUserBudgetMax(user.internal_user_id),
            getExpenses(weddingId),
            getUserVendors(weddingId),
            getUserMoodBoards(weddingId),
          ]);

          const weddingData = weddingDataArray.data; // Extract data from Supabase response

          setWeddingDetails(weddingData); // Set new state
          setTimelineEvents(events || []);
          setGuests(guestList || []);
          setTasks(userTasks || []);
          setBudgetMax(maxBudget);
          setExpenses(userExpenses || []);
          setVendors(userVendors || []);
          setMoodBoards(userMoodBoards || []);

          // Debug logs:
          console.log('profile:', profileData);
          console.log('weddingDetails:', weddingData); // Log new state
          console.log('guests:', guestList);
          console.log('tasks:', userTasks);
          console.log('timelineEvents:', events);
          console.log('budgetMax:', maxBudget);
          console.log('expenses:', userExpenses);
        } else {
          // Fallback for cases where user is null or not fully active
          setTimelineEvents([]);
          setGuests([]);
          setTasks([]);
          setBudgetMax(null);
          setExpenses([]);
          setVendors([]);
          setMoodBoards([]);
        }
      } catch (e) {
        console.error('Dashboard fetchData error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, navigate]); // Add navigate to dependency array

  // Derived stats
  const confirmedGuests = guests.filter(g => g.status === "Confirmed").length;
  const invitedGuests = guests.length;
  const weddingDate = weddingDetails?.wedding_date; // Use from new state
  const daysUntilWedding = weddingDate ? Math.max(0, Math.ceil((new Date(weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : "-";
  const totalBudget = budgetMax || 0;
  const spentBudget = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const completedTasks = tasks.filter(t => t.is_complete).length;
  const totalTasks = tasks.length;
  const nextEvents = timelineEvents.slice(0, 3);
  const nextTasks = tasks
  .filter(t => {
    const status = (t.status || '').toLowerCase();
    return status === 'doing' || status === 'to do';
  })
  .sort((a, b) => {
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return 0;
  })
  .slice(0, 3);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div initial="hidden" animate="visible" variants={cardVariants} className="bg-white/40 backdrop-blur-md rounded-xl p-6 border border-wedding-gold/20 shadow-lg">
        <h1 className="text-3xl font-playfair text-wedding-gold mb-2 animate-fadeIn">
          Welcome back, {profile?.display_name || user?.name || "Friend"}!
        </h1>
        <p className="text-gray-600 animate-fadeIn delay-75">
          {weddingDate ? `Your wedding is in ${daysUntilWedding} days (${weddingDate})` : `Let's plan your dream wedding!`}
        </p>
      </motion.div>

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
          <Suspense fallback={<div className="animate-pulse text-center text-gray-400">Loading dashboard...</div>}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatePresence>
                <motion.div key="days-until-wedding" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Days Until Wedding</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <CalendarDays className="h-5 w-5 text-wedding-red animate-pulse" />
                        <motion.span className="text-2xl font-bold ml-2" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>{daysUntilWedding}</motion.span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{weddingDate || "-"}</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div key="confirmed-guests" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Confirmed Guests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-wedding-red animate-fadeIn" />
                        <motion.span className="text-2xl font-bold ml-2" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>{confirmedGuests}</motion.span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">of {invitedGuests} invited</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div key="budget-status" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Budget Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold ml-2">₹{spentBudget.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 ml-2">/ ₹{totalBudget.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                        <motion.div className="h-2 bg-wedding-red rounded-full" style={{ width: `${totalBudget ? Math.min(100, (spentBudget / totalBudget) * 100) : 0}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div key="tasks-completed" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Tasks Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-wedding-red animate-fadeIn" />
                        <motion.span className="text-2xl font-bold ml-2" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>{completedTasks}</motion.span>
                        <span className="text-xs text-gray-500 ml-2">/ {totalTasks}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                        <motion.div className="h-2 bg-wedding-red rounded-full" style={{ width: `${totalTasks ? Math.min(100, (completedTasks / totalTasks) * 100) : 0}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Upcoming Tasks & Events */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
                <Card className="glass-card">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Upcoming Tasks</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
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

              <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
                <Card className="glass-card">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Upcoming Events</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
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
            </div>

            {/* Additional Sections: Notifications, Ritual, AI Assistant */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5 text-wedding-red" /> Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-md bg-gray-50 p-3 text-sm">
                        <p className="font-medium">Vendor updates and important reminders will appear here.</p>
                        <p className="text-gray-500 text-xs mt-1">(Coming soon)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="mr-2 h-5 w-5 text-wedding-red" /> AI Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Have questions about your wedding planning? Ask our AI assistant for help!</p>
                    <Button className="w-full bg-wedding-red hover:bg-wedding-deepred" asChild>
                      <Link to="/dashboard/chat">Ask SanskaraAI</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </Suspense>
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
