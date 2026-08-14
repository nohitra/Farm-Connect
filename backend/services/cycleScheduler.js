const { OrderCycle } = require('../models');

// Scheduled job function to auto-close order cycles whose window has expired
const checkAndCloseExpiredOrderCycles = async () => {
  try {
    const now = new Date();

    // Find all 'open' cycles where orderWindowClose timestamp has passed
    const expiredCycles = await OrderCycle.find({
      status: 'open',
      orderWindowClose: { $lte: now },
    });

    if (expiredCycles.length > 0) {
      console.log(`⏰ Found ${expiredCycles.length} expired order cycle(s) to close...`);

      for (const cycle of expiredCycles) {
        cycle.status = 'closed';
        await cycle.save();
        console.log(`   🔒 Closed OrderCycle ID: ${cycle._id} for Hub: ${cycle.hub}`);
      }
    }
  } catch (error) {
    console.error('Error in checkAndCloseExpiredOrderCycles scheduler:', error.message);
  }
};

// Start periodic scheduler interval (runs every 60 seconds)
const startCycleScheduler = (intervalMs = 60000) => {
  console.log('⏱️ Order Cycle Auto-Close Scheduler started (checking every 60s)');
  // Initial check on startup
  checkAndCloseExpiredOrderCycles();
  // Set recurring interval
  return setInterval(checkAndCloseExpiredOrderCycles, intervalMs);
};

module.exports = {
  checkAndCloseExpiredOrderCycles,
  startCycleScheduler,
};
