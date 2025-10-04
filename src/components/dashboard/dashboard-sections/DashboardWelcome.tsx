import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-playfair text-wedding-gold mb-2 animate-fadeIn">
            Welcome back, {profile?.display_name || userName || "Friend"}!
          </h1>
          <p className="text-gray-600 animate-fadeIn delay-75">
            {weddingDate ? `Your wedding is in ${daysUntilWedding} days (${weddingDate})` : `Let's plan your dream wedding!`}
          </p>
        </div>
        <Link
          to="/chat"
          className="flex items-center gap-2 px-4 py-2 bg-wedding-gold text-white rounded-lg shadow-md hover:bg-wedding-gold/90 transition-colors"
        >
          <MessageCircle size={18} />
          <span>Start Chat</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default DashboardWelcome;