const express = require('express');
const router = express.Router();
const {
  createRegion,
  getAdminRegions,
  updateRegion,
  createHub,
  getAdminHubs,
  updateHub,
  getFarmers,
  verifyFarmer,
  assignHubsToFarmer,
  updateFarmerByAdmin,
  getHubAssignmentRequests,
  handleHubAssignmentRequest,
  getAllOrderCycles,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

// Protect all admin routes & enforce admin role
router.use(protect);
router.use(authorize('admin'));

// Region Management
router.post('/regions', createRegion);
router.get('/regions', getAdminRegions);
router.put('/regions/:id', updateRegion);

// Hub Management
router.post('/hubs', createHub);
router.get('/hubs', getAdminHubs);
router.put('/hubs/:id', updateHub);

// Farmer Verification Queue & Hub Assignment
router.get('/farmers', getFarmers);
router.patch('/farmers/:farmerProfileId/verify', verifyFarmer);
router.post('/farmers/:farmerProfileId/assign-hubs', assignHubsToFarmer);
router.put('/farmers/:farmerProfileId', updateFarmerByAdmin);

// Farmer-Hub Assignment Requests Queue
router.get('/hub-requests', getHubAssignmentRequests);
router.patch('/hub-requests/:requestId', handleHubAssignmentRequest);

// Order Cycles Overview Across Regions
router.get('/all-cycles', getAllOrderCycles);

module.exports = router;
