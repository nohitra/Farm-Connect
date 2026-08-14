import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import API from '../../services/api';
import { MessageSquare, Send, User } from 'lucide-react';
import '../consumer/ChatPages.css';

const FarmerChatPage = () => {
  const { user } = useAuth();
  const { joinConversation, activeMessages, setActiveMessages } = useChat();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/farmer/chat/conversations')
      .then((res) => {
        if (res.data.success) {
          setConversations(res.data.conversations || []);
          if (res.data.conversations?.length > 0) {
            selectConversation(res.data.conversations[0].user);
          }
        }
      })
      .catch((err) => console.error('Error fetching conversations:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const selectConversation = async (partner) => {
    setActivePartner(partner);
    joinConversation(partner._id);

    try {
      const res = await API.get(`/farmer/chat/messages/${partner._id}`);
      if (res.data.success) {
        setActiveMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activePartner) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      const res = await API.post('/farmer/chat/send', {
        receiverUserId: activePartner._id,
        message: textToSend,
      });

      if (res.data?.success && res.data.chatMessage) {
        const newMsg = res.data.chatMessage;
        setActiveMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

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
      <h2 style={{ marginBottom: '1.25rem' }}>Farmer Message Inbox</h2>

      <div className="chat-layout glass-card">
        {/* Inbox Conversations List */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">Consumer Inquiries</div>
          {conversations.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No messages from consumers yet. Messages sent by consumers on your produce or orders will show here!
            </div>
          ) : (
            conversations.map((conv) => (
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
            ))
          )}
        </div>

        {/* Active Chat Thread View */}
        <div className="chat-thread-container">
          {activePartner ? (
            <>
              <div className="thread-header">
                <h3>{activePartner.name}</h3>
                <span className="badge badge-conventional">Consumer</span>
              </div>

              <div className="messages-body">
                {activeMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No messages yet in this thread.
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
                  placeholder="Reply to consumer..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary"><Send size={18} /></button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected text-center">
              <MessageSquare size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>Select a Conversation</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerChatPage;
