const express = require('express');
const router = express.Router();
const { getNotificaciones, markAsEnviado } = require('../controllers/notificacionController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getNotificaciones);
router.put('/:id/enviado', verifyToken, markAsEnviado);

module.exports = router;
