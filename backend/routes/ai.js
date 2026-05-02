const express = require('express');
const router = express.Router();
const { analyzeReview, getAIResult } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.post('/analyze', protect, authorize('admin', 'sysadmin'), analyzeReview);
router.get('/:reviewId', protect, getAIResult);

module.exports = router;
