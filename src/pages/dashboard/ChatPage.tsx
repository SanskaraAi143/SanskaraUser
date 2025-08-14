import React from 'react';
import ChatInterfacePage from '@/pages/ChatInterfacePage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ChatPage: React.FC = () => {
  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle>AI Wedding Assistant</CardTitle>
      </CardHeader>
      <CardContent className="h-full pb-6">
        <ChatInterfacePage />
      </CardContent>
    </Card>
  );
};

export default ChatPage;
