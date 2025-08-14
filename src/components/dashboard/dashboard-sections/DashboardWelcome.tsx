import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/services/api/userApi'; // Assuming UserProfile is exported from here

interface DashboardWelcomeProps {
  profile: UserProfile | null;
  userName: string | undefined; // From useAuth().user?.name
  weddingDate: string | undefined;
  daysUntilWedding: number | string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Renders the welcome section of the dashboard, displaying a greeting and wedding countdown.
 * @param {DashboardWelcomeProps} props - The props for the component.
 * @param {UserProfile | null} props.profile - The user's profile data.
 * @param {string | undefined} props.userName - The user's name from authentication context.
 * @param {string | undefined} props.weddingDate - The date of the wedding.
 * @param {number | string} props.daysUntilWedding - The number of days until the wedding.
 */
const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({ profile, userName, weddingDate, daysUntilWedding }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="bg-white/40 backdrop-blur-md rounded-xl p-6 border border-wedding-gold/20 shadow-lg"
    >
      <h1 className="text-3xl  text-wedding-gold mb-2 animate-fadeIn">
        Welcome back, {profile?.display_name || userName || "Friend"}!
      </h1>
      <p className="text-gray-600 animate-fadeIn delay-75">
        {weddingDate ? `Your wedding is in ${daysUntilWedding} days (${weddingDate})` : `Let's plan your dream wedding!`}
      </p>
    </motion.div>
  );
};

export default DashboardWelcome;