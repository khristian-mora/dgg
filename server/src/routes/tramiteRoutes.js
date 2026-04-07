const express = require('express');
const router = express.Router();
const { getTramites, createTramite, getTramiteDetail, addPaso, updateEstado, avanzarPaso, updateTramite, getAllPasosHistory } = require('../controllers/tramiteController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO', 'CLIENTE']), getTramites);
router.get('/history/all', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), getAllPasosHistory);
router.get('/:id', verifyToken, getTramiteDetail);
router.post('/', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), createTramite);
router.put('/:id', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), updateTramite);
router.post('/:id/pasos', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), addPaso);
router.post('/:id/avanzar-paso', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), avanzarPaso);
router.put('/:id/estado', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), updateEstado);

module.exports = router;
