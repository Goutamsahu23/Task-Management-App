const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const searchCtrl = require('../controllers/searchController');

router.get('/cards', protect, searchCtrl.searchCards);

module.exports = router;
