/**
 * Price Breakdown Calculation Engine (Task 9 & Section 2)
 *
 * Core Formula:
 * pricePerUnit = farmerEarning + platformFee + deliveryCost
 *
 * Default rates if not explicitly specified:
 * - Platform Fee: 10% of base farmer earning
 * - Delivery & Hub Logistics Cost: 15% of base farmer earning
 */

const calculatePriceBreakdown = ({ farmerEarning, pricePerUnit, platformFee, deliveryCost }) => {
  let calcFarmerEarning = Number(farmerEarning) || 0;
  let calcPlatformFee = Number(platformFee) || 0;
  let calcDeliveryCost = Number(deliveryCost) || 0;
  let calcTotalPrice = Number(pricePerUnit) || 0;

  if (calcFarmerEarning > 0 && calcTotalPrice === 0) {
    calcPlatformFee = calcPlatformFee || Math.round(calcFarmerEarning * 0.1 * 100) / 100;
    calcDeliveryCost = calcDeliveryCost || Math.round(calcFarmerEarning * 0.15 * 100) / 100;
    calcTotalPrice = Math.round((calcFarmerEarning + calcPlatformFee + calcDeliveryCost) * 100) / 100;
  } else if (calcTotalPrice > 0 && calcFarmerEarning === 0) {
    calcPlatformFee = Math.round(calcTotalPrice * 0.1 * 100) / 100;
    calcDeliveryCost = Math.round(calcTotalPrice * 0.15 * 100) / 100;
    calcFarmerEarning = Math.round((calcTotalPrice - calcPlatformFee - calcDeliveryCost) * 100) / 100;
  }

  // Calculate percentage shares for transparent frontend cost cards
  const farmerSharePercent = calcTotalPrice > 0 ? Math.round((calcFarmerEarning / calcTotalPrice) * 100) : 0;
  const platformFeePercent = calcTotalPrice > 0 ? Math.round((calcPlatformFee / calcTotalPrice) * 100) : 0;
  const deliveryCostPercent = calcTotalPrice > 0 ? Math.round((calcDeliveryCost / calcTotalPrice) * 100) : 0;

  return {
    farmerEarning: calcFarmerEarning,
    platformFee: calcPlatformFee,
    deliveryCost: calcDeliveryCost,
    pricePerUnit: calcTotalPrice,
    breakdownPercentages: {
      farmerSharePercent,
      platformFeePercent,
      deliveryCostPercent,
    },
  };
};

module.exports = {
  calculatePriceBreakdown,
};
