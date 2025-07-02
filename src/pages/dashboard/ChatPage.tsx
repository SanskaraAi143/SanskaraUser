import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatWithAI from '@/components/chat/ChatWithAI';
import RitualChat from '@/components/chat/RitualChat';
import VendorChat from '@/components/chat/VendorChat';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as chatApi from '@/services/api/chatApi';
import type { UserChatSession, ChatMessageContent } from '@/services/api/chatApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Users, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


interface SuggestedTopic {
  id: number;
  text: string;
  category: 'general' | 'ritual' | 'vendor';
}

const SUGGESTED_TOPICS: SuggestedTopic[] = [
  // ... (keeping existing suggested topics)
  { id: 1, text: "Explain the Saptapadi ritual", category: "ritual" },
  { id: 2, text: "How to choose a wedding date?", category: "general" },
  { id: 3, text: "Create a Mehndi ceremony plan", category: "general" },
  // { id: 4, text: "Find Hindu priests in my area", category: "vendor" }, // Vendor topics might come from vendor list
  { id: 5, text: "Sangeet night planning ideas", category: "general" }
];

const ChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, vendorProfile, loading: authLoading, isVendorLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'general' | 'ritual' | 'vendor'>('general');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  const [vendorChatSessions, setVendorChatSessions] = useState<UserChatSession[]>([]);
  const [activeVendorSession, setActiveVendorSession] = useState<UserChatSession | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  useEffect(() => {
    // Handle initial tab and topic from location state (e.g., coming from "Chat with Vendor" button)
    if (location.state) {
      const { initialTab, ritualName, vendorIdToChat, vendorName } = location.state as {
        initialTab?: 'general' | 'ritual' | 'vendor';
        ritualName?: string;
        vendorIdToChat?: string;
        vendorName?: string;
      };
      if (initialTab) setActiveTab(initialTab);
      if (ritualName) setSelectedTopic(`Tell me more about ${ritualName}`); // Example

      if (initialTab === 'vendor' && vendorIdToChat && user) {
        // Initiate chat if vendorIdToChat is provided
        const initiateAndSetActive = async () => {
          try {
            setSessionsLoading(true);
            const { sessionId } = await chatApi.initiateChat(user.id, vendorIdToChat);
            // Find or create a temporary session object to make it active
            // Ideally, we'd refetch sessions, but for now, let's make a synthetic one
            // or find it if it was just created and refetched.
            // For simplicity, we'll rely on the main fetch to pick it up or create a temp one.
             const tempSession: UserChatSession = {
              sessionId,
              otherParticipant: { id: vendorIdToChat, name: vendorName || 'Vendor', type: 'vendor' },
              lastMessage: null,
              lastUpdatedAt: new Date().toISOString(),
            };
            setActiveVendorSession(tempSession);
            // Clear location state after processing
            navigate(location.pathname, { replace: true, state: {} });
          } catch (error) {
            console.error("Error initiating vendor chat:", error);
            setSessionsError("Failed to start chat with vendor.");
          } finally {
            setSessionsLoading(false);
          }
        };
        initiateAndSetActive();
      }
    }
  }, [location, user, navigate]);

  useEffect(() => {
    if (authLoading || isVendorLoading) return; // Wait for auth to be ready

    if (user) {
      setSessionsLoading(true);
      setSessionsError(null);
      const isVendor = !!vendorProfile;
      const entityId = isVendor ? vendorProfile.vendorId : user.id;

      chatApi.getChatSessions(user.id, isVendor, entityId)
        .then(sessions => {
          setVendorChatSessions(sessions);
          // If there was a temp active session, try to find it in the fetched list
          if (activeVendorSession && !sessions.find(s => s.sessionId === activeVendorSession.sessionId)) {
            // If not found, it means it might be a very new session not yet picked up by list,
            // or the temp session was based on outdated info.
            // For now, if not found, we clear it to avoid issues. A better approach might be to merge.
            const refreshedSession = sessions.find(s => s.sessionId === activeVendorSession.sessionId);
            if (refreshedSession) setActiveVendorSession(refreshedSession);
            // else setActiveVendorSession(null); // Or keep the temp one if confident
          } else if (!activeVendorSession && sessions.length > 0 && activeTab === 'vendor') {
             // If no active session and on vendor tab, select the first one
            // setActiveVendorSession(sessions[0]); // Potentially auto-select first vendor chat
          }
        })
        .catch(err => {
          console.error("Error fetching chat sessions:", err);
          setSessionsError("Could not load your conversations.");
        })
        .finally(() => setSessionsLoading(false));
    } else {
      setVendorChatSessions([]);
      setActiveVendorSession(null);
    }
  }, [user, vendorProfile, authLoading, isVendorLoading, activeTab]);


  const handleTopicClick = (topic: SuggestedTopic) => {
    setActiveTab(topic.category);
    setSelectedTopic(topic.text);
    if (topic.category !== 'vendor') {
      setActiveVendorSession(null); // Clear active vendor chat if switching to AI tabs
    }
  };

  const handleVendorSessionClick = (session: UserChatSession) => {
    setActiveVendorSession(session);
    setActiveTab('vendor');
    setSelectedTopic(null); // Clear AI topic selection
  };

  const getAbbreviatedText = (content: ChatMessageContent | null | undefined): string => {
    if (!content) return "No messages yet";
    if (content.type === 'text') {
      return content.text.length > 30 ? content.text.substring(0, 27) + "..." : content.text;
    }
    if (content.type === 'image') {
      return "📷 Image";
    }
    return "Unsupported message type";
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#fffbe7] rounded-xl p-6 border border-[#ffd700]/30">
        <h1 className="text-2xl font-playfair text-[#8d6e63] mb-2">
          Chat with Sanskara
        </h1>
        <p className="text-gray-600">
          Ask questions about Hindu wedding rituals, planning tips, or chat with your vendors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={(value) => {
            const newTab = value as 'general' | 'ritual' | 'vendor';
            setActiveTab(newTab);
            if (newTab !== 'vendor') setActiveVendorSession(null);
            else if (newTab === 'vendor' && vendorChatSessions.length > 0 && !activeVendorSession) {
              // Optionally, select the first vendor chat if switching to vendor tab and none is active
              // setActiveVendorSession(vendorChatSessions[0]);
            }
          }} className="w-full">
            <div className="bg-white rounded-lg p-1 mb-4 border border-[#ffd700]/30">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="general" /* className styling */>General Assistant</TabsTrigger>
                <TabsTrigger value="ritual" /* className styling */>Ritual Expert</TabsTrigger>
                <TabsTrigger value="vendor" /* className styling */>Vendor Chat</TabsTrigger>
              </TabsList>
            </div>

            <div className="h-[calc(100vh-280px)] min-h-[560px]"> {/* Adjusted height */}
              <TabsContent value="general" className="h-full mt-0">
                <ChatWithAI selectedTopic={selectedTopic} />
              </TabsContent>
              <TabsContent value="ritual" className="h-full mt-0">
                <RitualChat initialRitual={location.state?.ritualName} selectedTopic={selectedTopic} />
              </TabsContent>
              <TabsContent value="vendor" className="h-full mt-0">
                {activeVendorSession ? (
                  <VendorChat
                    key={activeVendorSession.sessionId} // Ensure re-mount on session change
                    sessionId={activeVendorSession.sessionId}
                    otherParticipant={activeVendorSession.otherParticipant}
                    // selectedTopic={selectedTopic} // selectedTopic is for AI, clear it for vendor chat
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-200 p-6">
                    <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-1">Select a Vendor Conversation</h3>
                    <p className="text-gray-500 text-center">Choose a conversation from the 'Recent Conversations' list to start chatting with a vendor.</p>
                    {vendorChatSessions.length === 0 && !sessionsLoading && (
                       <p className="text-gray-400 text-sm mt-2">You have no vendor conversations yet.</p>
                    )}
                     {sessionsLoading && <p className="text-gray-400 text-sm mt-2">Loading conversations...</p>}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Recent Vendor Conversations */}
          <Card className="border-[#ffd700]/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#8d6e63]">Vendor Chats</CardTitle>
                  <CardDescription>Your conversations with vendors</CardDescription>
                </div>
                <Users className="w-5 h-5 text-[#8d6e63]" />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-3"> {/* Added pr-3 for scrollbar space */}
                {sessionsLoading && (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2 mb-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                )}
                {!sessionsLoading && sessionsError && (
                  <div className="text-red-500 text-sm p-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {sessionsError}
                  </div>
                )}
                {!sessionsLoading && !sessionsError && vendorChatSessions.length === 0 && (
                  <p className="text-[#8d6e63]/60 text-center text-sm italic py-4">
                    No vendor conversations yet.
                  </p>
                )}
                {!sessionsLoading && !sessionsError && vendorChatSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-[#fffbe7] ${
                      activeVendorSession?.sessionId === session.sessionId ? 'bg-[#fffbe7] border border-[#ffd700]/50' : 'bg-transparent'
                    }`}
                    onClick={() => handleVendorSessionClick(session)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        {/* TODO: Add dynamic avatar for vendor/user */}
                        <AvatarImage src={undefined} alt={session.otherParticipant.name} />
                        <AvatarFallback className="bg-wedding-maroon text-white">
                          {session.otherParticipant.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-sm text-[#5d4037]">{session.otherParticipant.name}</h4>
                        <p className="text-xs text-gray-500 truncate">
                           {session.lastMessage?.sender.type === user?.id ? 'You: ' : ''}
                           {getAbbreviatedText(session.lastMessage?.content)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Suggested Topics (Kept for AI chats) */}
          {activeTab !== 'vendor' && (
            <Card className="border-[#ffd700]/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#8d6e63]">Suggested Topics</CardTitle>
                <CardDescription>Popular questions to ask</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {SUGGESTED_TOPICS.filter(t => t.category === activeTab || t.category === 'general').map((topic) => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
