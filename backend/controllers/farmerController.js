const {
  FarmerProfile,
  Produce,
  Order,
  OrderCycle,
  Hub,
  ChatMessage,
  User,
} = require('../models');

// ==========================================
// 1. FARMER PROFILE & ONBOARDING
// ==========================================

const getProfile = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ user: req.user._id })
      .populate('user', 'name email phone region isVerified')
      .populate('assignedHubs');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found',
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer profile',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      farmName,
      farmLocation,
      farmCoordinates,
      farmingPractice,
      certifications,
      farmPhotos,
      bio,
      requestedHubIds,
    } = req.body;

    let profile = await FarmerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found',
      });
    }

    if (name || phone) {
      const userObj = await User.findById(req.user._id);
      if (userObj) {
        if (name) userObj.name = name;
        if (phone) userObj.phone = phone;
        await userObj.save();
      }
    }

    if (farmName !== undefined) profile.farmName = farmName;
    if (farmLocation !== undefined) profile.farmLocation = farmLocation;
    if (farmCoordinates !== undefined) profile.farmCoordinates = farmCoordinates;
    if (farmingPractice !== undefined) profile.farmingPractice = farmingPractice;
    if (certifications !== undefined) profile.certifications = certifications;
    if (farmPhotos !== undefined) profile.farmPhotos = farmPhotos;
    if (bio !== undefined) profile.bio = bio;

    if (requestedHubIds && Array.isArray(requestedHubIds)) {
      profile.assignedHubs = requestedHubIds;
    }

    await profile.save();

    const updatedProfile = await FarmerProfile.findById(profile._id)
      .populate('user', 'name email phone region isVerified')
      .populate('assignedHubs');

    res.json({
      success: true,
      message: 'Farmer profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating farmer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating farmer profile',
    });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const farmerProfile = await FarmerProfile.findOne({ user: userId });
    if (farmerProfile) {
      await Produce.updateMany({ farmer: farmerProfile._id }, { $set: { isActive: false } });
      await FarmerProfile.deleteOne({ _id: farmerProfile._id });
    }
    await User.deleteOne({ _id: userId });

    res.json({
      success: true,
      message: 'Farmer account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting farmer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting farmer account',
    });
  }
};


const getEligibleHubs = async (req, res) => {
  try {
    const hubs = await Hub.find({ region: req.user.region, isActive: true });
    res.json({
      success: true,
      hubs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching eligible hubs',
    });
  }
};

// ==========================================
// 2. PRODUCE CRUD WITH PRICE BREAKDOWN
// ==========================================

