const MetricsEngine = require('../services/metricsEngine');
const Review = require('../models/Review');
const MetricsResult = require('../models/MetricsResult');

// @desc    Analyze a review with metrics engine
// @route   POST /api/metrics/analyze
exports.analyzeReview = async (req, res, next) => {
  try {
    const { reviewId } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const result = await MetricsEngine.analyze(review, review.userId, review.ipAddress);

    // Update review reference
    review.metricsResult = result._id;
    await review.save();

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Get metrics result for a review
// @route   GET /api/metrics/:reviewId
exports.getMetricsResult = async (req, res, next) => {
  try {
    const result = await MetricsResult.findOne({ reviewId: req.params.reviewId });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Metrics result not found' });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
