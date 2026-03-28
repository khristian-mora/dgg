const express = require('express');
const router = express.Router();
const { getClientes, createCliente, getClienteById, updateCliente, uploadFoto, deleteCliente, hardDeleteCliente } = require('../controllers/clienteController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// Registro público para nuevos prospectos sin necesidad de token
router.post('/public', createCliente);

// Rutas protegidas para administración de clientes
router.get('/', verifyToken, getClientes);
router.get('/:id', verifyToken, getClienteById);
router.post('/', verifyToken, createCliente);
router.put('/:id', verifyToken, updateCliente);
router.post('/:id/foto', verifyToken, upload.single('foto'), uploadFoto);
router.delete('/:id', verifyToken, deleteCliente);
router.delete('/:id/permanent', verifyToken, hardDeleteCliente);

module.exports = router;
