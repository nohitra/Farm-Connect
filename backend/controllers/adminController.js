const {
  User,
  FarmerProfile,
  Hub,
  Region,
  OrderCycle,
  HubAssignmentRequest,
} = require('../models');

// ==========================================
// 1. REGION MANAGEMENT
// ==========================================

// @desc    Create new region
// @route   POST /api/admin/regions
// @access  Private (Admin)
const createRegion = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Region name is required' });
    }

    const existing = await Region.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Region name already exists' });
    }

    const region = await Region.create({ name: name.trim(), isActive: true });
    res.status(201).json({
      success: true,
      message: 'Region created successfully',
      region,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating region' });
  }
};

// @desc    Get all regions for Admin
// @route   GET /api/admin/regions
// @access  Private (Admin)
const getAdminRegions = async (req, res) => {
  try {
    const regions = await Region.find().sort({ createdAt: -1 });
    res.json({ success: true, count: regions.length, regions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching regions' });
  }
};

// @desc    Update region
// @route   PUT /api/admin/regions/:id
// @access  Private (Admin)
const updateRegion = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const region = await Region.findById(req.params.id);

    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }

    if (name !== undefined) region.name = name.trim();
    if (isActive !== undefined) region.isActive = isActive;

    await region.save();
    res.json({ success: true, message: 'Region updated successfully', region });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating region' });
  }
};

// ==========================================
// 2. HUB MANAGEMENT (MAX 5 HUBS PER REGION RULE)
// ==========================================

// @desc    Create Hub (Enforcing Max 5 Hubs Per Region Spec)
// @route   POST /api/admin/hubs
// @access  Private (Admin)
const createHub = async (req, res) => {
  try {
    const {
      name,
      regionId,
      anchorAddress,
      coordinates,
      serviceRadiusKm,
      pincodesCovered,
      contactPersonName,
      contactPhone,
      pickupWindowStart,
      pickupWindowEnd,
    } = req.body;

    if (!name || !regionId) {
      return res.status(400).json({ success: false, message: 'Hub name and regionId are required' });
    }

    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }

    // Spec Enforcer (Section 3 & 8): Maximum 5 hubs per region
    const existingHubCount = await Hub.countDocuments({ region: regionId, isActive: true });
    if (existingHubCount >= 5) {
      return res.status(400).json({
        success: false,
        message: `Region '${region.name}' already has the maximum allowed 5 hubs (v1 launch limit).`,
      });
    }

    const hub = await Hub.create({
      name: name.trim(),
      region: regionId,
      anchorAddress: anchorAddress || '',
      coordinates: coordinates || { lat: 0, lng: 0 },
      serviceRadiusKm: Number(serviceRadiusKm) || 4,
      pincodesCovered: Array.isArray(pincodesCovered) ? pincodesCovered : [],
      contactPersonName: contactPersonName || '',
      contactPhone: contactPhone || '',
      pickupWindowStart: pickupWindowStart || '18:00',
      pickupWindowEnd: pickupWindowEnd || '21:00',
      isActive: true,
    });

    const populatedHub = await Hub.findById(hub._id).populate('region', 'name');

    res.status(201).json({
      success: true,
      message: 'Hub created successfully',
      hub: populatedHub,
    });
  } catch (error) {
    console.error('Error creating hub:', error);
    res.status(500).json({ success: false, message: 'Error creating hub' });
  }
};

