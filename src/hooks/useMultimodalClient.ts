
import { useState, useEffect, useRef } from 'react';
import MultimodalClient from '../lib/multimodal-client.js';

interface Message {
  sender: string;
  text: string;
  isMarkdown?: boolean;
}

export const useMultimodalClient = (serverUrl?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [activeVideoMode, setActiveVideoMode] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  
  // Refs for managing state and preventing race conditions
  const clientRef = useRef<any>(null);
  const currentAssistantMessageIndex = useRef<number | null>(null);
  const processingLockRef = useRef<boolean>(false);
  const transcriptRef = useRef<Message[]>([]);

  // Keep transcript ref in sync with state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    // Clean up existing client if any
    if (clientRef.current) {
      clientRef.current.close();
    }
    
    clientRef.current = new MultimodalClient(serverUrl);
    const client = clientRef.current;

    const handleReady = () => setIsConnected(true);
    const handleSessionIdReceived = (id: string) => setSessionId(id);
    
    const handleTextReceived = (message: { type: string, data: string }) => {
      // Prevent concurrent processing to avoid duplicate text chunks
      if (processingLockRef.current) {
        return;
      }
      
      processingLockRef.current = true;
      
      // Work with the current transcript state from ref to avoid React batching issues
      let newTranscript = [...transcriptRef.current];
      
      if (message.type === 'user_input') {
        // Find the last user message (which should be the '...' placeholder)
        const lastUserMessageIndex = newTranscript.length - 1;
        if (lastUserMessageIndex >= 0 && 
            newTranscript[lastUserMessageIndex].sender === 'user' && 
            newTranscript[lastUserMessageIndex].text === '...') {
          newTranscript[lastUserMessageIndex].text = message.data;
        } else {
          // If no placeholder, add a new user message
          newTranscript.push({ sender: 'user', text: message.data });
        }
      } else if (message.type === 'text') {
        // Handle assistant text (incremental updates with markdown support)
        if (currentAssistantMessageIndex.current !== null && 
            newTranscript[currentAssistantMessageIndex.current]) {
          // Append to existing message
          newTranscript[currentAssistantMessageIndex.current].text += message.data;
        } else {
          // Create new assistant message with markdown support
          newTranscript.push({ 
            sender: 'assistant', 
            text: message.data,
            isMarkdown: true 
          });
          currentAssistantMessageIndex.current = newTranscript.length - 1;
        }
      }
      
      // Update both ref and state
      transcriptRef.current = newTranscript;
      setTranscript(newTranscript);
      
      // Release the lock
      processingLockRef.current = false;
    };
    
    const handleTurnComplete = () => {
      currentAssistantMessageIndex.current = null;
      setIsSpeaking(false);
      setIsAssistantSpeaking(false);
    };
    
    const handleError = (error: any) => {
      console.error('Client error:', error);
      currentAssistantMessageIndex.current = null;
      setIsSpeaking(false);
      setIsAssistantSpeaking(false);
    };
    
    const handleInterrupted = () => {
      console.log('Voice interruption detected - stopping assistant audio');
      currentAssistantMessageIndex.current = null;
      setIsSpeaking(false);
      setIsAssistantSpeaking(false);
      
      // Call the client's interrupt method to stop audio playback
      if (client && client.interrupt) {
        client.interrupt();
      }
    };
    
    const handleAudioReceived = () => {
      setIsSpeaking(true);
      setIsAssistantSpeaking(true);
    };

    // Set up event handlers
    client.onReady = handleReady;
    client.onSessionIdReceived = handleSessionIdReceived;
    client.onTextReceived = handleTextReceived;
    client.onTurnComplete = handleTurnComplete;
    client.onError = handleError;
    client.onInterrupted = handleInterrupted;
    client.onAudioReceived = handleAudioReceived;

    client.connect().catch(handleError);

    return () => {
      if (clientRef.current) {
        clientRef.current.close();
        clientRef.current = null;
      }
    };
  }, [serverUrl]);

  const startRecording = async () => {
    const client = clientRef.current;
    if (!client) return;
    
    try {
      // If assistant is speaking, interrupt it first
      if (isAssistantSpeaking && client.interrupt) {
        client.interrupt();
        setIsAssistantSpeaking(false);
      }
      
      await client.startRecording();
      setIsRecording(true);
      setIsSpeaking(true);
      
      const newTranscript = [...transcriptRef.current, { sender: 'user', text: '...' }];
      transcriptRef.current = newTranscript;
      setTranscript(newTranscript);
      currentAssistantMessageIndex.current = null;
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    const client = clientRef.current;
    if (!client) return;
    
    client.stopRecording();
    setIsRecording(false);
    setIsSpeaking(false);
    
    const newTranscript = [...transcriptRef.current];
    // Remove the '...' placeholder if it hasn't been replaced
    if (newTranscript.length > 0 && 
        newTranscript[newTranscript.length - 1].text === '...' && 
        newTranscript[newTranscript.length - 1].sender === 'user') {
      newTranscript.pop();
    }
    
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);
  };

  const initializeWebcam = async (videoElement: HTMLVideoElement) => {
    const client = clientRef.current;
    if (!client) return;
    
    try {
      const success = await client.initializeWebcam(videoElement);
      if (success) {
        setIsVideoActive(true);
        setActiveVideoMode('webcam');
        if (client.isConnected) {
          client.startVideoStream(1);
        }
      }
    } catch (error) {
      console.error('Error initializing webcam:', error);
    }
  };

  const initializeScreenShare = async (videoElement: HTMLVideoElement) => {
    const client = clientRef.current;
    if (!client) return;
    
    try {
      const success = await client.initializeScreenShare(videoElement);
      if (success) {
        setIsVideoActive(true);
        setActiveVideoMode('screen');
        if (client.isConnected) {
          client.startVideoStream(1);
        }
      }
    } catch (error) {
      console.error('Error initializing screen share:', error);
    }
  };

  const stopVideo = () => {
    const client = clientRef.current;
    if (!client) return;
    
    client.stopVideo();
    setIsVideoActive(false);
    setActiveVideoMode(null);
  };

  const sendTextMessage = (text: string) => {
    const client = clientRef.current;
    if (!client) return;
    
    // If assistant is speaking, interrupt it first
    if (isAssistantSpeaking && client.interrupt) {
      client.interrupt();
      setIsAssistantSpeaking(false);
    }
    
    client.sendText(text);
    const newTranscript = [...transcriptRef.current, { sender: 'user', text }];
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);
  };

  const interruptAssistant = () => {
    const client = clientRef.current;
    if (!client || !isAssistantSpeaking) return;
    
    if (client.interrupt) {
      client.interrupt();
      setIsAssistantSpeaking(false);
      setIsSpeaking(false);
    }
  };

  return {
    isConnected,
    isRecording,
    isVideoActive,
    activeVideoMode,
    transcript,
    sessionId,
    isSpeaking,
    isAssistantSpeaking,
    startRecording,
    stopRecording,
    initializeWebcam,
    initializeScreenShare,
    stopVideo,
    sendTextMessage,
    interruptAssistant,
  };
};
