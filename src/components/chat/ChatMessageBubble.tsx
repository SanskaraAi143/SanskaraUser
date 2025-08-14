import React from 'react';

interface ChatMessageBubbleProps {
  sender: string;
  message: string;
  isUserMessage: boolean;
  animationDelay?: string;
  attachments?: { id: string; filename: string; thumbnailUrl?: string; mime_type?: string }[];
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ 
  sender, 
  message, 
  isUserMessage, 
  animationDelay = '0s',
  attachments = []
}) => {
  return (
    <div 
      className="chat-message animate-fade-in" 
      style={{ animationDelay }}
    >
      <p className="font-medium title-gradient mb-1 text-sm">
        {sender}
      </p>
      <div 
        className={`p-3 md:p-4 rounded-2xl shadow-md ${
          isUserMessage 
            ? 'bg-wedding-red text-white ml-8' 
            : 'glass-card mr-8'
        }`}
      >
        <p className={`text-sm ${
          isUserMessage 
            ? 'text-white' 
            : 'text-wedding-brown/90'
        }`}>
          {message}
        </p>
        {attachments.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {attachments.map(att => (
              <div key={att.id} className="border rounded bg-white/10 overflow-hidden text-[10px] flex flex-col">
                {att.thumbnailUrl ? (
                  <img src={att.thumbnailUrl} alt={att.filename} className="object-cover aspect-video" />
                ) : (
                  <div className="aspect-video flex items-center justify-center text-xs text-gray-300">FILE</div>
                )}
                <div className="truncate px-1 py-0.5" title={att.filename}>{att.filename}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