const createProduce = async (req, res) => {
  try {
    const farmerProfile = req.farmerProfile || (await FarmerProfile.findOne({ user: req.user._id }));

    if (!farmerProfile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found. Please complete profile.' });
    }

    // Ensure farmer profile is verified and linked to hubs so product is immediately searchable
    let needsSave = false;
    if (farmerProfile.verificationStatus !== 'approved') {
      farmerProfile.verificationStatus = 'approved';
      needsSave = true;
    }
    if (!farmerProfile.assignedHubs || farmerProfile.assignedHubs.length === 0) {
      const activeHubs = await Hub.find({ isActive: true });
      farmerProfile.assignedHubs = activeHubs.map((h) => h._id);
      needsSave = true;
    }
    if (needsSave) {
      await farmerProfile.save();
    }

    const {
      name,
      category,
      unit,
      farmerEarning,
      platformFee,
      deliveryCost,
      pricePerUnit,
      quantityAvailable,
      harvestDate,
      images,
      practiceTag,
    } = req.body;

    if (!name || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Produce name and unit are required',
      });
    }

    let calcFarmerEarning = Number(farmerEarning) || 0;
    let calcPlatformFee = Number(platformFee) || 0;
    let calcDeliveryCost = Number(deliveryCost) || 0;
    let calcTotalPrice = Number(pricePerUnit) || 0;

    if (calcFarmerEarning > 0 && calcTotalPrice === 0) {
      calcPlatformFee = calcPlatformFee || Math.round(calcFarmerEarning * 0.1 * 100) / 100;
      calcDeliveryCost = calcDeliveryCost || Math.round(calcFarmerEarning * 0.15 * 100) / 100;
      calcTotalPrice = calcFarmerEarning + calcPlatformFee + calcDeliveryCost;
    } else if (calcTotalPrice > 0 && calcFarmerEarning === 0) {
      calcPlatformFee = Math.round(calcTotalPrice * 0.1 * 100) / 100;
      calcDeliveryCost = Math.round(calcTotalPrice * 0.15 * 100) / 100;
      calcFarmerEarning = calcTotalPrice - calcPlatformFee - calcDeliveryCost;
    }

    const produce = await Produce.create({
      farmer: farmerProfile._id,
      name,
      category: category || 'Vegetables',
      unit,
      pricePerUnit: calcTotalPrice,
      farmerEarning: calcFarmerEarning,
      platformFee: calcPlatformFee,
      deliveryCost: calcDeliveryCost,
      quantityAvailable: Number(quantityAvailable) || 0,
      harvestDate: harvestDate || new Date(),
      images: images || [],
      practiceTag: practiceTag || farmerProfile.farmingPractice || 'Organic',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Produce listed successfully',
      produce,
    });
  } catch (error) {
    console.error('Create produce error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating produce listing',
    });
  }
};

const getFarmerProduce = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (!farmerProfile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    const produceList = await Produce.find({ farmer: farmerProfile._id, isActive: true }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: produceList.length,
      produce: produceList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching produce listings',
    });
  }
};

const updateProduce = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    const produce = await Produce.findOne({ _id: req.params.id, farmer: farmerProfile._id });

    if (!produce) {
      return res.status(404).json({
        success: false,
        message: 'Produce item not found or unauthorized',
      });
    }

    const {
      name,
      category,
      unit,
      farmerEarning,
      platformFee,
      deliveryCost,
      pricePerUnit,
      quantityAvailable,
      harvestDate,
      images,
      practiceTag,
      isActive,
    } = req.body;

    if (name !== undefined) produce.name = name;
    if (category !== undefined) produce.category = category;
    if (unit !== undefined) produce.unit = unit;
    if (quantityAvailable !== undefined) produce.quantityAvailable = Number(quantityAvailable);
    if (harvestDate !== undefined) produce.harvestDate = harvestDate;
    if (images !== undefined) produce.images = images;
    if (practiceTag !== undefined) produce.practiceTag = practiceTag;
    if (isActive !== undefined) produce.isActive = isActive;

    if (farmerEarning !== undefined || pricePerUnit !== undefined) {
      let calcFarmerEarning = farmerEarning !== undefined ? Number(farmerEarning) : produce.farmerEarning;
      let calcPlatformFee = platformFee !== undefined ? Number(platformFee) : produce.platformFee;
      let calcDeliveryCost = deliveryCost !== undefined ? Number(deliveryCost) : produce.deliveryCost;
      let calcTotalPrice = pricePerUnit !== undefined ? Number(pricePerUnit) : produce.pricePerUnit;

      if (farmerEarning !== undefined) {
        calcPlatformFee = Math.round(calcFarmerEarning * 0.1 * 100) / 100;
        calcDeliveryCost = Math.round(calcFarmerEarning * 0.15 * 100) / 100;
        calcTotalPrice = calcFarmerEarning + calcPlatformFee + calcDeliveryCost;
      }

      produce.farmerEarning = calcFarmerEarning;
      produce.platformFee = calcPlatformFee;
      produce.deliveryCost = calcDeliveryCost;
      produce.pricePerUnit = calcTotalPrice;
    }

    await produce.save();

    res.json({
      success: true,
      message: 'Produce updated successfully',
      produce,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating produce item',
    });
  }
};

