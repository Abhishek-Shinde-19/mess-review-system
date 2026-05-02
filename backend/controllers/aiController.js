const AIEngineService = require('../services/aiEngine');
const AIResult = require('../models/AIResult');
const Review = require('../models/Review');

// @desc    Analyze a review with AI engine
// @route   POST /api/ai/analyze
exports.analyzeReview = async (req, res, next) => {
  try {
    const { reviewId } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const aiResponse = await AIEngineService.analyze(review, review.userId);

    const aiResult = await AIResult.create({
      reviewId: review._id,
      userId: review.userId,
      prediction: aiResponse.prediction,
      confidence: aiResponse.confidence,
      topFeatures: aiResponse.top_features || [],
      explanation: aiResponse.explanation || ''
    });

    // Update review reference
    review.aiResult = aiResult._id;
    await review.save();

    res.json({ success: true, data: aiResult });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI result for a review
// @route   GET /api/ai/:reviewId
exports.getAIResult = async (req, res, next) => {
  try {
    const result = await AIResult.findOne({ reviewId: req.params.reviewId });
    if (!result) {
      return res.status(404).json({ success: false, message: 'AI result not found' });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
