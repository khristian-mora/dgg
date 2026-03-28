const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const prisma = require('../config/prisma');
const { generateFormato } = require('../controllers/formatoController');

// GET all formats
router.get('/', authMiddleware, async (req, res) => {
    try {
        const formatos = await prisma.formato.findMany({ where: { isActive: true } });
        res.json(formatos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener formatos' });
    }
});

// GENERATE filled DOCX
router.post('/:id/generar', authMiddleware, generateFormato);

// GET one format
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const formato = await prisma.formato.findUnique({ where: { id: req.params.id } });
        res.json(formato);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener formato' });
    }
});

// CREATE format (Admin only)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const newFormato = await prisma.formato.create({ data: req.body });
        res.json(newFormato);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear formato' });
    }
});

// UPDATE format (Admin only)
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const updated = await prisma.formato.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar formato' });
    }
});

module.exports = router;
