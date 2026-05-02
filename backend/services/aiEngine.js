const axios = require('axios');
const Review = require('../models/Review');

/**
 * AI Engine Service - Communicates with Python FastAPI microservice
 */
class AIEngineService {

  static get ML_URL() {
    return process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Send review data to ML service for analysis
   */
  static async analyze(review, userId) {
    try {
      // Calculate derived features
      const features = await this.buildFeatures(review, userId);

      const response = await axios.post(`${this.ML_URL}/predict`, features, {
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('AI Engine Error:', error.message);
      // Return a fallback result if ML service is unavailable
      return {
        prediction: 'valid',
        confidence: 0.5,
        top_features: [],
        explanation: 'AI service is currently unavailable. Using default prediction.',
        shap_values: []
      };
    }
  }

  /**
   * Build feature vector for ML model
   */
  static async buildFeatures(review, userId) {
    // Review frequency in last 24h
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reviewFrequency = await Review.countDocuments({
      userId,
      timestamp: { $gte: last24h }
    });

    // Rating variance for this hostel
    const hostelReviews = await Review.find({ hostelBlock: review.hostelBlock }).select('rating');
    let ratingVariance = 0;
    if (hostelReviews.length > 1) {
      const avg = hostelReviews.reduce((s, r) => s + r.rating, 0) / hostelReviews.length;
      ratingVariance = Math.abs(review.rating - avg);
    }

    // IP similarity (how many reviews from same IP in last hour)
    const last1h = new Date(Date.now() - 60 * 60 * 1000);
    const ipSimilarity = await Review.countDocuments({
      ipAddress: review.ipAddress,
      timestamp: { $gte: last1h }
    });

    // Hostel cluster behaviour (avg rating for hostel)
    const hostelAvgRating = hostelReviews.length > 0
      ? hostelReviews.reduce((s, r) => s + r.rating, 0) / hostelReviews.length
      : 3;

    // Negative spike (negative reviews from hostel in last 30 min)
    const last30min = new Date(Date.now() - 30 * 60 * 1000);
    const ratingSpikeCount = await Review.countDocuments({
      hostelBlock: review.hostelBlock,
      rating: { $lte: 2 },
      timestamp: { $gte: last30min }
    });

    return {
      rating: review.rating,
      food_quality: review.foodQuality,
      cleanliness: review.cleanliness,
      service: review.service,
      rating_variance: parseFloat(ratingVariance.toFixed(3)),
      review_frequency: reviewFrequency,
      ip_similarity: ipSimilarity,
      hostel_avg_rating: parseFloat(hostelAvgRating.toFixed(3)),
      rating_spike: ratingSpikeCount
    };
  }
}

module.exports = AIEngineService;
