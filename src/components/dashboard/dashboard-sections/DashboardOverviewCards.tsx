import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface DashboardOverviewCardsProps {
  daysUntilWedding: number | string;
  weddingDate: string | undefined;
  confirmedGuests: number;
  invitedGuests: number;
  spentBudget: number;
  totalBudget: number;
  completedTasks: number;
  totalTasks: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Renders the overview cards section of the dashboard, displaying key wedding statistics.
 * @param {DashboardOverviewCardsProps} props - The props for the component.
 * @param {number | string} props.daysUntilWedding - The number of days until the wedding.
 * @param {string | undefined} props.weddingDate - The date of the wedding.
 * @param {number} props.confirmedGuests - The count of confirmed guests.
 * @param {number} props.invitedGuests - The count of invited guests.
 * @param {number} props.spentBudget - The amount of budget spent.
 * @param {number} props.totalBudget - The total allocated budget.
 * @param {number} props.completedTasks - The count of completed tasks.
 * @param {number} props.totalTasks - The total count of tasks.
 */
const DashboardOverviewCards: React.FC<DashboardOverviewCardsProps> = ({
  daysUntilWedding,
  weddingDate,
  confirmedGuests,
  invitedGuests,
  spentBudget,
  totalBudget,
  completedTasks,
  totalTasks,
}) => {
  return (
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
  );
};

export default DashboardOverviewCards;