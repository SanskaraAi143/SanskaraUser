
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChatWithAI from '@/components/chat/ChatWithAI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RitualChat from '@/components/chat/RitualChat';
import { useLocation } from 'react-router-dom';
import VendorChat from '@/components/chat/VendorChat';

const ChatPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("ai");
  
  useEffect(() => {
    // Check if there's state passed from navigation
    if (location.state) {
      const { initialTab, ritualName } = location.state as { initialTab?: string; ritualName?: string };
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [location]);
  
  return (
    <div className="space-y-6">
      <div className="bg-wedding-maroon/5 rounded-xl p-6 border border-wedding-maroon/20">
        <h1 className="text-2xl font-playfair text-wedding-maroon mb-2">
          Chat with Sanskara
        </h1>
        <p className="text-gray-600">
          Ask questions about Hindu wedding rituals, planning tips, vendors, or anything wedding-related.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="ai">General Assistant</TabsTrigger>
              <TabsTrigger value="ritual">Ritual Expert</TabsTrigger>
              <TabsTrigger value="vendor">Vendor Chat</TabsTrigger>
            </TabsList>
            <TabsContent value="ai" className="h-[560px]">
              <ChatWithAI />
            </TabsContent>
            <TabsContent value="ritual" className="h-[560px]">
              <RitualChat initialRitual={location.state?.ritualName} />
            </TabsContent>
            <TabsContent value="vendor" className="h-[560px]">
              <VendorChat />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Topics</CardTitle>
              <CardDescription>Popular questions to ask</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 rounded-md bg-wedding-red/10 text-wedding-red cursor-pointer hover:bg-wedding-red/20 transition-colors"
                onClick={() => {
                  setActiveTab("ritual");
                }}>
                Explain the Saptapadi ritual
              </div>
              <div className="p-2 rounded-md bg-wedding-red/10 text-wedding-red cursor-pointer hover:bg-wedding-red/20 transition-colors">
                How to choose a wedding date?
              </div>
              <div className="p-2 rounded-md bg-wedding-red/10 text-wedding-red cursor-pointer hover:bg-wedding-red/20 transition-colors"
                onClick={() => {
                  setActiveTab("ai");
                }}>
                Create a Mehndi ceremony plan
              </div>
              <div className="p-2 rounded-md bg-wedding-red/10 text-wedding-red cursor-pointer hover:bg-wedding-red/20 transition-colors">
                Find Hindu priests in my area
              </div>
              <div className="p-2 rounded-md bg-wedding-red/10 text-wedding-red cursor-pointer hover:bg-wedding-red/20 transition-colors">
                Sangeet night planning ideas
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>Your conversation history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-500 text-center text-sm italic">
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
