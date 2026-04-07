const express = require('express');
const router = express.Router();
const { getCitas, createCita, updateCitaStatus, deleteCita, getEventosDia, getResumenMes } = require('../controllers/citaController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getCitas);
router.get('/agenda-dia', verifyToken, getEventosDia);
router.get('/agenda-resumen', verifyToken, getResumenMes);
router.post('/', verifyToken, createCita);
router.put('/:id/status', verifyToken, updateCitaStatus);
router.delete('/:id', verifyToken, deleteCita);

module.exports = router;
