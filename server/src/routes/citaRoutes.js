const express = require('express');
const router = express.Router();
const { getCitas, createCita, updateCitaStatus, deleteCita } = require('../controllers/citaController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getCitas);
router.post('/', verifyToken, createCita);
router.put('/:id/status', verifyToken, updateCitaStatus);
router.delete('/:id', verifyToken, deleteCita);

module.exports = router;
