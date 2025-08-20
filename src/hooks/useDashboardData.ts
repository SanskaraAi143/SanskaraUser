import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserProfile, useUserProfile } from "@/services/api/userApi";
import { TimelineEvent, useUserTimelineEvents } from "@/services/api/timelineApi";
import { Guest, useGuestList } from "@/services/api/guestListApi";
import { Task, useUserTasks } from "@/services/api/tasksApi";
import { useUserBudgetMax, useExpenses, Expense } from "@/services/api/budgetApi";
import { UserShortlistedVendorItem, useUserVendors } from "@/services/api/vendorApi";
import { MoodBoard } from "@/services/api/boardApi";
import { useQuery } from '@tanstack/react-query'; // Add this import
import { getUserMoodBoards } from "@/services/api/boardApi";
import { useWeddingDetails, WeddingDetails } from "@/services/api/weddingApi";
import { useNavigate } from "react-router-dom";

export interface DashboardData {
  profile: UserProfile | null;
  weddingDetails: WeddingDetails | null;
  timelineEvents: TimelineEvent[];
  guests: Guest[];
  tasks: Task[];
  budgetMax: number | null;
  expenses: Expense[];
  vendors: UserShortlistedVendorItem[];
  moodBoards: MoodBoard[];
  loading: boolean;
  error: string | null;
  daysUntilWedding: number | string;
  confirmedGuests: number;
  invitedGuests: number;
  totalBudget: number;
  spentBudget: number;
  completedTasks: number;
  totalTasks: number;
  nextTasks: Task[];
  nextEvents: TimelineEvent[];
}

/**
 * Custom hook to fetch and manage all dashboard-related data.
 * It handles user authentication status, redirects to onboarding if necessary,
 * and fetches various data points concurrently.
 *
 * @returns {DashboardData} An object containing all dashboard data, loading state, and error.
 */
export const useDashboardData = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const internalUserId = user?.internal_user_id || "";
  const weddingId = user?.wedding_id || "";
  const weddingStatus = user?.wedding_status;

  // React Query hooks
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile(internalUserId);
  const { data: weddingDetails, isLoading: weddingDetailsLoading, error: weddingDetailsError } = useWeddingDetails(weddingId);
  const { data: timelineEvents, isLoading: timelineEventsLoading, error: timelineEventsError } = useUserTimelineEvents(weddingId);
  const { data: guests, isLoading: guestsLoading, error: guestsError } = useGuestList(weddingId);
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useUserTasks(weddingId);
  const { data: budgetMax, isLoading: budgetMaxLoading, error: budgetMaxError } = useUserBudgetMax(internalUserId);
  const { data: expenses, isLoading: expensesLoading, error: expensesError } = useExpenses(weddingId);
  const { data: vendors, isLoading: vendorsLoading, error: vendorsError } = useUserVendors(weddingId);
  const { data: moodBoards, isLoading: moodBoardsLoading, error: moodBoardsError } = useQuery({
    queryKey: ['userMoodBoards', weddingId],
    queryFn: () => getUserMoodBoards(weddingId),
    enabled: !!weddingId,
  });

  const loading = profileLoading || weddingDetailsLoading || timelineEventsLoading || guestsLoading || tasksLoading || budgetMaxLoading || expensesLoading || vendorsLoading || moodBoardsLoading;
  const error = profileError?.message || weddingDetailsError?.message || timelineEventsError?.message || guestsError?.message || tasksError?.message || budgetMaxError?.message || expensesError?.message || vendorsError?.message || moodBoardsError?.message || null;

  useEffect(() => {
    if (!user) {
      // User not logged in, handle accordingly (e.g., redirect to login)
      return;
    }

    // If user is logged in but has no wedding_id, redirect to onboarding page
    if (!weddingId) {
      console.log("User has no wedding_id. Redirecting to onboarding page.");
      navigate('/onboarding');
      return;
    }

    // If user has a wedding_id but onboarding is still in progress, display limited data
    if (weddingId && weddingStatus === 'onboarding_in_progress') {
      console.log("User's wedding onboarding is in progress. Displaying limited dashboard data.");
      // Data will be null or empty arrays from React Query hooks, which is desired for limited data.
      return;
    }
  }, [user, weddingId, weddingStatus, navigate]);

  // Derived stats
  const confirmedGuests = guests?.filter(g => g.status === "Confirmed").length || 0;
  const invitedGuests = guests?.length || 0;
  const weddingDate = weddingDetails?.wedding_date;
  const daysUntilWedding = weddingDate ? Math.max(0, Math.ceil((new Date(weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : "-";
  // Parse budget from wedding details (single source of truth), fallback to user preferences
  const parseIndianBudget = (val: any): number | null => {
    if (val == null) return null;
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val !== 'string') return null;
    const s = val.toString().trim().toLowerCase().replace(/[,\s]+/g, '');
    const numMatch = s.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (!numMatch) return null;
    const n = parseFloat(numMatch[1]);
    if (isNaN(n)) return null;
    if (s.includes('cr') || s.includes('crore')) return Math.round(n * 10000000);
    if (s.includes('l') || s.includes('lakh')) return Math.round(n * 100000);
    return Math.round(n);
  };

  const extractBudgetFromDetails = (details: any, email?: string): number | null => {
    if (!details) return null;
    // Prefer a consolidated field if present
    const topLevel = parseIndianBudget(details.budget_total || details.total_budget || details.budget || details.estimated_budget);
    if (topLevel) return topLevel;
    const pd = details.partner_data || {};
    // Prefer current user's entry
    if (email && pd[email]?.budget_range) {
      const val = parseIndianBudget(pd[email].budget_range);
      if (val) return val;
    }
    // Else, take the first available budget_range
    for (const key of Object.keys(pd)) {
      const val = parseIndianBudget(pd[key]?.budget_range);
      if (val) return val;
    }
    return null;
  };

  const onboardingBudget = extractBudgetFromDetails(weddingDetails?.details, user?.email || undefined);
  const totalBudget = (onboardingBudget ?? budgetMax) || 0;
  const spentBudget = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const completedTasks = tasks?.filter(t => t.is_complete).length || 0;
  const totalTasks = tasks?.length || 0;
  const nextEvents = timelineEvents?.slice(0, 3) || [];
  const nextTasks = (tasks || [])
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

  return {
    profile,
    weddingDetails,
    timelineEvents: timelineEvents || [],
    guests: guests || [],
    tasks: tasks || [],
    budgetMax,
    expenses: expenses || [],
    vendors: vendors || [],
    moodBoards: moodBoards || [],
    loading,
    error,
    daysUntilWedding,
    confirmedGuests,
    invitedGuests,
    totalBudget,
    spentBudget,
    completedTasks,
    totalTasks,
    nextTasks,
    nextEvents,
  };
};