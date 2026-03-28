const express = require('express');
const router = express.Router();
const { getAllConfigs, updateConfig, getConfigByClave } = require('../controllers/configController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Solo SUPER_ADMIN puede alterar la configuración del sistema
router.get('/', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION']), getAllConfigs);
router.get('/:clave', verifyToken, getConfigByClave);
router.post('/upsert', verifyToken, checkRole(['SUPER_ADMIN']), updateConfig);

module.exports = router;
