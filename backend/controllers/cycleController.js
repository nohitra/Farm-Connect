const { OrderCycle, Order, Hub, Region, FarmerProfile } = require('../models');
const {
  calculateCurrentWeeklyCycleTimes,
  getOrCreateActiveCycleForHub,
} = require('../services/cycleScheduler');

// @desc    Get active/current weekly order cycle and countdown schedule
// @route   GET /api/cycles/active OR GET /api/cycles/hub/:hubId/active
// @access  Private
const getActiveCycle = async (req, res) => {
  try {
    const hubId = req.params.hubId || req.query.hubId || null;
    const times = calculateCurrentWeeklyCycleTimes();

    let cycle = null;
    if (hubId) {
      cycle = await getOrCreateActiveCycleForHub(hubId);
    } else {
      cycle = await OrderCycle.findOne({
        status: times.isWindowOpen ? 'open' : { $in: ['open', 'closed', 'fulfilled'] },
      })
        .populate('region', 'name')
        .populate('hub', 'name anchorAddress')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      cycle,
      schedule: {
        isWindowOpen: times.isWindowOpen,
        orderWindowOpen: times.orderWindowOpen,
        orderWindowClose: times.orderWindowClose,
        deliveryDate: times.deliveryDate,
        nextCycleOpen: times.nextCycleOpen,
        timeRemainingMs: times.timeRemainingMs,
        timeToNextOpenMs: times.timeToNextOpenMs,
        weeklyRule: 'Monday 9:00 AM – Thursday 9:00 PM (Weekly Recurring Auto-Pilot)',
      },
    });
  } catch (error) {
    console.error('Error fetching active cycle:', error);
    res.status(500).json({ success: false, message: 'Error fetching active cycle status' });
  }
};

// @desc    Create a new weekly order cycle for a Hub
// @route   POST /api/admin/cycles
// @access  Private (Admin)
const createOrderCycle = async (req, res) => {
  try {
    const {
      regionId,
      hubId,
      weekStartDate,
      weekEndDate,
      orderWindowOpen,
      orderWindowClose,
      deliveryDate,
    } = req.body;

    if (!regionId || !hubId || !orderWindowOpen || !orderWindowClose || !deliveryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide regionId, hubId, orderWindowOpen, orderWindowClose, and deliveryDate',
      });
    }

    const hub = await Hub.findById(hubId);
    if (!hub) {
      return res.status(404).json({ success: false, message: 'Hub not found' });
    }

    const start = weekStartDate ? new Date(weekStartDate) : new Date(orderWindowOpen);
    const end = weekEndDate ? new Date(weekEndDate) : new Date(deliveryDate);

    const cycle = await OrderCycle.create({
      region: regionId,
      hub: hubId,
      weekStartDate: start,
      weekEndDate: end,
      orderWindowOpen: new Date(orderWindowOpen),
      orderWindowClose: new Date(orderWindowClose),
      deliveryDate: new Date(deliveryDate),
      status: 'open',
    });

    const populatedCycle = await OrderCycle.findById(cycle._id)
      .populate('region', 'name')
      .populate('hub', 'name anchorAddress');

    res.status(201).json({
      success: true,
      message: 'Weekly Order Cycle created successfully',
      cycle: populatedCycle,
    });
  } catch (error) {
    console.error('Error creating order cycle:', error);
    res.status(500).json({ success: false, message: 'Error creating order cycle' });
  }
};

// @desc    Get Order Cycles (filter by region, hub, status)
// @route   GET /api/admin/cycles
// @access  Private (Admin/Farmer/Consumer)
const getOrderCycles = async (req, res) => {
  try {
    const { regionId, hubId, status } = req.query;
    const filter = {};

    if (regionId) filter.region = regionId;
    if (hubId) filter.hub = hubId;
    if (status) filter.status = status;

    const cycles = await OrderCycle.find(filter)
      .populate('region', 'name')
      .populate('hub', 'name anchorAddress')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cycles.length,
      cycles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching order cycles' });
  }
};

