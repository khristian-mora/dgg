const express = require('express');
const router = express.Router();
const landingController = require('../controllers/landingController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../config/multer'); // Reuse existing multer config

/**
 * Rutas Públicas (Sin Token)
 */
router.get('/public/config', landingController.getLandingConfig);

/**
 * Rutas Administrativas (Protegidas)
 */
router.post('/admin/config', verifyToken, landingController.updateLandingConfig);
router.post('/admin/upload', verifyToken, upload.single('image'), landingController.uploadLandingImage);

module.exports = router;
