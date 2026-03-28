const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const totalClientes = await prisma.cliente.count({ where: { estado: 'ACTIVO' } });
    const tramitesUrgentes = await prisma.tramite.count({ where: { esUrgente: true, estado: 'EN_PROCESO' } });
    const citasHoy = await prisma.cita.count({
      where: {
        fecha: {
          gte: new Date(new Date().setHours(0,0,0,0)),
          lt: new Date(new Date().setHours(23,59,59,999))
        }
      }
    });

    // Only SUPER_ADMIN sees full financial stats
    let totalIngresos = null;
    if (req.user.rol === 'SUPER_ADMIN') {
      const ingresos = await prisma.caja.aggregate({
        _sum: { valor: true },
        where: { tipo: 'INGRESO' }
      });
      totalIngresos = ingresos._sum.valor || 0;
    }

    res.json({
      tramitesActivos: totalClientes, // Using totalClientes as proxy for now
      urgentes: tramitesUrgentes,
      citasHoy,
      ingresos: totalIngresos ? `$${totalIngresos.toLocaleString()}` : "$0"
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: err.message });
  }
};

module.exports = { getDashboardStats };
