const mongoose = require('mongoose');

const consumerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    address: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      index: true, // Indexed for auto hub assignment
    },
    assignedHub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hub',
      required: true,
    },
    savedFarmers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FarmerProfile',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConsumerProfile', consumerProfileSchema);
