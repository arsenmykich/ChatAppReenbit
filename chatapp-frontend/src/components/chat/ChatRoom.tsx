import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  ChatContainer,
  ChatArea,
  ChatHeader,
  MessagesContainer,
  MessageInput,
  InputGroup,
  Input,
  Button,
  Sidebar,
  UserInfo,
  ConnectionStatus,
  MessageBubble,
  SentimentBadge
} from '../styled/StyledComponents';

export const ChatRoom: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();
  const { messages, connectionStatus, sendMessage } = useChat();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusText = (status: typeof connectionStatus) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <Container>
      <ChatContainer>
        <ChatArea>
          <ChatHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, color: '#374151' }}>General Chat</h2>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  Real-time chat with sentiment analysis
                </p>
              </div>
              <ConnectionStatus status={connectionStatus}>
                {getStatusText(connectionStatus)}
              </ConnectionStatus>
            </div>
          </ChatHeader>

          <MessagesContainer>
            {messages.map((message) => {
              const isOwn = message.sender.username === user?.username;
              return (
                <MessageBubble key={message.id} isOwn={isOwn}>
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-meta">
                    <span>{isOwn ? 'You' : message.sender.username}</span>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    <SentimentBadge sentiment={message.sentimentLabel}>
                      {message.sentimentLabel}
                    </SentimentBadge>
                  </div>
                </MessageBubble>
              );
            })}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <MessageInput>
            <form onSubmit={handleSendMessage}>
              <InputGroup>
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  disabled={connectionStatus !== 'connected' || sending}
                />
                <Button
                  type="submit"
                  disabled={!messageText.trim() || connectionStatus !== 'connected' || sending}
                >
                  <Send size={16} />
                </Button>
              </InputGroup>
            </form>
          </MessageInput>
        </ChatArea>

        <Sidebar>
          <UserInfo>
            <h3>{user?.username}</h3>
            <p>{user?.email}</p>
          </UserInfo>
          
          <div style={{ textAlign: 'center' }}>
            <Button variant="danger" onClick={logout} style={{ width: '100%' }}>
              Logout
            </Button>
          </div>
          
          <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
              Chat Features
            </h4>
            <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: '#6b7280' }}>
              <li>Real-time messaging</li>
              <li>Sentiment analysis</li>
              <li>Message history</li>
              <li>User authentication</li>
            </ul>
          </div>
        </Sidebar>
      </ChatContainer>
    </Container>
  );
}; 