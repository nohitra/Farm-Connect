const mongoose = require('mongoose');

const orderCycleSchema = new mongoose.Schema(
  {
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true,
    },
    hub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hub',
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    orderWindowOpen: {
      type: Date,
      required: true,
    },
    orderWindowClose: {
      type: Date,
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'fulfilled', 'completed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OrderCycle', orderCycleSchema);
