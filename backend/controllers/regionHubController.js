const { Region, Hub } = require('../models');

// @desc    Get all active regions
// @route   GET /api/regions
// @access  Public
const getRegions = async (req, res) => {
  try {
    const regions = await Region.find({ isActive: true });
    res.json({
      success: true,
      regions,
    });
  } catch (error) {
    console.error('Error in getRegions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching regions',
    });
  }
};

// @desc    Get all active hubs
// @route   GET /api/hubs
// @access  Public
const getAllHubs = async (req, res) => {
  try {
    const hubs = await Hub.find({ isActive: true }).populate('region', 'name');
    res.json({
      success: true,
      hubs,
    });
  } catch (error) {
    console.error('Error in getAllHubs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hubs',
    });
  }
};

// @desc    Get hubs for a region
// @route   GET /api/regions/:regionId/hubs
// @access  Public
const getHubsByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;
    const hubs = await Hub.find({ region: regionId, isActive: true });
    res.json({
      success: true,
      hubs,
    });
  } catch (error) {
    console.error('Error in getHubsByRegion:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hubs',
    });
  }
};

module.exports = {
  getRegions,
  getAllHubs,
  getHubsByRegion,
};
