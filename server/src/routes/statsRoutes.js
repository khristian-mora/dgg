const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/dashboard', verifyToken, getDashboardStats);

module.exports = router;