// @desc    Update Order Cycle Status
// @route   PATCH /api/admin/cycles/:cycleId/status
// @access  Private (Admin)
const updateCycleStatus = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const { status } = req.body; // 'open', 'closed', 'fulfilled', 'completed'

    if (!['open', 'closed', 'fulfilled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const cycle = await OrderCycle.findById(cycleId);
    if (!cycle) {
      return res.status(404).json({ success: false, message: 'Order cycle not found' });
    }

    cycle.status = status;
    await cycle.save();

    res.json({
      success: true,
      message: `Order cycle status updated to ${status}`,
      cycle,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating cycle status' });
  }
};

// @desc    Aggregation Query: Total aggregated demand per farmer per hub per cycle
// @route   GET /api/admin/cycles/:cycleId/demand
// @access  Private (Admin/Farmer)
const getCycleAggregatedDemand = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const mongoose = require('mongoose');

    const cycle = await OrderCycle.findById(cycleId)
      .populate('region', 'name')
      .populate('hub', 'name anchorAddress');

    if (!cycle) {
      return res.status(404).json({ success: false, message: 'Order cycle not found' });
    }

    // Aggregation query: Group demand by farmer and produce item
    const aggregationResults = await Order.aggregate([
      {
        $match: {
          orderCycle: new mongoose.Types.ObjectId(cycleId),
          status: { $ne: 'cancelled' },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            farmer: '$farmer',
            produce: '$items.produce',
            produceName: '$items.name',
            unit: '$items.unit',
          },
          totalQuantityOrdered: { $sum: '$items.quantity' },
          totalGrossRevenue: {
            $sum: { $multiply: ['$items.priceAtOrder', '$items.quantity'] },
          },
          totalFarmerEarning: {
            $sum: { $multiply: ['$items.farmerEarningAtOrder', '$items.quantity'] },
          },
          totalPlatformFee: {
            $sum: { $multiply: ['$items.platformFeeAtOrder', '$items.quantity'] },
          },
          totalDeliveryCost: {
            $sum: { $multiply: ['$items.deliveryCostAtOrder', '$items.quantity'] },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.farmer',
          farmerProduceDemand: {
            $push: {
              produceId: '$_id.produce',
              produceName: '$_id.produceName',
              unit: '$_id.unit',
              totalQuantityOrdered: '$totalQuantityOrdered',
              totalGrossRevenue: '$totalGrossRevenue',
              totalFarmerEarning: '$totalFarmerEarning',
              totalPlatformFee: '$totalPlatformFee',
              totalDeliveryCost: '$totalDeliveryCost',
              orderCount: '$orderCount',
            },
          },
          totalFarmerEarningsForCycle: { $sum: '$totalFarmerEarning' },
          totalCycleRevenueForFarmer: { $sum: '$totalGrossRevenue' },
        },
      },
    ]);

    // Populate Farmer details for each grouped demand result
    const farmerProfileIds = aggregationResults.map((r) => r._id);
    const farmerProfiles = await FarmerProfile.find({ _id: { $in: farmerProfileIds } })
      .populate('user', 'name phone email');

    const farmerProfileMap = {};
    farmerProfiles.forEach((f) => { farmerProfileMap[f._id.toString()] = f; });

    const farmerDemandList = aggregationResults.map((resItem) => ({
      farmerProfile: farmerProfileMap[resItem._id.toString()] || null,
      totalFarmerEarningsForCycle: resItem.totalFarmerEarningsForCycle,
      totalCycleRevenueForFarmer: resItem.totalCycleRevenueForFarmer,
      produceItems: resItem.farmerProduceDemand,
    }));

    res.json({
      success: true,
      cycle,
      summary: {
        totalFarmersInvolved: farmerDemandList.length,
      },
      demandByFarmer: farmerDemandList,
    });
  } catch (error) {
    console.error('Error fetching cycle aggregated demand:', error);
    res.status(500).json({ success: false, message: 'Error performing demand aggregation query' });
  }
};

module.exports = {
  getActiveCycle,
  createOrderCycle,
  getOrderCycles,
  updateCycleStatus,
  getCycleAggregatedDemand,
};
