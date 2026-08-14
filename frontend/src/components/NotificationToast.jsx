import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { getSocket } from '../services/socket';
import { Bell, MessageSquare, ShoppingBag, X } from 'lucide-react';
import './NotificationToast.css';

const NotificationToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      addToast({
        id: Date.now(),
        type: 'chat',
        title: 'New Message',
        message: data.message || 'You received a new message.',
      });
    };

    // Listen for order status updates
    const handleOrderStatusUpdate = (data) => {
      addToast({
        id: Date.now(),
        type: 'order',
        title: 'Order Status Update',
        message: `Order status changed to ${data.status || 'updated'}.`,
      });
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('order_status_updated', handleOrderStatusUpdate);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('order_status_updated', handleOrderStatusUpdate);
    };
  }, []);

  const addToast = (toast) => {
    setToasts((prev) => [toast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-card glass-card animate-slide-in">
          <div className="toast-icon-wrapper">
            {toast.type === 'chat' ? (
              <MessageSquare size={18} className="icon-chat" />
            ) : (
              <ShoppingBag size={18} className="icon-order" />
            )}
          </div>
          <div className="toast-content">
            <h5 className="toast-title">{toast.title}</h5>
            <p className="toast-message">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="toast-close-btn">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
