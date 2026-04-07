const express = require('express');
const router = express.Router();
const { getClientes, createCliente, getClienteById, updateCliente, uploadFoto, deleteCliente, hardDeleteCliente, activarPortal } = require('../controllers/clienteController');
const { verifyToken, checkRole, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// Registro público para nuevos prospectos sin necesidad de token
router.post('/public', createCliente);

// Rutas protegidas para administración de clientes
router.get('/', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), getClientes);
router.get('/:id', verifyToken, getClienteById);
router.post('/', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), createCliente);
router.put('/:id', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), updateCliente);
router.post('/:id/foto', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION', 'EMPLEADO']), upload.single('foto'), uploadFoto);
router.post('/:id/activar-portal', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION']), activarPortal);
router.delete('/:id', verifyToken, checkRole(['SUPER_ADMIN', 'GESTION']), deleteCliente);
router.delete('/:id/permanent', verifyToken, checkRole(['SUPER_ADMIN']), hardDeleteCliente);

module.exports = router;
