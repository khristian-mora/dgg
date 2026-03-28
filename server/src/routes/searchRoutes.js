const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/searchController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, globalSearch);

module.exports = router;
