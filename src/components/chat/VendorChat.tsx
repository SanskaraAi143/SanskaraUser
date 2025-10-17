import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { sendChatMessage } from '@/services/api/chatApi';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Phone, Video, Paperclip, Send, Calendar, Clock, MessageSquareText } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData'; // Import useDashboardData
import { Message } from '@/components/chat/futuristic/MessageItem'; // Use the updated Message interface

interface VendorChatProps {
  selectedTopic?: string;
}

const VendorChat: React.FC<VendorChatProps> = ({ selectedTopic }) => {
  const { user } = useAuth();
  const { vendors, loading: loadingVendors, error: vendorsError } = useDashboardData(); // Fetch vendors
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null); // State to hold selected vendor
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vendors && vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]); // Auto-select the first vendor if available
    }
  }, [vendors, selectedVendor]);

  useEffect(() => {
    // Simulate loading messages for the selected vendor
    if (selectedVendor) {
      setMessages([
        {
          id: '1',
          content: `Hello! This is ${selectedVendor.vendor_name}. How can I assist you today?`,
          role: 'bot',
          timestamp: new Date().toISOString(),
        }
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedVendor]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    if (!user?.wedding_id) {
      toast({ variant: "destructive", title: "Error", description: "Wedding ID not available. Please log in or select a wedding." });
      return;
    }
    if (!selectedVendor) {
      toast({ variant: "destructive", title: "Error", description: "No vendor selected to chat with." });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    try {
      // Send message to backend with wedding_id and vendor_id
      await sendChatMessage(inputMessage, user.wedding_id, undefined, 'vendor_chat', selectedVendor.vendor_id);

      // Simulate vendor response
      setTimeout(() => {
        const responses = [
          `Yes, we can definitely accommodate that request for your wedding ceremony, ${user.name}.`,
          "We do offer special rates for weekday events. I can send you our detailed pricing sheet.",
          "I've made a note about your dietary requirements. Our chef specializes in Gujarati cuisine and can prepare authentic dishes for your guests.",
          "We have several recommended decorators who are familiar with our venue. Would you like me to share their portfolios?",
          "That date is available. I can add a temporary hold for 48 hours while you make your decision."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const vendorMessage: Message = {
          id: Date.now().toString(),
          content: randomResponse,
          role: 'bot',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, vendorMessage]);
      }, 1500);
    } catch (error) {
      console.error("Error sending message to vendor:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedTopic) {
      setInputMessage(selectedTopic);
    }
  }, [selectedTopic]);

  if (loadingVendors) {
    return <div className="flex items-center justify-center h-full">Loading vendors...</div>;
  }

  if (vendorsError) {
    return <div className="flex items-center justify-center h-full text-red-500">Error loading vendors.</div>;
  }

  return (
    <div className="flex h-full">
      {/* Vendor List Sidebar */}
      <div className="w-1/4 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Confirmed Vendors</h3>
        {vendors.length === 0 ? (
          <p className="text-sm text-gray-500">No vendors confirmed yet.</p>
        ) : (
          <div className="space-y-2">
            {vendors.map((vendor: any) => (
              <div
                key={vendor.id}
                className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  selectedVendor?.id === vendor.id ? 'bg-wedding-maroon/10' : ''
                }`}
                onClick={() => setSelectedVendor(vendor)}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={vendor.profile_image_url || `https://ui-avatars.com/api/?name=${vendor.vendor_name.charAt(0)}&background=random&color=fff`} alt={vendor.vendor_name} />
                  <AvatarFallback>{vendor.vendor_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{vendor.vendor_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
        {selectedVendor ? (
          <>
            <div className="bg-gray-100 p-3 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={selectedVendor.profile_image_url || `https://ui-avatars.com/api/?name=${selectedVendor.vendor_name.charAt(0)}&background=random&color=fff`} alt={selectedVendor.vendor_name} />
                  <AvatarFallback className="bg-wedding-maroon text-white">{selectedVendor.vendor_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedVendor.vendor_name}</h3>
                  <p className="text-xs text-gray-500">{selectedVendor.category} • {selectedVendor.contact_person}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-wedding-maroon/5 p-2 flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-wedding-maroon mr-1" />
                <span className="text-wedding-maroon font-medium">Booked: {selectedVendor.booking_date ? new Date(selectedVendor.booking_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-wedding-maroon mr-1" />
                <span className="text-wedding-maroon font-medium">Next Event: {selectedVendor.next_event_date ? new Date(selectedVendor.next_event_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'bot' && (
                      <Avatar className="h-8 w-8 mt-1 mr-2">
                        <AvatarImage src={selectedVendor.profile_image_url || `https://ui-avatars.com/api/?name=${selectedVendor.vendor_name.charAt(0)}&background=random&color=fff`} alt={selectedVendor.vendor_name} />
                        <AvatarFallback className="bg-wedding-maroon text-white">{selectedVendor.vendor_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-wedding-red text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      {message.content}
                      <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(message.timestamp!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <Separator />
            
            <div className="p-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Paperclip size={18} />
                </Button>
                <div className="flex-grow relative">
                  <Input
                    placeholder={`Type your message to ${selectedVendor.vendor_name}...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="pr-12 rounded-full"
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 bg-wedding-red hover:bg-wedding-deepred rounded-full"
                    onClick={handleSendMessage}
                    disabled={inputMessage.trim() === ''}
                  >
                    <Send size={16} className="text-white" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Your messages are private between you and the vendor. Save important details to your wedding plan.
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
            <MessageSquareText size={48} className="mb-4" />
            <p className="text-lg">Select a vendor to start chatting.</p>
            {vendors.length > 0 && <p className="text-sm mt-2">Choose from your confirmed vendors on the left.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorChat;
