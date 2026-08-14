const {
  ConsumerProfile,
  FarmerProfile,
  Produce,
  Order,
  OrderCycle,
  Hub,
  ChatMessage,
  User,
} = require('../models');

// ==========================================
// 1. CONSUMER PROFILE & ONBOARDING
// ==========================================

const getProfile = async (req, res) => {
  try {
    const profile = await ConsumerProfile.findOne({ user: req.user._id })
      .populate('user', 'name email phone region')
      .populate({
        path: 'assignedHub',
        populate: { path: 'region' },
      })
      .populate('savedFarmers');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Consumer profile not found' });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching consumer profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, pincode } = req.body;
    let profile = await ConsumerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Consumer profile not found' });
    }

    if (name || phone) {
      const userObj = await User.findById(req.user._id);
      if (userObj) {
        if (name) userObj.name = name;
        if (phone) userObj.phone = phone;
        await userObj.save();
      }
    }

    if (address !== undefined) profile.address = address;

    if (pincode && pincode !== profile.pincode) {
      profile.pincode = pincode;
      let matchedHub = await Hub.findOne({
        region: req.user.region,
        pincodesCovered: pincode,
        isActive: true,
      });

      if (!matchedHub) {
        matchedHub = await Hub.findOne({ region: req.user.region, isActive: true });
      }

      if (matchedHub) {
        profile.assignedHub = matchedHub._id;
      }
    }

    await profile.save();

    const updatedProfile = await ConsumerProfile.findById(profile._id)
      .populate('user', 'name email phone region')
      .populate({
        path: 'assignedHub',
        populate: { path: 'region' },
      });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating consumer profile' });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    await ConsumerProfile.deleteOne({ user: userId });
    await User.deleteOne({ _id: userId });
    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting consumer account' });
  }
};


// ==========================================
// 2. BROWSE PRODUCE (FILTERED TO ASSIGNED HUB ONLY)
// ==========================================

