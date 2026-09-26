const prisma = require('../config/prisma');
const fs = require('fs-extra');
const path = require('path');

/**
 * Obtiene la configuración de la landing page (Público)
 */
const getLandingConfig = async (req, res) => {
    const DEFAULT_CONFIG = {
        carousel: [],
        images: {
            logo: '/dgg_logo.jpg',
            securityBg: '/security_monitoring_city_night_1773868641447.png',
            teamPhoto: '/quienes_somos_team_1773866667700.png'
        },
        stats: {
            main: [
                { value: "12k+", label: "Trámites Exitosos" },
                { value: "99%", label: "Legalidad Total" },
                { value: "20+", label: "Años de Experiencia" }
            ],
            security: { growth: '', monthly: '' }
        }
    };

    try {
        console.log('[DEBUG] Buscando LANDING_PAGE_DATA...');
        const config = await prisma.configuracion.findUnique({
            where: { clave: 'LANDING_PAGE_DATA' }
        });

        console.log('[DEBUG] Resultado DB config:', config ? 'Encontrado' : 'No encontrado');

        if (!config) {
            return res.json(DEFAULT_CONFIG);
        }

        try {
            const parsed = JSON.parse(config.valor);
            return res.json({
                carousel: parsed.carousel || [],
                images: { ...DEFAULT_CONFIG.images, ...(parsed.images || {}) },
                stats: { ...DEFAULT_CONFIG.stats, ...(parsed.stats || {}) }
            });
        } catch (parseErr) {
            console.error('[ERROR] Fallo al parsear JSON de landing:', parseErr);
            return res.json(DEFAULT_CONFIG);
        }
    } catch (err) {
        console.error('[CRITICAL] Error en getLandingConfig:', err);
        // NUNCA devolvemos 500 para esta ruta, devolvemos los defaults
        return res.json(DEFAULT_CONFIG);
    }
};

/**
 * Actualiza la configuración completa de la landing page (Admin)
 */
const updateLandingConfig = async (req, res) => {
    const { data } = req.body;
    try {
        const config = await prisma.configuracion.upsert({
            where: { clave: 'LANDING_PAGE_DATA' },
            create: {
                clave: 'LANDING_PAGE_DATA',
                valor: JSON.stringify(data),
                descripcion: 'Configuración dinámica de la página principal (carousel, imágenes, stats)'
            },
            update: {
                valor: JSON.stringify(data)
            }
        });

        // Auditoría
        await prisma.auditLog.create({
            data: {
                accion: 'LANDING_CONFIG_ACTUALIZADA',
                userId: req.user.id,
                detalle: 'Se actualizó la configuración visual de la página principal',
                modulo: 'WEB_CONFIG'
            }
        });

        res.json({ message: 'Configuración actualizada correctamente', config });
    } catch (err) {
        console.error('Error al actualizar landing config:', err);
        res.status(400).json({ message: 'Error al actualizar configuración visual', error: err.message });
    }
};

/**
 * Sube una imagen para la landing page (Admin)
 */
const uploadLandingImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ninguna imagen' });
        }

        // Devolvemos la URL pública
        const url = `/uploads/documentos/${req.file.filename}`;
        
        res.json({ 
            message: 'Imagen subida con éxito', 
            url,
            filename: req.file.filename 
        });
    } catch (err) {
        console.error('Error al subir imagen landing:', err);
        res.status(500).json({ message: 'Error al procesar la imagen', error: err.message });
    }
};

module.exports = {
    getLandingConfig,
    updateLandingConfig,
    uploadLandingImage
};
