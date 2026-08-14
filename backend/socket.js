const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { ChatMessage, User } = require('./models');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(
        cleanToken,
        process.env.JWT_SECRET || 'farmconnect_jwt_secret_key_2026_change_in_production'
      );

      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 User connected to Socket: ${socket.user.name} (${socket.user.role}) [ID: ${userId}]`);

    // Join personal room for instant notifications
    socket.join(`user_${userId}`);

    // Join specific conversation room
    socket.on('join_conversation', ({ receiverId }) => {
      if (!receiverId) return;
      const conversationId = ChatMessage.getConversationId(userId, receiverId);
      socket.join(`conversation_${conversationId}`);
      console.log(`💬 User ${socket.user.name} joined conversation room: conversation_${conversationId}`);
    });

    // Real-Time Send Message Event
    socket.on('send_message', async ({ receiverId, message }, callback) => {
      try {
        if (!receiverId || !message || !message.trim()) {
          if (callback) callback({ success: false, message: 'Invalid payload' });
          return;
        }

        const conversationId = ChatMessage.getConversationId(userId, receiverId);

        // 1. Persist message in MongoDB
        const chatMsg = await ChatMessage.create({
          sender: userId,
          receiver: receiverId,
          conversationId,
          message: message.trim(),
        });

        const populatedMsg = await ChatMessage.findById(chatMsg._id)
          .populate('sender', 'name role')
          .populate('receiver', 'name role');

        // 2. Broadcast to conversation room (real-time chat window)
        io.to(`conversation_${conversationId}`).emit('receive_message', populatedMsg);

        // 3. Emit notification badge alert to receiver's personal user room
        io.to(`user_${receiverId}`).emit('new_message_notification', {
          conversationId,
          senderId: userId,
          senderName: socket.user.name,
          message: message.trim(),
          createdAt: chatMsg.createdAt,
        });

        if (callback) {
          callback({ success: true, message: populatedMsg });
        }
      } catch (error) {
        console.error('Socket send_message error:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Mark conversation messages as read
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        await ChatMessage.updateMany(
          { conversationId, receiver: userId, isRead: false },
          { $set: { isRead: true } }
        );
        io.to(`conversation_${conversationId}`).emit('messages_read', { conversationId, readBy: userId });
      } catch (err) {
        console.error('Socket mark_read error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected from Socket: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
