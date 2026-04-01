const express = require('express');
const router = express.Router();
const { getTramites, createTramite, getTramiteDetail, addPaso, updateEstado, avanzarPaso, updateTramite, getAllPasosHistory } = require('../controllers/tramiteController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getTramites);
router.get('/history/all', verifyToken, getAllPasosHistory);
router.get('/:id', verifyToken, getTramiteDetail);
router.post('/', verifyToken, createTramite);
router.put('/:id', verifyToken, updateTramite);
router.post('/:id/pasos', verifyToken, addPaso);
router.post('/:id/avanzar-paso', verifyToken, avanzarPaso);
router.put('/:id/estado', verifyToken, updateEstado);

module.exports = router;
