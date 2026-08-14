const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hub name is required'],
      trim: true,
    },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: [true, 'Region reference is required'],
    },
    anchorAddress: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    serviceRadiusKm: {
      type: Number,
      default: 4,
    },
    pincodesCovered: [
      {
        type: String,
        trim: true,
      },
    ],
    contactPersonName: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    pickupWindowStart: {
      type: String,
      default: '18:00',
    },
    pickupWindowEnd: {
      type: String,
      default: '21:00',
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

// Index pincodesCovered for fast auto-assignment (Section 8)
hubSchema.index({ pincodesCovered: 1 });

module.exports = mongoose.model('Hub', hubSchema);
