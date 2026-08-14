const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: [true, 'Farmer reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Produce name is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Vegetables',
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit (e.g. kg, dozen) is required'],
      trim: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Total price per unit is required'],
      min: 0,
    },
    farmerEarning: {
      type: Number,
      required: [true, 'Farmer earning amount is required'],
      min: 0,
    },
    platformFee: {
      type: Number,
      required: [true, 'Platform fee is required'],
      min: 0,
    },
    deliveryCost: {
      type: Number,
      required: [true, 'Delivery cost is required'],
      min: 0,
    },
    quantityAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    harvestDate: {
      type: Date,
    },
    images: [
      {
        type: String,
      },
    ],
    practiceTag: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Produce', produceSchema);
