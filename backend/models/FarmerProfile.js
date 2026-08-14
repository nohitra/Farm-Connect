const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    farmName: {
      type: String,
      trim: true,
    },
    farmLocation: {
      type: String,
      trim: true,
    },
    farmCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    farmingPractice: {
      type: String,
      enum: ['organic', 'natural', 'chemical-free', 'conventional'],
      default: 'organic',
    },
    certifications: [
      {
        type: String,
      },
    ],
    farmPhotos: [
      {
        type: String,
      },
    ],
    bio: {
      type: String,
    },
    assignedHubs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hub',
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index assignedHubs for fast lookups (Section 8)
farmerProfileSchema.index({ assignedHubs: 1 });

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
