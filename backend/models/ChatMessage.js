const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true, // Indexed for fast message retrieval
    },
    message: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to create consistent conversationId
chatMessageSchema.statics.getConversationId = function (user1Id, user2Id) {
  const ids = [user1Id.toString(), user2Id.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
