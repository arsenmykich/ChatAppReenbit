import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatContextType, Message } from '../types/chat';
import { messageService } from '../services/api';
import { signalRService } from '../services/signalr';
import { useAuth } from './AuthContext';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('User authenticated, connecting to chat...');
      connectToChat();
      loadMessages();
    } else {
      console.log('User not authenticated, disconnecting...');
      disconnectFromChat();
    }

    return () => {
      disconnectFromChat();
    };
  }, [isAuthenticated, token]);

  const connectToChat = async (): Promise<void> => {
    try {
      console.log('Starting SignalR connection...');
      setConnectionStatus('connecting');
      
      await signalRService.startConnection();
      
      // Set up event listeners
      signalRService.onReceiveMessage((messageData: any) => {
        console.log('Received message:', messageData);
        const newMessage: Message = {
          id: messageData.messageId || messageData.MessageId || Date.now().toString(),
          content: messageData.message || messageData.Message || messageData.content || messageData.Content,
          timestamp: messageData.timestamp || messageData.Timestamp || new Date().toISOString(),
          sentimentScore: messageData.sentimentScore || messageData.SentimentScore,
          sentimentLabel: messageData.sentimentLabel || messageData.SentimentLabel || 'neutral',
          sender: {
            id: messageData.senderId || messageData.SenderId || '',
            username: messageData.user || messageData.User || 'Unknown'
          }
        };
        
        setMessages(prev => [...prev, newMessage]);
      });

      signalRService.onError((error: string) => {
        console.error('Chat error:', error);
        setConnectionStatus('disconnected');
      });

      signalRService.onUserConnected((message: string) => {
        console.log('User connected:', message);
      });

      signalRService.onUserDisconnected((message: string) => {
        console.log('User disconnected:', message);
      });

      // Join default room
      console.log('Joining general room...');
      await signalRService.joinRoom('general');
      
      setConnectionStatus('connected');
      console.log('Successfully connected to chat');
    } catch (error) {
      console.error('Failed to connect to chat:', error);
      setConnectionStatus('disconnected');
    }
  };

  const disconnectFromChat = async (): Promise<void> => {
    console.log('Disconnecting from chat...');
    await signalRService.stopConnection();
    setConnectionStatus('disconnected');
    setMessages([]);
  };

  const loadMessages = async (): Promise<void> => {
    try {
      console.log('Loading messages...');
      const loadedMessages = await messageService.getMessages(1, 50);
      console.log('Loaded messages:', loadedMessages.length);
      setMessages(loadedMessages.reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (content: string): Promise<void> => {
    try {
      console.log('Sending message:', content);
      if (connectionStatus === 'connected') {
        await signalRService.sendMessage(content, 'general');
        console.log('Message sent successfully');
      } else {
        throw new Error('Not connected to chat');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const joinRoom = async (roomId: string): Promise<void> => {
    try {
      await signalRService.joinRoom(roomId);
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  };

  const leaveRoom = async (roomId: string): Promise<void> => {
    try {
      await signalRService.leaveRoom(roomId);
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  };

  const value: ChatContextType = {
    messages,
    connectionStatus,
    sendMessage,
    joinRoom,
    leaveRoom,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}; 