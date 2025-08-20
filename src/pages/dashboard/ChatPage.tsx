import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ChatInterfacePage from '@/pages/ChatInterfacePage';
import VendorChat from '@/components/chat/VendorChat'; // Re-add VendorChat import
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const ChatPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'general' | 'vendor'>('general');

  useEffect(() => {
    if (location.state) {
      const { initialTab } = location.state as { initialTab?: string };
      if (initialTab) {
        setActiveTab(initialTab as 'general' | 'vendor');
      }
    }
  }, [location]);

  const { user, loading: authLoading } = useAuth(); // Get user and authLoading from AuthContext
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!authLoading && user && !user.wedding_id) {
      console.log("ChatPage: User has no wedding yet. Redirecting to onboarding page.");
      navigate('/onboarding');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    console.log("Active Tab:", activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Removed: Chat with Sanskara heading */}

      <div className="grid grid-cols-1 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'general' | 'vendor')} className="w-full">
            <div className="bg-white rounded-lg p-1 mb-4 border border-[#ffd700]/30">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger
                  value="general"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ffd700] data-[state=active]:to-[#ffecb3] data-[state=active]:text-[#8d6e63] py-3"
                >
                  General Assistant
                </TabsTrigger>
                <TabsTrigger
                  value="vendor"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ffd700] data-[state=active]:to-[#ffecb3] data-[state=active]:text-[#8d6e63] py-3"
                >
                  Vendor Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="h-[560px]">
              <TabsContent value="general" className="h-full mt-0">
                <ChatInterfacePage />
              </TabsContent>
              <TabsContent value="vendor" className="h-full mt-0">
                <VendorChat selectedTopic={null} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
