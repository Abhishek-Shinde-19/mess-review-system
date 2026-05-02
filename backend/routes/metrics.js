const express = require('express');
const router = express.Router();
const { analyzeReview, getMetricsResult } = require('../controllers/metricsController');
const { protect, authorize } = require('../middleware/auth');

router.post('/analyze', protect, authorize('admin', 'sysadmin'), analyzeReview);
router.get('/:reviewId', protect, getMetricsResult);

module.exports = router;
