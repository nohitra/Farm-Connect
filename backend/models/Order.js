const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  produce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produce',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
  },
  priceAtOrder: {
    type: Number,
    required: true,
  },
  farmerEarningAtOrder: {
    type: Number,
    required: true,
  },
  platformFeeAtOrder: {
    type: Number,
    required: true,
  },
  deliveryCostAtOrder: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsumerProfile',
      required: true,
    },
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
    orderCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderCycle',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalFarmerEarning: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPlatformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: 'COD',
    },
    status: {
      type: String,
      enum: ['ordered', 'confirmed', 'ready', 'picked-up', 'cancelled'],
      default: 'ordered',
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    pickedUpAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast consumer/farmer order lookups & impact aggregation
orderSchema.index({ consumer: 1, orderedAt: -1 });
orderSchema.index({ farmer: 1, orderCycle: 1 });
orderSchema.index({ hub: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
