const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

/**
 * RUTAS CATÁLOGO DE ARMAS
 */
router.get('/armas', authMiddleware, async (req, res) => {
    try {
        const items = await prisma.catalogoArma.findMany({ where: { isActive: true } });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener catálogo' });
    }
});

router.post('/armas', authMiddleware, isAdmin, async (req, res) => {
    try {
        const item = await prisma.catalogoArma.create({ data: req.body });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear item del catálogo' });
    }
});

/**
 * RUTAS CONTACTOS (DIRECTORIO)
 */
router.get('/contactos', authMiddleware, async (req, res) => {
    try {
        const items = await prisma.contacto.findMany({ where: { isActive: true } });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener contactos' });
    }
});

router.post('/contactos', authMiddleware, isAdmin, async (req, res) => {
    try {
        const item = await prisma.contacto.create({ data: req.body });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear contacto' });
    }
});

/**
 * RUTAS DOCUMENTOS IMPORTANTES (DECRETOS/LEYES)
 */
router.get('/docs-importantes', authMiddleware, async (req, res) => {
    try {
        const items = await prisma.documentoImportante.findMany({ where: { isActive: true } });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener documentos importantes' });
    }
});

router.post('/docs-importantes', authMiddleware, isAdmin, async (req, res) => {
    try {
        const item = await prisma.documentoImportante.create({ data: req.body });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear documento importante' });
    }
});

module.exports = router;
