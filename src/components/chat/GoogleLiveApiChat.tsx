import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useMultimodalClient } from '../../hooks/useMultimodalClient.ts';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Mic, Video, MonitorPlay, VideoOff, MonitorOff, User, Bot } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import VoiceIndicator from './VoiceIndicator';

const GoogleLiveApiChat = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');

  const {
    isConnected,
    isRecording,
    isVideoActive,
    activeVideoMode,
    transcript,
    startRecording,
    stopRecording,
    initializeWebcam,
    initializeScreenShare,
    stopVideo,
    sendTextMessage,
    isSpeaking,
    isAssistantSpeaking,
    interruptAssistant,
  } = useMultimodalClient(user?.internal_user_id);

  useEffect(() => {
    if (isVideoActive && videoRef.current) {
      if (activeVideoMode === 'webcam') {
        initializeWebcam(videoRef.current);
      } else if (activeVideoMode === 'screen') {
        initializeScreenShare(videoRef.current);
      }
    }
  }, [isVideoActive, activeVideoMode, initializeWebcam, initializeScreenShare]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  // Add keyboard shortcuts for interruption
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press 'i' to interrupt assistant
      if (e.key === 'i' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        // Don't interrupt if user is typing in an input field
        if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        if (isAssistantSpeaking) {
          interruptAssistant();
        }
      }
      // Press Space to start/stop recording (when not typing)
      if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        // Don't trigger if user is typing in an input field
        if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRecording, isAssistantSpeaking, startRecording, stopRecording, interruptAssistant]);

  const handleSendClick = () => {
    if (inputText.trim()) {
      sendTextMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleCameraToggle = () => {
    if (isVideoActive && activeVideoMode === 'webcam') {
      stopVideo();
    } else {
      initializeWebcam(videoRef.current);
    }
  };

  const handleScreenShareToggle = () => {
    if (isVideoActive && activeVideoMode === 'screen') {
      stopVideo();
    } else {
      initializeScreenShare(videoRef.current);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-[#ffd700]/30">
      {/* Video Feed (conditionally rendered) */}
      {isVideoActive && (
        <div className="w-full h-64 bg-black flex items-center justify-center overflow-hidden rounded-t-lg">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline></video>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-grow p-4 overflow-y-auto min-h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {transcript.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div className={cn(
                "flex items-start gap-2.5 max-w-[70%]",
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              )}>
                <Avatar className={msg.sender === 'user' ? 'bg-[#ffd700]/20' : 'bg-[#ff8f00]/20'}>
                  <AvatarFallback>
                    {msg.sender === 'user' ?
                      <User className="text-[#ffd700]" /> :
                      <Bot className="text-[#ff8f00]" />
                    }
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "p-3 rounded-lg shadow-md",
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {msg.sender === 'assistant' && msg.isMarkdown ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                          li: ({children}) => <li className="mb-1">{children}</li>,
                          strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                          em: ({children}) => <em className="italic">{children}</em>,
                          code: ({children}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">{children}</code>,
                          pre: ({children}) => <pre className="bg-gray-200 p-2 rounded overflow-x-auto text-sm">{children}</pre>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic">{children}</blockquote>,
                          h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({children}) => <h2 className="text-md font-semibold mb-2">{children}</h2>,
                          h3: ({children}) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 border-t border-[#ffd700]/30 bg-white flex flex-col items-center space-y-2">
        <div className="flex justify-center w-full">
          <VoiceIndicator 
            isSpeaking={isSpeaking} 
            isAssistantSpeaking={isAssistantSpeaking}
            isUserSpeaking={isRecording}
          />
          {isAssistantSpeaking && (
            <div className="ml-4 flex items-center space-x-2">
              <Button
                onClick={interruptAssistant}
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Interrupt
              </Button>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Space</kbd> to record • 
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">I</kbd> to interrupt
        </div>
        <div className="flex items-center space-x-2 w-full">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "rounded-full p-2",
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-[#ff8f00] to-[#ffc107] hover:opacity-90'
            )}
          >
            <Mic className="h-5 w-5" />
          </Button>

          <Button
            onClick={handleCameraToggle}
            className={cn(
              "rounded-full p-2",
              isVideoActive && activeVideoMode === 'webcam' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
            )}
          >
            {isVideoActive && activeVideoMode === 'webcam' ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            onClick={handleScreenShareToggle}
            className={cn(
              "rounded-full p-2",
              isVideoActive && activeVideoMode === 'screen' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-500 hover:bg-gray-600'
            )}
          >
            {isVideoActive && activeVideoMode === 'screen' ? <MonitorOff className="h-5 w-5" /> : <MonitorPlay className="h-5 w-5" />}
          </Button>

          <Textarea
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            className="flex-grow resize-none min-h-[40px] border-[#ffd700]/30 focus:border-[#ff8f00]"
          />
          <Button onClick={handleSendClick} disabled={!inputText.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoogleLiveApiChat;