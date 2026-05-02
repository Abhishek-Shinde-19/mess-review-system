const express = require('express');
const router = express.Router();
const { getFairnessReports, getAdminReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/fairness', protect, authorize('admin', 'sysadmin'), getFairnessReports);
router.get('/admin', protect, authorize('admin', 'sysadmin'), getAdminReport);

module.exports = router;
