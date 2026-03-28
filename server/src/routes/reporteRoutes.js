const express = require('express');
const router = express.Router();
const { getResumenAnual } = require('../controllers/reporteController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Solo SUPER_ADMIN puede ver reportes detallados y analítica
router.get('/resumen-anual', verifyToken, checkRole(['SUPER_ADMIN']), getResumenAnual);

module.exports = router;
