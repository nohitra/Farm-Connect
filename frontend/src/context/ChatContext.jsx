import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../services/socket';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeMessages, setActiveMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (data) => {
      console.log('🔔 Socket Notification Received:', data);
      setUnreadCount((prev) => prev + 1);
    };

    const handleReceiveMessage = (msg) => {
      console.log('📩 Socket Message Received:', msg);
      setActiveMessages((prev) => [...prev, msg]);
    };

    socket.on('new_message_notification', handleNewNotification);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('new_message_notification', handleNewNotification);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);

  const joinConversation = (receiverId) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('join_conversation', { receiverId });
    }
  };

  const sendSocketMessage = (receiverId, messageText, callback) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', { receiverId, message: messageText }, (response) => {
        if (callback) callback(response);
      });
    }
  };

  const clearUnreadCount = () => setUnreadCount(0);

  return (
    <ChatContext.Provider
      value={{
        unreadCount,
        activeMessages,
        setActiveMessages,
        activeConversationId,
        setActiveConversationId,
        joinConversation,
        sendSocketMessage,
        clearUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
