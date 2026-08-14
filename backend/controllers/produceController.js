const { Produce } = require('../models');
const { calculatePriceBreakdown } = require('../services/priceEngine');

// @desc    Calculate live price breakdown for UI forms
// @route   POST /api/produce/price-breakdown
// @access  Public / Private
const calculateBreakdownLive = (req, res) => {
  try {
    const { farmerEarning, pricePerUnit, platformFee, deliveryCost } = req.body;
    const result = calculatePriceBreakdown({ farmerEarning, pricePerUnit, platformFee, deliveryCost });

    res.json({
      success: true,
      breakdown: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error calculating price breakdown' });
  }
};

// @desc    Get detailed price breakdown card metrics for a produce item
// @route   GET /api/produce/:id/price-breakdown
// @access  Public / Private
const getProducePriceBreakdownCard = async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id)
      .populate({
        path: 'farmer',
        select: 'farmName farmLocation farmingPractice rating',
      });

    if (!produce) {
      return res.status(404).json({ success: false, message: 'Produce item not found' });
    }

    const breakdown = calculatePriceBreakdown({
      farmerEarning: produce.farmerEarning,
      pricePerUnit: produce.pricePerUnit,
      platformFee: produce.platformFee,
      deliveryCost: produce.deliveryCost,
    });

    res.json({
      success: true,
      produceId: produce._id,
      name: produce.name,
      unit: produce.unit,
      farmer: produce.farmer,
      priceBreakdown: {
        pricePerUnit: produce.pricePerUnit,
        farmerEarning: produce.farmerEarning,
        platformFee: produce.platformFee,
        deliveryCost: produce.deliveryCost,
        percentages: breakdown.breakdownPercentages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching produce price breakdown card' });
  }
};

module.exports = {
  calculateBreakdownLive,
  getProducePriceBreakdownCard,
};
