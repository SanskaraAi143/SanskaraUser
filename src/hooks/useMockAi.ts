import { useState, useEffect } from 'react';

type Message = {
  sender: 'user' | 'assistant';
  text: string;
};

export const useMockAi = (initialMessages: Message[] = []) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    // Add user's message
    setMessages(prevMessages => [...prevMessages, { sender: 'user', text }]);

    // Trigger AI's response
    setIsTyping(true);
  };

  useEffect(() => {
    if (isTyping) {
      // Simulate a delay for the AI's response
      const timer = setTimeout(() => {
        const responses = [
          "That's a great question! Let me check on that for you.",
          "Interesting idea! Here are some thoughts...",
          "I've found some options for you. Let's take a look.",
          "Let's break that down. Here is a step-by-step plan.",
          "I've updated the timeline with that information."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        setMessages(prevMessages => [...prevMessages, { sender: 'assistant', text: randomResponse }]);
        setIsTyping(false);
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  return { messages, sendMessage, isTyping };
};
