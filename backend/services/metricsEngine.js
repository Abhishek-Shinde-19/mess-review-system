const Review = require('../models/Review');
const MetricsResult = require('../models/MetricsResult');

/**
 * Metrics-Based Fairness Engine
 * Calculates credibility score using rule-based analysis
 */
class MetricsEngine {

  /**
   * Analyze a review and return metrics result
   */
  static async analyze(review, userId, ipAddress) {
    const flags = [];
    let totalPenalty = 0;

    // 1. Review Frequency Check
    const frequencyResult = await this.checkReviewFrequency(userId);
    totalPenalty += frequencyResult.penalty;
    if (frequencyResult.flag) flags.push(frequencyResult.flag);

    // 2. Negative Review Spike
    const spikeResult = await this.checkNegativeSpike(review.hostelBlock);
    totalPenalty += spikeResult.penalty;
    if (spikeResult.flag) flags.push(spikeResult.flag);

    // 3. Rating Variance from Hostel
    const varianceResult = await this.checkRatingVariance(review.rating, review.hostelBlock);
    totalPenalty += varianceResult.penalty;
    if (varianceResult.flag) flags.push(varianceResult.flag);

    // 4. IP Duplication Check
    const ipResult = await this.checkIPDuplication(ipAddress);
    totalPenalty += ipResult.penalty;
    if (ipResult.flag) flags.push(ipResult.flag);

    // 5. Timing Anomaly Check
    const timingResult = await this.checkTimingAnomaly(userId);
    totalPenalty += timingResult.penalty;
    if (timingResult.flag) flags.push(timingResult.flag);

    // Calculate credibility score (0−100)
    const credibilityScore = Math.max(0, Math.min(100, 100 - totalPenalty));

    // Determine status
    let status;
    if (credibilityScore >= 70) status = 'Valid';
    else if (credibilityScore >= 40) status = 'Suspicious';
    else status = 'Likely Spam';

    // Generate explanation
    const explanation = this.generateExplanation(flags, credibilityScore, status);

    const metricsResult = await MetricsResult.create({
      reviewId: review._id,
      userId: userId,
      credibilityScore,
      status,
      flags,
      explanation,
      details: {
        reviewFrequencyScore: frequencyResult.penalty,
        spikeScore: spikeResult.penalty,
        varianceScore: varianceResult.penalty,
        ipScore: ipResult.penalty,
        timingScore: timingResult.penalty
      }
    });

    return metricsResult;
  }

  /**
   * Rule 1: Review frequency from same user (last 24 hours)
   */
  static async checkReviewFrequency(userId) {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await Review.countDocuments({
      userId,
      timestamp: { $gte: last24h }
    });

    if (count > 10) {
      return {
        penalty: 30,
        flag: {
          rule: 'high_frequency',
          description: `User submitted ${count} reviews in the last 24 hours`,
          severity: 'high'
        }
      };
    } else if (count > 5) {
      return {
        penalty: 15,
        flag: {
          rule: 'moderate_frequency',
          description: `User submitted ${count} reviews in the last 24 hours`,
          severity: 'medium'
        }
      };
    }
    return { penalty: 0, flag: null };
  }

  /**
   * Rule 2: Sudden spike in negative reviews from same hostel
   */
  static async checkNegativeSpike(hostelBlock) {
    const last30min = new Date(Date.now() - 30 * 60 * 1000);
    const negativeReviews = await Review.countDocuments({
      hostelBlock,
      rating: { $lte: 2 },
      timestamp: { $gte: last30min }
    });

    if (negativeReviews > 10) {
      return {
        penalty: 25,
        flag: {
          rule: 'negative_spike',
          description: `${negativeReviews} negative reviews from hostel ${hostelBlock} in last 30 minutes`,
          severity: 'high'
        }
      };
    } else if (negativeReviews > 5) {
      return {
        penalty: 10,
        flag: {
          rule: 'negative_spike_moderate',
          description: `${negativeReviews} negative reviews from hostel ${hostelBlock} in last 30 minutes`,
          severity: 'medium'
        }
      };
    }
    return { penalty: 0, flag: null };
  }

  /**
   * Rule 3: Rating variance from hostel average
   */
  static async checkRatingVariance(rating, hostelBlock) {
    const hostelReviews = await Review.find({ hostelBlock }).select('rating');
    if (hostelReviews.length < 3) return { penalty: 0, flag: null };

    const avg = hostelReviews.reduce((sum, r) => sum + r.rating, 0) / hostelReviews.length;
    const variance = Math.abs(rating - avg);

    if (variance > 3) {
      return {
        penalty: 20,
        flag: {
          rule: 'high_variance',
          description: `Rating deviates ${variance.toFixed(1)} points from hostel average (${avg.toFixed(1)})`,
          severity: 'high'
        }
      };
    } else if (variance > 2) {
      return {
        penalty: 10,
        flag: {
          rule: 'moderate_variance',
          description: `Rating deviates ${variance.toFixed(1)} points from hostel average (${avg.toFixed(1)})`,
          severity: 'medium'
        }
      };
    }
    return { penalty: 0, flag: null };
  }

  /**
   * Rule 4: Same IP multiple submissions
   */
  static async checkIPDuplication(ipAddress) {
    const last1h = new Date(Date.now() - 60 * 60 * 1000);
    const count = await Review.countDocuments({
      ipAddress,
      timestamp: { $gte: last1h }
    });

    if (count > 5) {
      return {
        penalty: 25,
        flag: {
          rule: 'ip_duplication',
          description: `${count} reviews submitted from the same IP address in last hour`,
          severity: 'high'
        }
      };
    } else if (count > 3) {
      return {
        penalty: 10,
        flag: {
          rule: 'ip_duplication_moderate',
          description: `${count} reviews submitted from the same IP in last hour`,
          severity: 'medium'
        }
      };
    }
    return { penalty: 0, flag: null };
  }

  /**
   * Rule 5: Review timing anomalies (reviews at unusual hours)
   */
  static async checkTimingAnomaly(userId) {
    const lastReview = await Review.findOne({ userId }).sort({ timestamp: -1 });
    if (!lastReview) return { penalty: 0, flag: null };

    const timeDiff = (Date.now() - lastReview.timestamp.getTime()) / 1000; // seconds

    if (timeDiff < 30) {
      return {
        penalty: 20,
        flag: {
          rule: 'rapid_submission',
          description: `Review submitted only ${Math.round(timeDiff)} seconds after the previous one`,
          severity: 'high'
        }
      };
    } else if (timeDiff < 120) {
      return {
        penalty: 10,
        flag: {
          rule: 'quick_submission',
          description: `Review submitted ${Math.round(timeDiff)} seconds after the previous one`,
          severity: 'medium'
        }
      };
    }
    return { penalty: 0, flag: null };
  }

  /**
   * Generate natural language explanation from flags
   */
  static generateExplanation(flags, score, status) {
    if (flags.length === 0) {
      return 'Review passed all credibility checks. No anomalies detected.';
    }

    const reasons = flags.map(f => f.description).join('. ');
    return `Review flagged as "${status}" (credibility score: ${score}/100). Reasons: ${reasons}.`;
  }
}

module.exports = MetricsEngine;
