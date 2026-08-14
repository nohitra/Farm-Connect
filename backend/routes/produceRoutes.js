const express = require('express');
const router = express.Router();
const {
  calculateBreakdownLive,
  getProducePriceBreakdownCard,
} = require('../controllers/produceController');

router.post('/price-breakdown', calculateBreakdownLive);
router.get('/:id/price-breakdown', getProducePriceBreakdownCard);

module.exports = router;
