const prisma = require('../config/prisma');

const getNotificaciones = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const notifications = await prisma.notificacion.findMany({
            take: parseInt(limit),
            orderBy: { fechaEnvio: 'desc' },
            include: { cliente: true }
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
};

const markAsEnviado = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await prisma.notificacion.update({
            where: { id },
            data: { estado: 'ENVIADO' }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar estado', error: error.message });
    }
};

module.exports = { getNotificaciones, markAsEnviado };
