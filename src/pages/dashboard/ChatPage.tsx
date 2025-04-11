
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChatWithAI from '@/components/chat/ChatWithAI';

const ChatPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-wedding-maroon/5 rounded-xl p-6 border border-wedding-maroon/20">
        <h1 className="text-2xl font-playfair text-wedding-maroon mb-2">
          Chat with Sanskara AI
        </h1>
        <p className="text-gray-600">
          Ask questions about Hindu wedding rituals, planning tips, vendors, or anything wedding-related.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px]">
          <ChatWithAI />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Topics</CardTitle>
              <CardDescription>Popular questions to ask</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 rounded-md bg-wedding-red/10 text-wedding-red cursor-pointer hover:bg-wedding-red/20 transition-colors">
                Explain the Saptapadi ritual
              </div>
              <div className="p-2 rounded-md bg-wedding-red/10 text-wedding-red cursor-pointer hover:bg-wedding-red/20 transition-colors">
                How to choose a wedding date?
              </div>
              <div className="p-2 rounded-md bg-wedding-red/10 text-wedding-red cursor-pointer hover:bg-wedding-red/20 transition-colors">
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
