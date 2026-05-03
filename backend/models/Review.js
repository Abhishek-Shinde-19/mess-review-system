const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  foodQuality: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  cleanliness: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  service: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  hostelBlock: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    default: '0.0.0.0'
  },
  reviewFrequency: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metricsResult: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MetricsResult'
  },
  aiResult: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIResult'
  }
});

reviewSchema.index({ userId: 1, timestamp: -1 });
reviewSchema.index({ hostelBlock: 1 });
reviewSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('Review', reviewSchema);
