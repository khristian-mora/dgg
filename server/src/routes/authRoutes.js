const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.post('/change-password', verifyToken, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