// @desc    Get all hubs for Admin
// @route   GET /api/admin/hubs
// @access  Private (Admin)
const getAdminHubs = async (req, res) => {
  try {
    const { regionId } = req.query;
    const filter = {};
    if (regionId) filter.region = regionId;

    const hubs = await Hub.find(filter).populate('region', 'name').sort({ createdAt: -1 });

    res.json({ success: true, count: hubs.length, hubs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching hubs' });
  }
};

// @desc    Update Hub
// @route   PUT /api/admin/hubs/:id
// @access  Private (Admin)
const updateHub = async (req, res) => {
  try {
    const hub = await Hub.findById(req.params.id);
    if (!hub) {
      return res.status(404).json({ success: false, message: 'Hub not found' });
    }

    const {
      name,
      anchorAddress,
      coordinates,
      serviceRadiusKm,
      pincodesCovered,
      contactPersonName,
      contactPhone,
      pickupWindowStart,
      pickupWindowEnd,
      isActive,
    } = req.body;

    if (name !== undefined) hub.name = name;
    if (anchorAddress !== undefined) hub.anchorAddress = anchorAddress;
    if (coordinates !== undefined) hub.coordinates = coordinates;
    if (serviceRadiusKm !== undefined) hub.serviceRadiusKm = Number(serviceRadiusKm);
    if (pincodesCovered !== undefined) hub.pincodesCovered = pincodesCovered;
    if (contactPersonName !== undefined) hub.contactPersonName = contactPersonName;
    if (contactPhone !== undefined) hub.contactPhone = contactPhone;
    if (pickupWindowStart !== undefined) hub.pickupWindowStart = pickupWindowStart;
    if (pickupWindowEnd !== undefined) hub.pickupWindowEnd = pickupWindowEnd;
    if (isActive !== undefined) hub.isActive = isActive;

    await hub.save();

    const updatedHub = await Hub.findById(hub._id).populate('region', 'name');
    res.json({ success: true, message: 'Hub updated successfully', hub: updatedHub });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating hub' });
  }
};

// ==========================================
// 3. FARMER VERIFICATION QUEUE & HUB ASSIGNMENT
// ==========================================

// @desc    Get all farmers (filter by status: pending, approved, rejected)
// @route   GET /api/admin/farmers
// @access  Private (Admin)
const getFarmers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.verificationStatus = status;
    }

    const farmers = await FarmerProfile.find(filter)
      .populate({
        path: 'user',
        select: 'name email phone region isVerified createdAt',
        populate: { path: 'region', select: 'name' },
      })
      .populate('assignedHubs', 'name anchorAddress serviceRadiusKm pincodesCovered');

    res.json({
      success: true,
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching farmers' });
  }
};

// @desc    Approve or Reject Farmer verification request
// @route   PATCH /api/admin/farmers/:farmerProfileId/verify
// @access  Private (Admin)
const verifyFarmer = async (req, res) => {
  try {
    const { farmerProfileId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const farmerProfile = await FarmerProfile.findById(farmerProfileId);
    if (!farmerProfile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    farmerProfile.verificationStatus = status;
    await farmerProfile.save();

    const user = await User.findById(farmerProfile.user);
    if (user) {
      user.isVerified = status === 'approved';
      await user.save();
    }

    res.json({
      success: true,
      message: `Farmer profile has been ${status}`,
      farmerProfile,
      userVerified: user ? user.isVerified : false,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating farmer verification status' });
  }
};

// @desc    Assign hubs to a farmer profile
// @route   POST /api/admin/farmers/:farmerProfileId/assign-hubs
// @access  Private (Admin)
const assignHubsToFarmer = async (req, res) => {
  try {
    const { farmerProfileId } = req.params;
    const { hubIds } = req.body;

    if (!Array.isArray(hubIds)) {
      return res.status(400).json({ success: false, message: 'hubIds must be an array of valid Hub IDs' });
    }

    const farmerProfile = await FarmerProfile.findById(farmerProfileId);
    if (!farmerProfile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    farmerProfile.assignedHubs = hubIds;
    await farmerProfile.save();

    const updatedProfile = await FarmerProfile.findById(farmerProfileId)
      .populate('user', 'name email phone')
      .populate('assignedHubs');

    res.json({
      success: true,
      message: 'Farmer hub assignments updated successfully',
      farmerProfile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating farmer hub assignments' });
  }
};

// ==========================================
// 4. FARMER-HUB ASSIGNMENT REQUEST QUEUE
// ==========================================

// @desc    Get pending farmer-hub assignment requests
// @route   GET /api/admin/hub-requests
// @access  Private (Admin)
const getHubAssignmentRequests = async (req, res) => {
  try {
    const requests = await HubAssignmentRequest.find()
      .populate({
        path: 'farmer',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('hub', 'name anchorAddress')
      .sort({ requestedAt: -1 });

    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching hub assignment requests' });
  }
};

// @desc    Approve or reject farmer-hub assignment request
// @route   PATCH /api/admin/hub-requests/:requestId
// @access  Private (Admin)
const handleHubAssignmentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const request = await HubAssignmentRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Hub assignment request not found' });
    }

    request.status = status;
    await request.save();

    if (status === 'approved') {
      const farmerProfile = await FarmerProfile.findById(request.farmer);
      if (farmerProfile && !farmerProfile.assignedHubs.includes(request.hub)) {
        farmerProfile.assignedHubs.push(request.hub);
        await farmerProfile.save();
      }
    }

    res.json({
      success: true,
      message: `Hub assignment request ${status}`,
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating hub assignment request' });
  }
};

// ==========================================
// 5. VIEW ALL ORDER CYCLES ACROSS REGIONS
// ==========================================

// @desc    View all order cycles across regions & hubs
// @route   GET /api/admin/all-cycles
// @access  Private (Admin)
const getAllOrderCycles = async (req, res) => {
  try {
    const cycles = await OrderCycle.find()
      .populate('region', 'name')
      .populate('hub', 'name anchorAddress serviceRadiusKm')
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

// @desc    Update Farmer profile & assigned hubs by Admin
// @route   PUT /api/admin/farmers/:farmerProfileId
// @access  Private (Admin)
const updateFarmerByAdmin = async (req, res) => {
  try {
    const { farmerProfileId } = req.params;
    const { farmName, farmLocation, farmingPractice, assignedHubs, verificationStatus, name, phone } = req.body;

    const farmerProfile = await FarmerProfile.findById(farmerProfileId);
    if (!farmerProfile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    if (farmName !== undefined) farmerProfile.farmName = farmName;
    if (farmLocation !== undefined) farmerProfile.farmLocation = farmLocation;
    if (farmingPractice !== undefined) farmerProfile.farmingPractice = farmingPractice;
    if (assignedHubs !== undefined && Array.isArray(assignedHubs)) farmerProfile.assignedHubs = assignedHubs;
    if (verificationStatus !== undefined) farmerProfile.verificationStatus = verificationStatus;

    await farmerProfile.save();

    const user = await User.findById(farmerProfile.user);
    if (user) {
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (verificationStatus !== undefined) {
        user.isVerified = verificationStatus === 'approved';
      }
      await user.save();
    }

    const updatedProfile = await FarmerProfile.findById(farmerProfileId)
      .populate('user', 'name email phone region isVerified')
      .populate('assignedHubs');

    res.json({
      success: true,
      message: 'Farmer profile updated successfully',
      farmer: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating farmer by admin:', error);
    res.status(500).json({ success: false, message: 'Error updating farmer profile' });
  }
};

module.exports = {
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
};

