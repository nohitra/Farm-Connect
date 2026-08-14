const jwt = require('jsonwebtoken');
const { User, FarmerProfile, ConsumerProfile } = require('../models');

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'farmconnect_jwt_secret_key_2026_change_in_production'
    );

    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    req.user = user;

    // Attach role-specific profile if available
    if (user.role === 'farmer') {
      req.farmerProfile = await FarmerProfile.findOne({ user: user._id });
    } else if (user.role === 'consumer') {
      req.consumerProfile = await ConsumerProfile.findOne({ user: user._id }).populate('assignedHub');
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed or expired',
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Ensure Farmer is approved by Admin before listing produce or acting
const requireApprovedFarmer = async (req, res, next) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({
      success: false,
      message: 'Only farmers can access this resource',
    });
  }

  const farmerProfile = req.farmerProfile || (await FarmerProfile.findOne({ user: req.user._id }));

  if (!farmerProfile || farmerProfile.verificationStatus !== 'approved' || !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Your farmer profile is pending admin approval. You cannot list produce or accept orders until verified.',
      verificationStatus: farmerProfile ? farmerProfile.verificationStatus : 'pending',
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  requireApprovedFarmer,
};
