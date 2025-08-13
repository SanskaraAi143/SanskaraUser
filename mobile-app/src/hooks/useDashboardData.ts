import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserProfile, useUserProfile } from "../services/api/userApi";
import { TimelineEvent, useUserTimelineEvents } from "../services/api/timelineApi";
import { Guest, useGuestList } from "../services/api/guestListApi";
import { Task, useUserTasks } from "../services/api/tasksApi";
import { useUserBudgetMax, useExpenses, Expense } from "../services/api/budgetApi";
import { UserShortlistedVendorItem, useUserVendors } from "../services/api/vendorApi";
import { MoodBoard } from "../services/api/boardApi";
import { useQuery } from '@tanstack/react-query';
import { getUserMoodBoards } from "../services/api/boardApi";
import { useWeddingDetails, WeddingDetails } from "../services/api/weddingApi";

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
  shouldRedirectToOnboarding: boolean;
}

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth();

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

  const shouldRedirectToOnboarding = !loading && user && !weddingId;

  // Derived stats
  const confirmedGuests = guests?.filter(g => g.status === "Confirmed").length || 0;
  const invitedGuests = guests?.length || 0;
  const weddingDate = weddingDetails?.wedding_date;
  const daysUntilWedding = weddingDate ? Math.max(0, Math.ceil((new Date(weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : "-";
  const totalBudget = budgetMax || 0;
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
    shouldRedirectToOnboarding,
  };
};
