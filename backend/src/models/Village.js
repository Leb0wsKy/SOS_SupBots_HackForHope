import mongoose from 'mongoose';

const villageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  programs: [{
    type: String
  }],
  // Statistics for village rating
  totalSignalements: {
    type: Number,
    default: 0
  },
  urgentSignalements: {
    type: Number,
    default: 0
  },
  falseSignalements: {
    type: Number,
    default: 0
  },
  ratingScore: {
    type: Number,
    default: 0
  },
  // Coordinates for heatmap
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Village', villageSchema);
