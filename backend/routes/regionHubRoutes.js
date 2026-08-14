const express = require('express');
const router = express.Router();
const { getRegions, getAllHubs, getHubsByRegion } = require('../controllers/regionHubController');

router.get('/regions', getRegions);
router.get('/hubs', getAllHubs);
router.get('/regions/:regionId/hubs', getHubsByRegion);

module.exports = router;
