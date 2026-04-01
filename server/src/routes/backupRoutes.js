const express = require('express');
const router = express.Router();
const { handleManualBackup } = require('../controllers/backupController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

/**
 * GET /api/backups/download
 * Triggers a backup and downloads the most recent .db.gz file.
 */
router.get('/download', verifyToken, checkRole(['SUPER_ADMIN']), handleManualBackup);

module.exports = router;
