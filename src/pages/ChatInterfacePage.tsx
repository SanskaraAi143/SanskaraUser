import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Mic, User, Bot } from 'lucide-react';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Room, RoomEvent, RemoteTrack, RemoteTrackPublication, RemoteParticipant } from 'livekit-client';

const ChatInterfacePage: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling
  
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string, files?: File[] }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false); // New state for typing indicator
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  

  const handleSendMessage = () => {
    if (inputMessage.trim() || selectedFiles.length > 0) {
      const userMessageContent = inputMessage.trim();
      setMessages(prevMessages => [...prevMessages, { role: 'user', content: userMessageContent, files: selectedFiles }]);
      setInputMessage('');
      setSelectedFiles([]); // Clear selected files after sending
      // No direct AI response here, it will come from LiveKit Agent
    }
  };

  const handleMicButtonClick = async () => {
    if (!room || !isConnected) {
      // Connect to LiveKit Room
      setIsConnecting(true);
      setMessages(prevMessages => [...prevMessages, { role: 'ai', content: "Connecting to LiveKit room..." }]);
      try {
        // Replace with your LiveKit URL and a generated token
        // For testing, you can generate a token from LiveKit Cloud console
        // or use a simple token server (Phase 3)
        const livekitUrl = "wss://sanskaraai-79djqd7l.livekit.cloud"; // Replace with your LiveKit URL
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic2Fuc2thcmEtYWktY2hhdCIsInZpZGVvIjp7InJvb21Kb2luIjp0cnVlLCJyb29tIjoic2Fuc2thcmEtYWktY2hhdCIsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZSwiY2FuUHVibGlzaERhdGEiOnRydWV9LCJzdWIiOiJmcm9udGVuZC11c2VyIiwiaXNzIjoiQVBJSHpBeXVNYVR5UGdNIiwibmJmIjoxNzUyMDU5MjQ4LCJleHAiOjE3NTIwODA4NDh9.WKKuRX2qnQFWx8z257YsFilxkU4aYyTH-MNRZ0l-2ok"; 
        // Replace with a valid LiveKit Join Token

        const newRoom = new Room();
        newRoom.on(RoomEvent.Connected, () => {
          console.log('Connected to LiveKit room');
          setIsConnected(true);
          setIsConnecting(false);
          setMessages(prevMessages => [...prevMessages, { role: 'ai', content: "Connected to LiveKit room. You can now speak." }]);
          // Publish microphone audio
          newRoom.localParticipant.setMicrophoneEnabled(true);
        });
        newRoom.on(RoomEvent.Disconnected, () => {
          console.log('Disconnected from LiveKit room');
          setIsConnected(false);
          setIsConnecting(false);
          setMessages(prevMessages => [...prevMessages, { role: 'ai', content: "Disconnected from LiveKit room." }]);
        });
        newRoom.on(RoomEvent.TrackPublished, (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (publication.kind === 'audio' && !participant.isLocal) {
            // Play remote audio (agent's response)
            publication.track?.attach();
          }
        });
        newRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === 'audio' && !participant.isLocal) {
            // Play remote audio (agent's response)
            track.attach();
          }
        });
        newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers: RemoteParticipant[]) => {
          // Optional: Update UI based on active speakers
          // console.log('Active speakers:', speakers.map(s => s.identity));
        });

        await newRoom.connect(livekitUrl, token);
        setRoom(newRoom);

      } catch (error) {
        console.error('Error connecting to LiveKit:', error);
        setIsConnecting(false);
        setMessages(prevMessages => [...prevMessages, { role: 'ai', content: `Error connecting to LiveKit: ${error.message}` }]);
      }
    } else {
      // Disconnect from LiveKit Room
      room?.disconnect();
      setRoom(null);
    }
  };

  

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-[#ffd700]/30">
      {/* Chat Mode (Sanskara Only) */}
      <div className="p-2 border-b border-[#ffd700]/30 text-center text-lg font-semibold text-[#8d6e63] bg-[#fffbe7] rounded-t-lg">
        Sanskara AI Assistant
      </div>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4" ref={messagesEndRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2.5 max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className={msg.role === 'user' ? 'bg-[#ffd700]/20' : 'bg-[#ff8f00]/20'}>
                  <AvatarFallback>
                    {msg.role === 'user' ?
                      <User className="text-[#ffd700]" /> :
                      <Bot className="text-[#ff8f00]" />
                    }
                  </AvatarFallback>
                </Avatar>
                <div className={`p-3 rounded-lg shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.content}
                  {msg.files && msg.files.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      Files: {msg.files.map(file => file.name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2.5 max-w-[70%]">
                <Avatar className="bg-[#ff8f00]/20">
                  <AvatarFallback>
                    <Bot className="text-[#ff8f00]" />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-[#ff8f00] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#ff8f00] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#ff8f00] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Proactive Assistance Placeholder */}
      <div className="p-4 border-t border-[#ffd700]/30 bg-white">
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Sanskara AI:</span> Proactive suggestions will appear here.
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#ffd700]/30 bg-white">
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <span key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm">
                {file.name}
                <button onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))} className="text-red-500">x</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setSelectedFiles(Array.from(e.target.files));
              }
            }}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </label>
          <Textarea
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={1}
            className="flex-grow resize-none min-h-[40px] border-[#ffd700]/30 focus:border-[#ff8f00]"
          />
          <Button onClick={handleSendMessage} className="bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white">
            <Send className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleMicButtonClick}
            className={`text-white ${isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-[#ff8f00] to-[#ffc107] hover:opacity-90'}`}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterfacePage;
