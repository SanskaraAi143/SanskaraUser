import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import RitualChat from '@/components/chat/RitualChat';
import ChatInterfacePage from '@/pages/ChatInterfacePage';
import VendorChat from '@/components/chat/VendorChat';
import { useLocation } from 'react-router-dom';

interface SuggestedTopic {
  id: number;
  text: string;
  category: 'general' | 'ritual' | 'vendor';
}

const SUGGESTED_TOPICS: SuggestedTopic[] = [
  {
    id: 1,
    text: "Explain the Saptapadi ritual",
    category: "ritual"
  },
  {
    id: 2,
    text: "How to choose a wedding date?",
    category: "general"
  },
  {
    id: 3,
    text: "Create a Mehndi ceremony plan",
    category: "general"
  },
  {
    id: 4,
    text: "Find Hindu priests in my area",
    category: "vendor"
  },
  {
    id: 5,
    text: "Sangeet night planning ideas",
    category: "general"
  }
];

const ChatPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'general' | 'ritual' | 'vendor'>('general');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  useEffect(() => {
    if (location.state) {
      const { initialTab, ritualName } = location.state as { initialTab?: string; ritualName?: string };
      if (initialTab) {
        setActiveTab(initialTab as 'general' | 'ritual' | 'vendor');
      }
    }
  }, [location]);

  useEffect(() => {
    console.log("Active Tab:", activeTab);
  }, [activeTab]);

  const handleTopicClick = (topic: SuggestedTopic) => {
    console.log("Topic Clicked:", topic);
    setActiveTab(topic.category);
    setSelectedTopic(topic.text);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#fffbe7] rounded-xl p-6 border border-[#ffd700]/30">
        <h1 className="text-2xl font-playfair text-[#8d6e63] mb-2">
          Chat with Sanskara
        </h1>
        <p className="text-gray-600">
          Ask questions about Hindu wedding rituals, planning tips, vendors, or anything wedding-related.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'general' | 'ritual' | 'vendor')} className="w-full">
            <div className="bg-white rounded-lg p-1 mb-4 border border-[#ffd700]/30">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger 
                  value="general"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ffd700] data-[state=active]:to-[#ffecb3] data-[state=active]:text-[#8d6e63] py-3"
                >
                  General Assistant
                </TabsTrigger>
                <TabsTrigger 
                  value="ritual"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ffd700] data-[state=active]:to-[#ffecb3] data-[state=active]:text-[#8d6e63] py-3"
                >
                  Ritual Expert
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
              <TabsContent value="ritual" className="h-full mt-0">
                <RitualChat initialRitual={location.state?.ritualName} selectedTopic={selectedTopic} />
              </TabsContent>
              <TabsContent value="vendor" className="h-full mt-0">
                <VendorChat selectedTopic={selectedTopic} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Suggested Topics */}
          <Card className="border-[#ffd700]/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#8d6e63]">Suggested Topics</CardTitle>
              <CardDescription>Popular questions to ask</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {SUGGESTED_TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  className="p-2 rounded-md bg-[#ffd700]/10 text-[#8d6e63] cursor-pointer hover:bg-[#ffd700]/20 transition-colors"
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic.text}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card className="border-[#ffd700]/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#8d6e63]">Recent Conversations</CardTitle>
              <CardDescription>Your conversation history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[#8d6e63]/60 text-center text-sm italic">
                Your recent conversations will appear here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