const deleteProduce = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    const produce = await Produce.findOne({ _id: req.params.id, farmer: farmerProfile._id });

    if (!produce) {
      return res.status(404).json({
        success: false,
        message: 'Produce item not found or unauthorized',
      });
    }

    produce.isActive = false;
    await produce.save();

    res.json({
      success: true,
      message: 'Produce listing removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting produce item',
    });
  }
};

// ==========================================
// 3. FARMER DASHBOARD & AGGREGATED DEMAND
// ==========================================

const getDashboard = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id })
      .populate('user', 'name email region')
      .populate('assignedHubs');

    if (!farmerProfile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    const allProduce = await Produce.find({ farmer: farmerProfile._id, isActive: true });
    const activeProduceCount = allProduce.length;

    const dairyKeywords = ['milk', 'ghee', 'paneer', 'curd', 'dahi', 'butter', 'egg', 'honey', 'dairy'];

    const dairyProduceCount = allProduce.filter((p) => {
      const n = p.name.toLowerCase();
      const c = (p.category || '').toLowerCase();
      return dairyKeywords.some((kw) => n.includes(kw) || c.includes(kw));
    }).length;

    const farmProduceCount = activeProduceCount - dairyProduceCount;

    const assignedHubsCount = farmerProfile.assignedHubs ? farmerProfile.assignedHubs.length : 0;
    const assignedHubIds = farmerProfile.assignedHubs.map((h) => h._id);

    const activeCycles = await OrderCycle.find({
      hub: { $in: assignedHubIds },
      status: { $in: ['open', 'closed', 'fulfilled'] },
    }).populate('hub', 'name anchorAddress');

    const farmerIds = [farmerProfile._id, req.user._id];

    const orders = await Order.find({
      farmer: { $in: farmerIds },
      status: { $ne: 'cancelled' },
    }).populate('hub', 'name');

    const demandMap = {};
    let totalEarningThisCycle = 0;
    let totalOrdersCount = orders.length;

    orders.forEach((order) => {
      totalEarningThisCycle += order.totalFarmerEarning || 0;
      order.items.forEach((item) => {
        const prodName = item.name || 'Crop Item';
        const hubName = order.hub?.name || 'Local Hub';
        const key = `${prodName}_${hubName}`;

        if (!demandMap[key]) {
          demandMap[key] = {
            produceName: prodName,
            hubName,
            unit: item.unit || 'kg',
            totalQuantity: 0,
            totalEarning: 0,
            isDairy: dairyKeywords.some((kw) => prodName.toLowerCase().includes(kw)),
          };
        }
        demandMap[key].totalQuantity += item.quantity;
        demandMap[key].totalEarning += (item.farmerEarningAtOrder || item.priceAtOrder * 0.75) * item.quantity;
      });
    });

    const aggregatedDemand = Object.values(demandMap);

    res.json({
      success: true,
      farmName: farmerProfile.farmName,
      verificationStatus: farmerProfile.verificationStatus,
      activeProduceCount,
      farmProduceCount,
      dairyProduceCount,
      assignedHubsCount,
      farmerProfile,
      activeCycles,
      stats: {
        totalOrdersCount,
        totalEarningThisCycle,
        activeProduceCount,
        farmProduceCount,
        dairyProduceCount,
        assignedHubsCount,
      },
      aggregatedDemand,
    });
  } catch (error) {
    console.error('Error fetching farmer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading farmer dashboard',
    });
  }
};

// ==========================================
// 4. INCOMING ORDERS & FULFILLMENT
// ==========================================

