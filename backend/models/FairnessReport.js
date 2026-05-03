const mongoose = require('mongoose');

const fairnessReportSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  metricsResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MetricsResult',
    required: true
  },
  aiResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIResult',
    required: true
  },
  metricsStatus: {
    type: String,
    enum: ['Valid', 'Suspicious', 'Likely Spam'],
    required: true
  },
  aiPrediction: {
    type: String,
    enum: ['valid', 'suspicious', 'spam'],
    required: true
  },
  agreementScore: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  isDisagreement: {
    type: Boolean,
    default: false
  },
  combinedExplanation: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FairnessReport', fairnessReportSchema);
