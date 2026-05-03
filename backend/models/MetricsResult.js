const mongoose = require('mongoose');

const metricsResultSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  credibilityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Valid', 'Suspicious', 'Likely Spam'],
    required: true
  },
  flags: [{
    rule: String,
    description: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  explanation: {
    type: String,
    default: ''
  },
  details: {
    reviewFrequencyScore: { type: Number, default: 0 },
    spikeScore: { type: Number, default: 0 },
    varianceScore: { type: Number, default: 0 },
    ipScore: { type: Number, default: 0 },
    timingScore: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MetricsResult', metricsResultSchema);
