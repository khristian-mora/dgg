const express = require('express');
const router = express.Router();
const { createPago, getPagosByTramite, deletePago } = require('../controllers/pagoController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, createPago);
router.get('/tramite/:tramiteId', verifyToken, getPagosByTramite);
router.delete('/:id', verifyToken, deletePago);

module.exports = router;
