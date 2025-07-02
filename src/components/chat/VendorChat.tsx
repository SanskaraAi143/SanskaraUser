import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Calendar, Clock, Phone, Video, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import * as chatApi from '@/services/api/chatApi';
import type { UserChatMessage, ChatParticipant, ChatMessageContent } from '@/services/api/chatApi';
import { supabase } from '@/services/supabase/config'; // For Realtime

interface VendorChatProps {
  sessionId: string;
  otherParticipant: ChatParticipant;
}

const VendorChat: React.FC<VendorChatProps> = ({ sessionId, otherParticipant }) => {
  const { user, vendorProfile } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<UserChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial messages
  useEffect(() => {
    if (!sessionId) return;
    setIsLoadingMessages(true);
    setError(null);
    chatApi.getChatMessages(sessionId)
      .then(setMessages)
      .catch(err => {
        console.error("Error fetching messages:", err);
        setError("Could not load messages.");
        toast({ variant: "destructive", title: "Error", description: "Failed to load messages." });
      })
      .finally(() => setIsLoadingMessages(false));
  }, [sessionId, toast]);

  // Auto-scroll on new messages
  useEffect(scrollToBottom, [messages]);

  // Supabase Realtime subscription for new messages
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`vendor-chat-${sessionId}`)
      .on<chatApi.UserChatMessage>( // Specify the payload type if possible, though DB direct payload is different
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` },
        async (payload) => {
          const newMessageRaw = payload.new as any; // Raw DB record
          // We need to reconstruct UserChatMessage as getChatMessages does
          // For simplicity, we'll refetch the specific message or assume it's properly formatted by a trigger/function (not current setup)
          // A more robust way: fetch the newly inserted message by its ID to get all joined data.
          // Or, make sure the Realtime event contains enough info (e.g., via DB functions)

          // Quick and dirty: if the sender_type and sender_name match our current users, map it.
          // This is not ideal as it doesn't fully reconstruct the ChatParticipant object.
          // A better way is to fetch the message by ID or have the backend push a fully formed UserChatMessage.
          // For now, we'll add it and assume the structure is somewhat compatible or rely on optimistic updates.

          // Let's try to fetch the newly inserted message to get its full structure
          try {
            const fetchedMessages = await chatApi.getChatMessages(sessionId);
            // This is inefficient but ensures data consistency.
            // A more optimized approach would be to fetch just the new message by ID.
            setMessages(fetchedMessages);
          } catch (err) {
            console.error("Error refetching messages after realtime event:", err);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') console.log(`Subscribed to session ${sessionId}`);
        if (err) console.error(`Error subscribing to session ${sessionId}:`, err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);


  const getCurrentParticipant = (): ChatParticipant | null => {
    if (vendorProfile) { // Logged in as vendor
      return { id: vendorProfile.vendorId, name: vendorProfile.vendorName || 'Vendor', type: 'vendor' };
    }
    if (user) { // Logged in as user
      return { id: user.id, name: user.name || 'User', type: 'user' };
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || sendingMessage) return;
    
    const sender = getCurrentParticipant();
    if (!sender) {
      toast({ variant: "destructive", title: "Error", description: "Could not identify sender." });
      return;
    }

    setSendingMessage(true);
    const optimisticMessage: UserChatMessage = {
      messageId: `temp-${Date.now()}`,
      sessionId,
      sender,
      content: { type: 'text', text: inputMessage },
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);
    const currentInput = inputMessage;
    setInputMessage('');

    try {
      const sentMessage = await chatApi.sendTextMessage(sessionId, currentInput, sender);
      setMessages(prev => prev.map(m => m.messageId === optimisticMessage.messageId ? sentMessage : m));
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
      setMessages(prev => prev.filter(m => m.messageId !== optimisticMessage.messageId)); // Remove optimistic
      setInputMessage(currentInput); // Restore input
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const sender = getCurrentParticipant();
    if (!sender) {
      toast({ variant: "destructive", title: "Error", description: "Could not identify sender for file upload." });
      return;
    }
    
    setUploadingImage(true);
    try {
      const { publicUrl } = await chatApi.uploadChatImage(file, sessionId);
      const sentMessage = await chatApi.sendImageMessage(sessionId, publicUrl, file.name, sender);
      setMessages(prev => [...prev, sentMessage]); // Add the confirmed message
    } catch (error) {
      console.error("Error uploading or sending image message:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send image." });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user && !vendorProfile) {
    return <div className="p-4 text-center">Please log in to chat.</div>;
  }

  const loggedInParticipant = getCurrentParticipant();

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
      {/* Chat Header */}
      <div className="bg-gray-100 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={undefined /* TODO: otherParticipant.avatarUrl */} alt={otherParticipant.name} />
            <AvatarFallback className="bg-wedding-maroon text-white">
              {otherParticipant.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherParticipant.name}</h3>
            <p className="text-xs text-gray-500">
              {otherParticipant.type === 'vendor' ? 'Vendor Contact' : 'Customer'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* TODO: Implement Phone/Video call functionality or remove if not planned */}
          <Button size="icon" variant="ghost" className="rounded-full" disabled> <Phone className="h-4 w-4" /> </Button>
          <Button size="icon" variant="ghost" className="rounded-full" disabled> <Video className="h-4 w-4" /> </Button>
        </div>
      </div>
      
      {/* Optional: Context bar (e.g., booking details) - This was static, could be dynamic */}
      {/* <div className="bg-wedding-maroon/5 p-2 flex items-center justify-between text-sm"> ... </div> */}
      <Separator />
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoadingMessages && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-wedding-maroon" />
          </div>
        )}
        {!isLoadingMessages && error && (
          <div className="flex flex-col justify-center items-center h-full text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{error}</p>
          </div>
        )}
        {!isLoadingMessages && !error && messages.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <ImageIcon className="h-8 w-8 mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div className="space-y-6">
          {messages.map((message) => (
            <div 
              key={message.messageId}
              className={`flex ${message.sender.id === loggedInParticipant?.id ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender.id !== loggedInParticipant?.id && (
                <Avatar className="h-8 w-8 mt-1 mr-2 flex-shrink-0">
                  <AvatarImage src={undefined /* TODO: message.sender.avatarUrl */} alt={message.sender.name} />
                  <AvatarFallback className="bg-wedding-maroon text-white">
                    {message.sender.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div 
                className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                  message.sender.id === loggedInParticipant?.id
                    ? 'bg-wedding-red text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {message.content.type === 'text' && <p>{message.content.text}</p>}
                {message.content.type === 'image' && (
                  <img
                    src={message.content.imageUrl}
                    alt={message.content.altText || 'Chat image'}
                    className="rounded-md max-w-xs max-h-64 object-contain cursor-pointer"
                    onClick={() => window.open(message.content.imageUrl, '_blank')}
                  />
                )}
                <div className={`text-xs mt-1 ${message.sender.id === loggedInParticipant?.id ? 'text-white/70' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <Separator />
      
      {/* Input Area */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} disabled={uploadingImage} />
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
            {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip size={18} />}
          </Button>
          <div className="flex-grow relative">
            <Input
              placeholder={`Message ${otherParticipant.name}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-12 rounded-full"
              disabled={sendingMessage || uploadingImage}
            />
            <Button 
              size="icon" 
              className="absolute right-1 top-1 h-8 w-8 bg-wedding-red hover:bg-wedding-deepred rounded-full"
              onClick={handleSendMessage}
              disabled={inputMessage.trim() === '' || sendingMessage || uploadingImage}
            >
              {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send size={16} className="text-white" />}
            </Button>
          </div>
        </div>
        {/* <p className="text-xs text-gray-500 text-center mt-2"> ... </p> */}
      </div>
    </div>
  );
};

export default VendorChat;
