const Review = require('../models/Review');
const AIResult = require('../models/AIResult');
const MetricsEngine = require('../services/metricsEngine');
const AIEngineService = require('../services/aiEngine');
const ComparisonEngine = require('../services/comparisonEngine');

// @desc    Create a review
// @route   POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { rating, foodQuality, cleanliness, service, comment } = req.body;
    const userId = req.user._id;
    const hostelBlock = req.user.hostelBlock;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';

    // Count user's reviews in last 24h for frequency
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reviewFrequency = await Review.countDocuments({
      userId,
      timestamp: { $gte: last24h }
    });

    // Create review
    const review = await Review.create({
      userId,
      rating,
      foodQuality,
      cleanliness,
      service,
      comment,
      hostelBlock,
      ipAddress,
      reviewFrequency
    });

    // Run Metrics Engine
    const metricsResult = await MetricsEngine.analyze(review, userId, ipAddress);

    // Run AI Engine
    const aiResponse = await AIEngineService.analyze(review, userId);

    // Store AI result
    const aiResult = await AIResult.create({
      reviewId: review._id,
      userId,
      prediction: aiResponse.prediction,
      confidence: aiResponse.confidence,
      topFeatures: aiResponse.top_features || [],
      explanation: aiResponse.explanation || ''
    });

    // Update review references
    review.metricsResult = metricsResult._id;
    review.aiResult = aiResult._id;
    await review.save();

    // Run Comparison Engine
    const fairnessReport = await ComparisonEngine.compare(
      review._id,
      metricsResult,
      { ...aiResponse, aiResultId: aiResult._id }
    );

    res.status(201).json({
      success: true,
      data: {
        review,
        metricsResult,
        aiResult,
        fairnessReport
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews (admin) or user's reviews (student)
// @route   GET /api/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, hostelBlock } = req.query;
    let query = {};

    // Students see only their own reviews
    if (req.user.role === 'student') {
      query.userId = req.user._id;
    }

    if (hostelBlock) query.hostelBlock = hostelBlock;

    const reviews = await Review.find(query)
      .populate('userId', 'name email hostelBlock')
      .populate('metricsResult')
      .populate('aiResult')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments(query);

    // Filter by metrics status if requested
    let filteredReviews = reviews;
    if (status) {
      const reviewIds = reviews.map(r => r._id);
      filteredReviews = reviews.filter(r =>
        r.metricsResult && r.metricsResult.status === status
      );
    }

    res.json({
      success: true,
      count: filteredReviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: filteredReviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'name email hostelBlock')
      .populate('metricsResult')
      .populate('aiResult');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Students can only see their own reviews
    if (req.user.role === 'student' && review.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};
