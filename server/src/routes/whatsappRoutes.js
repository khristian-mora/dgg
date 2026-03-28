const express = require('express');
const router = express.Router();
const { getWhatsAppStatus } = require('../services/whatsappService');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const QRCode = require('qrcode');

// Only Admin can see this
router.get('/status', verifyToken, checkRole(['SUPER_ADMIN']), async (req, res) => {
    const { status, lastQR } = getWhatsAppStatus();
    
    // If we have a QR, convert it to DataURI (image) for the web
    let qrImage = null;
    if (lastQR) {
        try {
            qrImage = await QRCode.toDataURL(lastQR);
        } catch (err) {
            console.error('Error generating QR image', err);
        }
    }
    
    res.json({
        status, 
        hasQR: !!lastQR, 
        qrImage
    });
});

module.exports = router;
