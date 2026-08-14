import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import API from '../../services/api';
import { MessageSquare, Send, User, Sprout } from 'lucide-react';
import './ChatPages.css';

const ConsumerChatPage = () => {
  const { user } = useAuth();
  const { joinConversation, activeMessages, setActiveMessages } = useChat();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [availableFarmers, setAvailableFarmers] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  // Initial target farmer user from navigation state
  const initialPartner = location.state?.farmerUser;

  useEffect(() => {
    fetchInitialChatData();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of chat thread when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const fetchInitialChatData = async () => {
    setLoading(true);
    try {
      // 1. Fetch existing conversations
      const convRes = await API.get('/consumer/chat/conversations');
      let convList = convRes.data?.success ? convRes.data.conversations : [];

      // 2. Fetch available produce/farmers in the consumer's hub to allow starting a chat with any farmer
      const produceRes = await API.get('/consumer/produce');
      const farmersMap = {};

      if (produceRes.data?.success && produceRes.data.produce) {
        produceRes.data.produce.forEach((p) => {
          if (p.farmer && p.farmer.user) {
            const fUser = p.farmer.user;
            farmersMap[fUser._id] = {
              _id: fUser._id,
              name: fUser.name || p.farmer.farmName || 'Local Farmer',
              email: fUser.email,
              farmName: p.farmer.farmName,
              farmLocation: p.farmer.farmLocation,
            };
          }
        });
      }

      const farmerList = Object.values(farmersMap);
      setAvailableFarmers(farmerList);

      // If initialPartner was passed from navigation, ensure it's selected
      if (initialPartner) {
        if (!convList.some((c) => c.user._id === initialPartner._id)) {
          convList = [
            {
              user: initialPartner,
              lastMessage: 'Start a new conversation...',
              unreadCount: 0,
            },
            ...convList,
          ];
        }
        setConversations(convList);
        selectConversation(initialPartner);
      } else if (convList.length > 0) {
        setConversations(convList);
        selectConversation(convList[0].user);
      } else if (farmerList.length > 0) {
        setConversations(convList);
        selectConversation(farmerList[0]);
      } else {
        setConversations(convList);
      }
    } catch (err) {
      console.error('Error fetching chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (partner) => {
    setActivePartner(partner);
    joinConversation(partner._id);

    try {
      const res = await API.get(`/consumer/chat/messages/${partner._id}`);
      if (res.data.success) {
        setActiveMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleStartNewFarmerChat = (farmerUser) => {
    if (!conversations.some((c) => c.user._id === farmerUser._id)) {
      setConversations([
        {
          user: farmerUser,
          lastMessage: 'New chat started...',
          unreadCount: 0,
        },
        ...conversations,
      ]);
    }
    selectConversation(farmerUser);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activePartner) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      const res = await API.post('/consumer/chat/send', {
        receiverUserId: activePartner._id,
        message: textToSend,
      });

      if (res.data?.success && res.data.chatMessage) {
        const newMsg = res.data.chatMessage;
        // Optimistically add message if not already present
        setActiveMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        // Update sidebar last message summary
        setConversations((prev) =>
          prev.map((c) =>
            c.user._id === activePartner._id ? { ...c, lastMessage: textToSend } : c
          )
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <h2 style={{ marginBottom: '1.25rem' }}>Direct Consumer-Farmer Chat Inbox</h2>

      <div className="chat-layout glass-card">
        {/* Inbox Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">Conversations</div>

          {loading ? (
            <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading contacts...</div>
          ) : (
            <>
              {/* Existing Message Threads */}
              {conversations.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recent Chats</div>
                  {conversations.map((conv) => (
                    <div
                      key={conv.user._id}
                      className={`conversation-item ${activePartner?._id === conv.user._id ? 'active' : ''}`}
                      onClick={() => selectConversation(conv.user)}
                    >
                      <div className="partner-avatar"><User size={20} /></div>
                      <div className="conversation-info">
                        <div className="partner-name">{conv.user.name}</div>
                        <div className="last-message">{conv.lastMessage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hub Farmers Available to Start New Chat */}
              {availableFarmers.length > 0 && (
                <div>
                  <div style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sprout size={12} /> Local Hub Farmers
                  </div>
                  {availableFarmers.map((fUser) => (
                    <div
                      key={fUser._id}
                      className={`conversation-item ${activePartner?._id === fUser._id ? 'active' : ''}`}
                      onClick={() => handleStartNewFarmerChat(fUser)}
                    >
                      <div className="partner-avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}><User size={20} /></div>
                      <div className="conversation-info">
                        <div className="partner-name">{fUser.name}</div>
                        <div className="last-message" style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>{fUser.farmName || 'Click to message farmer'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {conversations.length === 0 && availableFarmers.length === 0 && (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No local farmers currently available in your assigned hub.
                </div>
              )}
            </>
          )}
        </div>

        {/* Active Chat Thread View */}
        <div className="chat-thread-container">
          {activePartner ? (
            <>
              <div className="thread-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{activePartner.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activePartner.farmName ? `Farm: ${activePartner.farmName}` : 'Verified Local Farmer'}</span>
                </div>
                <span className="badge badge-organic">Direct Farmer Contact</span>
              </div>

              <div className="messages-body">
                {activeMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
                    <MessageSquare size={40} style={{ color: 'var(--primary)', marginBottom: '0.75rem', opacity: 0.8 }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Start a conversation with {activePartner.name}</p>
                    <p style={{ fontSize: '0.85rem' }}>Ask about crop harvest dates, farming practices, or hub pickup timing.</p>
                  </div>
                ) : (
                  activeMessages.map((msg, idx) => {
                    const isMine = msg.sender === user?._id || msg.sender?._id === user?._id;
                    return (
                      <div key={idx} className={`message-bubble ${isMine ? 'message-mine' : 'message-other'}`}>
                        <p>{msg.message}</p>
                        <span className="message-time">
                          {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Send message to ${activePartner.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary"><Send size={18} /></button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected text-center" style={{ padding: '4rem 1rem' }}>
              <MessageSquare size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>Select a Farmer to Chat</h3>
              <p style={{ color: 'var(--text-muted)' }}>Choose a farmer from the sidebar list to start a direct message.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumerChatPage;
