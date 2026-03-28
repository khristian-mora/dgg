const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, updatePassword } = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Cambio de contraseña para el usuario logueado
router.put('/me/password', verifyToken, updatePassword);

// Solo SUPER_ADMIN puede gestionar usuarios y roles
router.get('/', verifyToken, checkRole(['SUPER_ADMIN']), getUsers);
router.post('/', verifyToken, checkRole(['SUPER_ADMIN']), createUser);
router.put('/:id', verifyToken, checkRole(['SUPER_ADMIN']), updateUser);
router.delete('/:id', verifyToken, checkRole(['SUPER_ADMIN']), deleteUser);

module.exports = router;
