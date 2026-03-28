const express = require('express');
const router = express.Router();
const { getTareas, createTarea, updateTarea, deleteTarea } = require('../controllers/tareaController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.use(verifyToken); // Todas las rutas requieren token

router.get('/', getTareas);
router.post('/', checkRole(['SUPER_ADMIN']), createTarea);
router.put('/:id', updateTarea); // Un gestor podría querer marcar como en proceso? O solo completar? Update se usa para completar.
router.delete('/:id', checkRole(['SUPER_ADMIN']), deleteTarea);

module.exports = router;
