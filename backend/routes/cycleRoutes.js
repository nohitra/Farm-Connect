const express = require('express');
const router = express.Router();
const {
  createOrderCycle,
  getOrderCycles,
  updateCycleStatus,
  getCycleAggregatedDemand,
} = require('../controllers/cycleController');

const { protect, authorize } = require('../middleware/auth');

// Public/Protected view of order cycles
router.get('/', protect, getOrderCycles);
router.get('/:cycleId/demand', protect, getCycleAggregatedDemand);

// Admin-only cycle creation & status management
router.post('/', protect, authorize('admin'), createOrderCycle);
router.patch('/:cycleId/status', protect, authorize('admin'), updateCycleStatus);

module.exports = router;
