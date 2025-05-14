import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { USER_PROFILE } from '@/lib/constants';

// Define types
interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  recipientId: number;
  message: string;
  createdAt: string | Date;
  isRead: boolean;
}

interface ChatUser {
  id: number;
  name: string;
  avatarUrl?: string;
}

interface ChatConversation {
  id: number;
  ownerId: number;
  travelerId: number;
  shiftRequestId: number;
  tripId?: number;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastMessage?: ChatMessage;
  otherUser?: ChatUser;
  unreadCount: number;
}

interface ChatContextType {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  messages: ChatMessage[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendMessage: (message: string) => Promise<void>;
  selectConversation: (conversation: ChatConversation) => Promise<void>;
  startConversation: (userId: number, shiftRequestId: number) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [connected, setConnected] = useState(false);

  // Convert USER_PROFILE.id to number to avoid type issues
  const userId = Number(USER_PROFILE.id);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate with user ID
      ws.send(JSON.stringify({ type: 'auth', userId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'auth' && data.success) {
        setConnected(true);
      }
      
      if (data.type === 'message') {
        // Add new message to messages if it's for the current conversation
        if (currentConversation && data.message.conversationId === currentConversation.id) {
          setMessages(prev => [...prev, data.message]);
        }
        
        // Update conversation list to show new message
        refreshConversations();
      }
      
      if (data.type === 'message_sent') {
        // Add our own message to the list
        if (currentConversation && data.message.conversationId === currentConversation.id) {
          setMessages(prev => [...prev, data.message]);
        }
      }
      
      if (data.type === 'error') {
        console.error('WebSocket error:', data.message);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [userId]);

  // Load conversation list
  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Initial load of conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Function to refresh conversation list
  const refreshConversations = async () => {
    await fetchConversations();
  };

  // Function to load messages for a conversation
  const loadMessages = async (conversationId: number) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Function to select a conversation and load its messages
  const selectConversation = async (conversation: ChatConversation) => {
    setCurrentConversation(conversation);
    await loadMessages(conversation.id);
  };

  // Function to send a message
  const sendMessage = async (message: string) => {
    if (!socket || !connected || !currentConversation) return;
    
    const recipientId = currentConversation.ownerId === Number(userId) 
      ? currentConversation.travelerId 
      : currentConversation.ownerId;
    
    socket.send(JSON.stringify({
      type: 'message',
      conversationId: currentConversation.id,
      recipientId,
      message
    }));
  };

  // Function to start a new conversation
  const startConversation = async (travelerId: number, shiftRequestId: number) => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({
          travelerId,
          shiftRequestId
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Refresh conversations and select the new one
      await refreshConversations();
      
      // Find the newly created conversation in the updated list
      const newConversation = conversations.find(c => c.id === data.id);
      if (newConversation) {
        await selectConversation(newConversation);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sendMessage,
    selectConversation,
    startConversation,
    refreshConversations
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};