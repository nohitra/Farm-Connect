const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/farmerController');

const { protect, authorize, requireApprovedFarmer } = require('../middleware/auth');

// All farmer routes require authentication and farmer role
router.use(protect);
router.use(authorize('farmer'));

// Profile & Hubs
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);
router.get('/eligible-hubs', getEligibleHubs);
router.post('/hub-requests', requestHubs);

// Dashboard
router.get('/dashboard', getDashboard);

// Produce CRUD
router.get('/produce', getFarmerProduce);
router.post('/produce', requireApprovedFarmer, createProduce);
router.put('/produce/:id', requireApprovedFarmer, updateProduce);
router.delete('/produce/:id', requireApprovedFarmer, deleteProduce);

// Incoming Orders & Fulfillment
router.get('/orders', getIncomingOrders);
router.patch('/orders/:orderId/status', requireApprovedFarmer, updateOrderStatus);
router.patch('/cycles/:cycleId/fulfill', requireApprovedFarmer, fulfillCycleDelivery);

// Chat Inbox
router.get('/chat/conversations', getConversations);
router.get('/chat/messages/:consumerUserId', getChatMessages);
router.post('/chat/send', sendChatMessage);

module.exports = router;
