const express = require('express');
const router = express.Router();
const { getSystemAudit } = require('../controllers/auditController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Solo SUPER_ADMIN puede ver los logs de auditoría global
router.get('/', verifyToken, checkRole(['SUPER_ADMIN']), getSystemAudit);

module.exports = router;