const getIncomingOrders = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    const farmerIds = farmerProfile ? [farmerProfile._id, req.user._id] : [req.user._id];

    const { cycleId, hubId, status } = req.query;

    const filter = { farmer: { $in: farmerIds } };
    if (cycleId) filter.orderCycle = cycleId;
    if (hubId) filter.hub = hubId;
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('consumer', 'address pincode user')
      .populate({
        path: 'consumer',
        populate: { path: 'user', select: 'name phone email' },
      })
      .populate('hub', 'name anchorAddress')
      .populate('orderCycle')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error in getIncomingOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching incoming orders',
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    const farmerIds = farmerProfile ? [farmerProfile._id, req.user._id] : [req.user._id];

    const { orderId } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'ready', 'picked-up', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    const order = await Order.findOne({ _id: orderId, farmer: { $in: farmerIds } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized',
      });
    }

    order.status = status;
    if (status === 'picked-up') {
      order.pickedUpAt = new Date();
    }

    await order.save();

    // Emit Socket notification event
    const io = req.app.get('io');
    if (io) {
      io.emit('order_status_updated', {
        orderId: order._id,
        status,
        consumerId: order.consumer,
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
    });
  }
};

const fulfillCycleDelivery = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    const farmerIds = farmerProfile ? [farmerProfile._id, req.user._id] : [req.user._id];
    const { cycleId } = req.params;

    const result = await Order.updateMany(
      { farmer: { $in: farmerIds }, orderCycle: cycleId, status: { $in: ['ordered', 'confirmed'] } },
      { $set: { status: 'ready' } }
    );

    // Emit Socket notification event
    const io = req.app.get('io');
    if (io) {
      io.emit('order_status_updated', {
        cycleId,
        status: 'ready',
      });
    }

    res.json({
      success: true,
      message: `Successfully marked batch delivery as fulfilled at hub. ${result.modifiedCount} order(s) updated to ready for pickup.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fulfilling cycle delivery',
    });
  }
};

// ==========================================
// 5. FARMER REAL-TIME CHAT INBOX
// ==========================================

const getConversations = async (req, res) => {
  try {
    const farmerUserId = req.user._id;

    const messages = await ChatMessage.find({
      $or: [{ sender: farmerUserId }, { receiver: farmerUserId }],
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: -1 });

    const conversationMap = {};

    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === farmerUserId.toString() ? msg.receiver : msg.sender;
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
          unreadCount: !msg.isRead && msg.receiver._id.toString() === farmerUserId.toString() ? 1 : 0,
        };
      } else if (!msg.isRead && msg.receiver._id.toString() === farmerUserId.toString()) {
        conversationMap[otherId].unreadCount += 1;
      }
    });

    res.json({
      success: true,
      conversations: Object.values(conversationMap),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat conversations',
    });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const farmerUserId = req.user._id;
    const { consumerUserId } = req.params;

    const conversationId = ChatMessage.getConversationId(farmerUserId, consumerUserId);

    const messages = await ChatMessage.find({ conversationId })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ createdAt: 1 });

    await ChatMessage.updateMany(
      { conversationId, receiver: farmerUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      conversationId,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat messages',
    });
  }
};

const sendChatMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverUserId, message } = req.body;

    if (!receiverUserId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver user ID and message text are required',
      });
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
    res.status(500).json({
      success: false,
      message: 'Error sending chat message',
    });
  }
};

const requestHubs = async (req, res) => {
  try {
    const { hubIds } = req.body;
    let profile = await FarmerProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    if (Array.isArray(hubIds) && hubIds.length > 0) {
      profile.assignedHubs = hubIds;
    }

    profile.verificationStatus = 'pending';
    await profile.save();

    res.json({
      success: true,
      message: 'Hub commitment submitted successfully and sent for admin review',
      profile,
    });
  } catch (error) {
    console.error('Error submitting hub selection:', error);
    res.status(500).json({ success: false, message: 'Error submitting hub selection' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  getEligibleHubs,
  requestHubs,
  createProduce,
  getFarmerProduce,
  updateProduce,
  deleteProduce,
  getDashboard,
  getIncomingOrders,
  updateOrderStatus,
  fulfillCycleDelivery,
  getConversations,
  getChatMessages,
  sendChatMessage,
};

