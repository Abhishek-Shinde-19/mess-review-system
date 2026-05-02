const express = require('express');
const router = express.Router();
const { createReview, getReviews, getReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('student'), createReview)
  .get(protect, getReviews);

router.route('/:id')
  .get(protect, getReview);

module.exports = router;
