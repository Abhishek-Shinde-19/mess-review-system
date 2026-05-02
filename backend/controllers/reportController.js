const Review = require('../models/Review');
const MetricsResult = require('../models/MetricsResult');
const AIResult = require('../models/AIResult');
const FairnessReport = require('../models/FairnessReport');

// @desc    Get fairness reports
// @route   GET /api/reports/fairness
exports.getFairnessReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, disagreementsOnly } = req.query;
    let query = {};

    if (disagreementsOnly === 'true') {
      query.isDisagreement = true;
    }

    const reports = await FairnessReport.find(query)
      .populate({
        path: 'reviewId',
        populate: { path: 'userId', select: 'name email hostelBlock' }
      })
      .populate('metricsResultId')
      .populate('aiResultId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FairnessReport.countDocuments(query);

    res.json({
      success: true,
      count: reports.length,
      total,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get admin analytics
// @route   GET /api/reports/admin
exports.getAdminReport = async (req, res, next) => {
  try {
    // Total counts
    const totalReviews = await Review.countDocuments();
    const totalUsers = await require('../models/User').countDocuments();

    // Status distribution from metrics engine
    const metricsStats = await MetricsResult.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // AI prediction distribution
    const aiStats = await AIResult.aggregate([
      { $group: { _id: '$prediction', count: { $sum: 1 } } }
    ]);

    // Rating distribution
    const ratingDist = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Hostel-wise statistics
    const hostelStats = await Review.aggregate([
      {
        $group: {
          _id: '$hostelBlock',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          avgFoodQuality: { $avg: '$foodQuality' },
          avgCleanliness: { $avg: '$cleanliness' },
          avgService: { $avg: '$service' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Flagged reviews count
    const flaggedCount = await MetricsResult.countDocuments({
      status: { $in: ['Suspicious', 'Likely Spam'] }
    });

    // Agreement statistics
    const agreementStats = await FairnessReport.aggregate([
      {
        $group: {
          _id: null,
          avgAgreement: { $avg: '$agreementScore' },
          disagreements: { $sum: { $cond: ['$isDisagreement', 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    // Recent reviews timeline (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const timeline = await Review.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Suspicious activity timeline
    const suspiciousTimeline = await MetricsResult.aggregate([
      {
        $match: {
          status: { $in: ['Suspicious', 'Likely Spam'] },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalReviews,
        totalUsers,
        flaggedCount,
        metricsStats: metricsStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        aiStats: aiStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        ratingDistribution: ratingDist,
        hostelStats,
        agreementStats: agreementStats[0] || { avgAgreement: 0, disagreements: 0, total: 0 },
        timeline,
        suspiciousTimeline
      }
    });
  } catch (err) {
    next(err);
  }
};
