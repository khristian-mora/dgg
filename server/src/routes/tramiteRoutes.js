const express = require('express');
const router = express.Router();
const { getTramites, createTramite, getTramiteDetail, addPaso, updateEstado } = require('../controllers/tramiteController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getTramites);
router.get('/:id', verifyToken, getTramiteDetail);
router.post('/', verifyToken, createTramite);
router.post('/:id/pasos', verifyToken, addPaso);
router.put('/:id/estado', verifyToken, updateEstado);

module.exports = router;
