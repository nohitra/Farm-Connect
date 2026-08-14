const mongoose = require('mongoose');

const hubAssignmentRequestSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: true,
    },
    hub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hub',
      required: true,
    },
    distanceKm: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HubAssignmentRequest', hubAssignmentRequestSchema);