const getBrowseProduce = async (req, res) => {
  try {
    const consumerProfile = await ConsumerProfile.findOne({ user: req.user._id });

    let assignedHubId = consumerProfile ? consumerProfile.assignedHub : null;

    // 1. Try finding produce from approved farmers or farmers serving consumer's hub
    let filter = { isActive: true };
    if (assignedHubId) {
      const eligibleFarmers = await FarmerProfile.find({
        $or: [
          { assignedHubs: assignedHubId },
          { verificationStatus: 'approved' },
        ],
      });

      if (eligibleFarmers.length > 0) {
        const farmerIds = eligibleFarmers.map((f) => f._id);
        filter.farmer = { $in: farmerIds };
      }
    }

    let produceList = await Produce.find(filter)
      .populate({
        path: 'farmer',
        select: 'farmName farmLocation farmingPractice certifications farmPhotos bio rating user verificationStatus',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    // Fallback: If hub filter yielded 0 items, fetch all active produce so consumer search can find all products added by farmers
    if (produceList.length === 0) {
      produceList = await Produce.find({ isActive: true })
        .populate({
          path: 'farmer',
          select: 'farmName farmLocation farmingPractice certifications farmPhotos bio rating user verificationStatus',
          populate: { path: 'user', select: 'name email' },
        })
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      assignedHubId: assignedHubId || 'all',
      count: produceList.length,
      produce: produceList,
    });
  } catch (error) {
    console.error('Error fetching produce for consumer:', error);
    res.status(500).json({ success: false, message: 'Error fetching produce for your hub' });
  }
};

// ==========================================
// 3. FARMER PROFILE & SAVED FARMERS
// ==========================================

const getFarmerDetail = async (req, res) => {
  try {
    const { farmerProfileId } = req.params;
    const farmer = await FarmerProfile.findById(farmerProfileId)
      .populate('user', 'name email phone')
      .populate('assignedHubs', 'name anchorAddress');

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const produceList = await Produce.find({ farmer: farmer._id, isActive: true });

    res.json({
      success: true,
      farmer,
      produce: produceList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching farmer profile' });
  }
};

const toggleSaveFarmer = async (req, res) => {
  try {
    const { farmerProfileId } = req.params;
    const consumerProfile = await ConsumerProfile.findOne({ user: req.user._id });

    const index = consumerProfile.savedFarmers.indexOf(farmerProfileId);
    let isSaved = false;

    if (index > -1) {
      consumerProfile.savedFarmers.splice(index, 1);
    } else {
      consumerProfile.savedFarmers.push(farmerProfileId);
      isSaved = true;
    }

    await consumerProfile.save();

    res.json({
      success: true,
      isSaved,
      message: isSaved ? 'Farmer added to your saved list' : 'Farmer removed from saved list',
      savedFarmers: consumerProfile.savedFarmers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating saved farmers' });
  }
};

// ==========================================
// 4. CART & PLACE ORDER WITHIN ORDER WINDOW
// ==========================================

const placeOrder = async (req, res) => {
  try {
    const consumerProfile = await ConsumerProfile.findOne({ user: req.user._id });
    if (!consumerProfile || !consumerProfile.assignedHub) {
      return res.status(400).json({ success: false, message: 'No assigned hub found for your profile.' });
    }

    const hubId = consumerProfile.assignedHub;

    let activeCycle = await OrderCycle.findOne({
      hub: hubId,
      status: 'open',
      orderWindowClose: { $gt: new Date() },
    });

    if (!activeCycle) {
      const now = new Date();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const closeWindow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      activeCycle = await OrderCycle.create({
        region: req.user.region,
        hub: hubId,
        weekStartDate: now,
        weekEndDate: weekEnd,
        orderWindowOpen: now,
        orderWindowClose: closeWindow,
        deliveryDate: weekEnd,
        status: 'open',
      });
    }

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required to place an order.' });
    }

    const produceIds = items.map((i) => i.produceId);
    const produceDocs = await Produce.find({ _id: { $in: produceIds }, isActive: true });

    if (produceDocs.length !== items.length) {
      return res.status(400).json({ success: false, message: 'One or more produce items are unavailable.' });
    }

    const produceMap = {};
    produceDocs.forEach((p) => { produceMap[p._id.toString()] = p; });

    const orderItemsByFarmer = {};

    for (const item of items) {
      const doc = produceMap[item.produceId];
      const farmerId = doc.farmer.toString();
      const qty = Number(item.quantity);

      if (qty <= 0) continue;

      if (!orderItemsByFarmer[farmerId]) {
        orderItemsByFarmer[farmerId] = [];
      }

      orderItemsByFarmer[farmerId].push({
        produce: doc._id,
        name: doc.name,
        quantity: qty,
        unit: doc.unit,
        priceAtOrder: doc.pricePerUnit,
        farmerEarningAtOrder: doc.farmerEarning,
        platformFeeAtOrder: doc.platformFee,
        deliveryCostAtOrder: doc.deliveryCost,
      });
    }

    const createdOrders = [];

    for (const [farmerId, farmerItems] of Object.entries(orderItemsByFarmer)) {
      let totalAmount = 0;
      let totalFarmerEarning = 0;
      let totalPlatformFee = 0;
      let totalDeliveryCost = 0;

      farmerItems.forEach((item) => {
        totalAmount += item.priceAtOrder * item.quantity;
        totalFarmerEarning += item.farmerEarningAtOrder * item.quantity;
        totalPlatformFee += item.platformFeeAtOrder * item.quantity;
        totalDeliveryCost += item.deliveryCostAtOrder * item.quantity;
      });

      const order = await Order.create({
        consumer: consumerProfile._id,
        farmer: farmerId,
        hub: hubId,
        orderCycle: activeCycle._id,
        items: farmerItems,
        totalAmount,
        totalFarmerEarning,
        totalPlatformFee,
        totalDeliveryCost,
        paymentMethod: 'COD',
        status: 'ordered',
        orderedAt: new Date(),
      });

      const populatedOrder = await Order.findById(order._id)
        .populate({
          path: 'farmer',
          select: 'farmName farmLocation farmingPractice user',
          populate: { path: 'user', select: 'name phone' },
        })
        .populate('hub', 'name anchorAddress pickupWindowStart pickupWindowEnd');

      createdOrders.push(populatedOrder);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Payment Method: Cash on Delivery (COD) at Hub pickup.',
      orders: createdOrders,
      orderCycle: activeCycle,
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error placing order' });
  }
};

// ==========================================
// 5. MY ORDERS & HISTORY
// ==========================================

const getMyOrders = async (req, res) => {
  try {
    const consumerProfiles = await ConsumerProfile.find({ user: req.user._id });
    const consumerIds = [req.user._id, ...consumerProfiles.map((p) => p._id)];

    const orders = await Order.find({ consumer: { $in: consumerIds } })
      .populate({
        path: 'farmer',
        select: 'farmName farmLocation farmingPractice user',
        populate: { path: 'user', select: 'name phone' },
      })
      .populate('hub', 'name anchorAddress pickupWindowStart pickupWindowEnd')
      .populate('orderCycle')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    res.status(500).json({ success: false, message: 'Error fetching order history' });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const consumerProfiles = await ConsumerProfile.find({ user: req.user._id });
    const consumerIds = [req.user._id, ...consumerProfiles.map((p) => p._id)];

    const order = await Order.findOne({ _id: req.params.orderId, consumer: { $in: consumerIds } })
      .populate({
        path: 'farmer',
        select: 'farmName farmLocation farmingPractice bio farmPhotos user',
        populate: { path: 'user', select: 'name phone email' },
      })
      .populate('hub')
      .populate('orderCycle');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching order details' });
  }
};

const confirmOrderPickup = async (req, res) => {
  try {
    const consumerProfiles = await ConsumerProfile.find({ user: req.user._id });
    const consumerIds = [req.user._id, ...consumerProfiles.map((p) => p._id)];
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, consumer: { $in: consumerIds } });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = 'picked-up';
    order.pickedUpAt = new Date();
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('order_status_updated', {
        orderId: order._id,
        status: 'picked-up',
      });
    }

    res.json({
      success: true,
      message: 'Order pickup confirmed! Thank you for supporting your local farmer.',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error confirming order pickup' });
  }
};

// ==========================================
// 6. DASHBOARD & IMPACT STATS
// ==========================================

const getDashboardAndImpact = async (req, res) => {
  try {
    const consumerProfile = await ConsumerProfile.findOne({ user: req.user._id })
      .populate({
        path: 'assignedHub',
        populate: { path: 'region' },
      })
      .populate({
        path: 'savedFarmers',
        select: 'farmName farmLocation farmingPractice farmPhotos user',
        populate: { path: 'user', select: 'name' },
      });

    if (!consumerProfile) {
      return res.status(404).json({ success: false, message: 'Consumer profile not found' });
    }

    const consumerProfiles = await ConsumerProfile.find({ user: req.user._id });
    const consumerIds = [req.user._id, ...consumerProfiles.map((p) => p._id)];
    const hub = consumerProfile.assignedHub;

    const activeCycle = await OrderCycle.findOne({
      hub: hub ? hub._id : undefined,
      status: { $in: ['open', 'closed', 'fulfilled'] },
    }).sort({ createdAt: -1 });

    let cycleInfo = {
      statusText: activeCycle ? `Order window status: ${activeCycle.status.toUpperCase()}` : 'No active cycle',
      activeCycle,
      hubName: hub ? hub.name : 'Local Hub',
      pickupAddress: hub ? hub.anchorAddress : 'Community Center',
      pickupWindow: hub ? `${hub.pickupWindowStart} - ${hub.pickupWindowEnd}` : '9:00 AM - 6:00 PM',
    };

    const impactAggregation = await Order.aggregate([
      { $match: { consumer: { $in: consumerIds }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalAmount' },
          totalFarmerEarning: { $sum: '$totalFarmerEarning' },
          totalOrders: { $sum: 1 },
          distinctFarmers: { $addToSet: '$farmer' },
        },
      },
    ]);

    const impact = impactAggregation.length > 0 ? impactAggregation[0] : {
      totalSpent: 0,
      totalFarmerEarning: 0,
      totalOrders: 0,
      distinctFarmers: [],
    };

    const myFarmersAggregation = await Order.aggregate([
      { $match: { consumer: { $in: consumerIds }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$farmer',
          orderCount: { $sum: 1 },
          totalAmountSpent: { $sum: '$totalAmount' },
          totalMoneyToFarmer: { $sum: '$totalFarmerEarning' },
        },
      },
    ]);

    const farmerProfileIds = myFarmersAggregation.map((f) => f._id);
    const farmerProfilesDoc = await FarmerProfile.find({ _id: { $in: farmerProfileIds } })
      .populate('user', 'name phone email');

    const farmerDocMap = {};
    farmerProfilesDoc.forEach((f) => { farmerDocMap[f._id.toString()] = f; });

    const myFarmersList = myFarmersAggregation.map((agg) => ({
      farmerProfile: farmerDocMap[agg._id.toString()] || null,
      orderCount: agg.orderCount,
      totalAmountSpent: agg.totalAmountSpent,
      totalMoneyToFarmer: agg.totalMoneyToFarmer,
    }));

    res.json({
      success: true,
      cycleInfo,
      impactStats: {
        totalSpent: impact.totalSpent,
        totalFarmerEarning: impact.totalFarmerEarning,
        distinctFarmersCount: impact.distinctFarmers.length,
        totalOrdersCount: impact.totalOrders,
        weeklyOrderStreak: Math.min(impact.totalOrders, 4),
      },
      impact: {
        totalLifetimeSpent: impact.totalSpent,
        totalMoneyToFarmers: impact.totalFarmerEarning,
        distinctFarmersSupportedCount: impact.distinctFarmers.length,
        weeklyOrderStreak: Math.min(impact.totalOrders, 4),
      },
      myFarmers: myFarmersList.map(f => f.farmerProfile).filter(Boolean),
      farmers: myFarmersList.map(f => f.farmerProfile).filter(Boolean),
      savedFarmers: consumerProfile.savedFarmers,
    });
  } catch (error) {
    console.error('Consumer dashboard error:', error);
    res.status(500).json({ success: false, message: 'Error loading consumer dashboard & impact stats' });
  }
};

const getImpactStats = async (req, res) => {
  return getDashboardAndImpact(req, res);
};

const getMyFarmers = async (req, res) => {
  return getDashboardAndImpact(req, res);
};

// ==========================================
// 7. REAL-TIME CHAT INBOX FOR CONSUMER
// ==========================================

const getConversations = async (req, res) => {
  try {
    const consumerUserId = req.user._id;

    const messages = await ChatMessage.find({
      $or: [{ sender: consumerUserId }, { receiver: consumerUserId }],
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: -1 });

    const conversationMap = {};

    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === consumerUserId.toString() ? msg.receiver : msg.sender;
      const otherId = otherUser._id.toString();

      if (!conversationMap[otherId]) {
        conversationMap[otherId] = {
          conversationId: msg.conversationId,
          user: {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            role: otherUser.role,
          },
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: !msg.isRead && msg.receiver._id.toString() === consumerUserId.toString() ? 1 : 0,
        };
      } else if (!msg.isRead && msg.receiver._id.toString() === consumerUserId.toString()) {
        conversationMap[otherId].unreadCount += 1;
      }
    });

    res.json({
      success: true,
      conversations: Object.values(conversationMap),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chat conversations' });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const consumerUserId = req.user._id;
    const { farmerUserId } = req.params;

    const conversationId = ChatMessage.getConversationId(consumerUserId, farmerUserId);

    const messages = await ChatMessage.find({ conversationId })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ createdAt: 1 });

    await ChatMessage.updateMany(
      { conversationId, receiver: consumerUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      conversationId,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chat messages' });
  }
};

const sendChatMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverUserId, message } = req.body;

    if (!receiverUserId || !message) {
      return res.status(400).json({ success: false, message: 'Receiver user ID and message text are required' });
    }

    const conversationId = ChatMessage.getConversationId(senderId, receiverUserId);

    const chatMessage = await ChatMessage.create({
      sender: senderId,
      receiver: receiverUserId,
      conversationId,
      message,
    });

    const populatedMsg = await ChatMessage.findById(chatMessage._id)
      .populate('sender', 'name role')
      .populate('receiver', 'name role');

    const io = req.app.get('io');
    if (io) {
      io.emit('receive_message', populatedMsg);
    }

    res.status(201).json({
      success: true,
      chatMessage: populatedMsg,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending chat message' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  getBrowseProduce,
  getFarmerDetail,
  toggleSaveFarmer,
  placeOrder,
  getMyOrders,
  getOrderDetail,
  confirmOrderPickup,
  getDashboardAndImpact,
  getImpactStats,
  getMyFarmers,
  getConversations,
  getChatMessages,
  sendChatMessage,
};
