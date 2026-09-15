const { OrderCycle, Hub } = require('../models');

/**
 * Calculates standardized weekly cycle timestamps:
 * - Window Opens: Monday at 09:00 AM
 * - Window Closes: Thursday at 09:00 PM (21:00)
 * - Farmer Hub Delivery & Consumer Pickup: Friday at 06:00 PM (18:00)
 * - Week End: Sunday at 23:59:59
 * - Next Cycle Window Opens: Following Monday at 09:00 AM
 */
const calculateCurrentWeeklyCycleTimes = (referenceDate = new Date()) => {
  const ref = new Date(referenceDate);
  const day = ref.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const currentMonday = new Date(ref);
  currentMonday.setDate(ref.getDate() + diffToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  const weekStartDate = new Date(currentMonday);

  const orderWindowOpen = new Date(currentMonday);
  orderWindowOpen.setHours(9, 0, 0, 0);

  const orderWindowClose = new Date(currentMonday);
  orderWindowClose.setDate(currentMonday.getDate() + 3); // Thursday
  orderWindowClose.setHours(21, 0, 0, 0);

  const deliveryDate = new Date(currentMonday);
  deliveryDate.setDate(currentMonday.getDate() + 4); // Friday
  deliveryDate.setHours(18, 0, 0, 0);

  const weekEndDate = new Date(currentMonday);
  weekEndDate.setDate(currentMonday.getDate() + 6); // Sunday
  weekEndDate.setHours(23, 59, 59, 999);

  const nextCycleOpen = new Date(currentMonday);
  nextCycleOpen.setDate(currentMonday.getDate() + 7); // Next Monday
  nextCycleOpen.setHours(9, 0, 0, 0);

  const isWindowOpen = ref >= orderWindowOpen && ref < orderWindowClose;
  const timeRemainingMs = isWindowOpen ? Math.max(0, orderWindowClose.getTime() - ref.getTime()) : 0;
  const timeToNextOpenMs = !isWindowOpen
    ? (ref < orderWindowOpen ? orderWindowOpen.getTime() - ref.getTime() : nextCycleOpen.getTime() - ref.getTime())
    : 0;

  return {
    weekStartDate,
    weekEndDate,
    orderWindowOpen,
    orderWindowClose,
    deliveryDate,
    nextCycleOpen,
    isWindowOpen,
    timeRemainingMs,
    timeToNextOpenMs,
  };
};

/**
 * Ensures an active weekly OrderCycle document exists for a given Hub matching the current week schedule
 */
const getOrCreateActiveCycleForHub = async (hubId, regionId = null) => {
  try {
    const times = calculateCurrentWeeklyCycleTimes();

    let cycle = await OrderCycle.findOne({
      hub: hubId,
      weekStartDate: { $gte: new Date(times.weekStartDate.getTime() - 86400000), $lte: new Date(times.weekStartDate.getTime() + 86400000) },
    }).populate('hub', 'name anchorAddress region').populate('region', 'name');

    if (!cycle) {
      let resolvedRegionId = regionId;
      if (!resolvedRegionId) {
        const hubDoc = await Hub.findById(hubId);
        if (hubDoc) resolvedRegionId = hubDoc.region;
      }

      if (resolvedRegionId) {
        cycle = await OrderCycle.create({
          region: resolvedRegionId,
          hub: hubId,
          weekStartDate: times.weekStartDate,
          weekEndDate: times.weekEndDate,
          orderWindowOpen: times.orderWindowOpen,
          orderWindowClose: times.orderWindowClose,
          deliveryDate: times.deliveryDate,
          status: times.isWindowOpen ? 'open' : 'closed',
        });

        cycle = await OrderCycle.findById(cycle._id)
          .populate('hub', 'name anchorAddress region')
          .populate('region', 'name');
      }
    } else {
      // Sync status if window closed or open
      const expectedStatus = times.isWindowOpen ? 'open' : (new Date() >= times.deliveryDate ? 'fulfilled' : 'closed');
      if (cycle.status !== expectedStatus && (cycle.status === 'open' || cycle.status === 'closed')) {
        cycle.status = expectedStatus;
        await cycle.save();
      }
    }

    return cycle;
  } catch (error) {
    console.error(`Error in getOrCreateActiveCycleForHub for Hub ${hubId}:`, error.message);
    return null;
  }
};

/**
 * Periodic automated sync job:
 * 1. Checks and transitions existing cycle statuses (open -> closed -> fulfilled)
 * 2. Auto-provisions current weekly cycles for all active hubs without requiring manual admin operations
 */
const syncHubWeeklyOrderCycles = async () => {
  try {
    const now = new Date();
    const times = calculateCurrentWeeklyCycleTimes(now);

    // 1. Auto-close any cycles whose orderWindowClose has passed
    const openCyclesToClose = await OrderCycle.find({
      status: 'open',
      orderWindowClose: { $lte: now },
    });

    for (const cycle of openCyclesToClose) {
      cycle.status = 'closed';
      await cycle.save();
      console.log(`🔒 [Auto-Scheduler] Closed OrderCycle ID: ${cycle._id} for Hub: ${cycle.hub} (Window closed Thu 9:00 PM)`);
    }

    // 2. Ensure all active hubs have a provisioned cycle for the current week
    const activeHubs = await Hub.find({ isActive: true });
    for (const hub of activeHubs) {
      await getOrCreateActiveCycleForHub(hub._id, hub.region);
    }
  } catch (error) {
    console.error('Error in syncHubWeeklyOrderCycles scheduler:', error.message);
  }
};

// Start periodic scheduler interval (runs every 30 seconds)
const startCycleScheduler = (intervalMs = 30000) => {
  console.log('⏱️ Recurring Weekly Order Cycle Auto-Scheduler started (Monday 9:00 AM - Thursday 9:00 PM Auto-Pilot)');
  // Initial check on startup
  syncHubWeeklyOrderCycles();
  // Set recurring interval
  return setInterval(syncHubWeeklyOrderCycles, intervalMs);
};

module.exports = {
  calculateCurrentWeeklyCycleTimes,
  getOrCreateActiveCycleForHub,
  syncHubWeeklyOrderCycles,
  startCycleScheduler,
};
