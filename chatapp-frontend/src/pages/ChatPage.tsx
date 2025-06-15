import React from 'react';
import { ChatRoom } from '../components/chat/ChatRoom';
import { ChatProvider } from '../contexts/ChatContext';

export const ChatPage: React.FC = () => {
  return (
    <ChatProvider>
      <ChatRoom />
    </ChatProvider>
  );
};