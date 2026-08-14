const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/consumerController');

const { protect, authorize } = require('../middleware/auth');

// All consumer routes require authentication and consumer role
router.use(protect);
router.use(authorize('consumer'));

// Profile & Onboarding
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);

// Browse Produce (Filtered to assigned hub only)
router.get('/produce', getBrowseProduce);

// Farmer Details & Saved List
router.get('/farmers/:farmerProfileId', getFarmerDetail);
router.post('/farmers/:farmerProfileId/toggle-save', toggleSaveFarmer);

// Orders & Cart
router.post('/orders', placeOrder);
router.get('/orders', getMyOrders);
router.get('/orders/:orderId', getOrderDetail);
router.patch('/orders/:orderId/pickup', confirmOrderPickup);

// Dashboard, Impact & My Farmers
router.get('/dashboard', getDashboardAndImpact);
router.get('/impact', getImpactStats);
router.get('/my-farmers', getMyFarmers);

// Chat Inbox
router.get('/chat/conversations', getConversations);
router.get('/chat/messages/:farmerUserId', getChatMessages);
router.post('/chat/send', sendChatMessage);

module.exports = router;
