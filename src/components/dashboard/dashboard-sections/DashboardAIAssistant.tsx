import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Renders the AI Assistant section of the dashboard.
 */
const DashboardAIAssistant: React.FC = () => {
  return (
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
  );
};

export default DashboardAIAssistant;