const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [totalClientes, tramitesActivos, tramitesUrgentes, citasHoy] = await Promise.all([
      prisma.cliente.count({ where: { estado: 'ACTIVO' } }),
      prisma.tramite.count({ where: { estado: 'EN_PROCESO' } }),
      prisma.tramite.count({ where: { esUrgente: true, estado: 'EN_PROCESO' } }),
      prisma.cita.count({
        where: {
          fecha: { gte: startOfToday, lte: endOfToday }
        }
      })
    ]);

    // Financial stats (Super Admin / Gestión)
    let recaudoMes = 0;
    let carteraPendiente = 0;
    let cajaHoy = 0;

    if (req.user.rol === 'SUPER_ADMIN' || req.user.rol === 'GESTION') {
      // 1. Recaudo del Mes Actual
      const ingresosMes = await prisma.caja.aggregate({
        _sum: { valor: true },
        where: { 
          tipo: 'INGRESO',
          fecha: { gte: startOfMonth, lte: endOfMonth }
        }
      });
      recaudoMes = ingresosMes._sum.valor || 0;

      // 2. Cartera por Cobrar (Saldos pendientes de trámites en proceso)
      const tramitesSaldos = await prisma.tramite.aggregate({
        _sum: { saldoPendiente: true },
        where: { estado: 'EN_PROCESO' }
      });
      carteraPendiente = tramitesSaldos._sum.saldoPendiente || 0;

      // 3. Arqueo de Hoy
      const [ingresosHoy, egresosHoy] = await Promise.all([
        prisma.caja.aggregate({
          _sum: { valor: true },
          where: { tipo: 'INGRESO', fecha: { gte: startOfToday, lte: endOfToday } }
        }),
        prisma.caja.aggregate({
          _sum: { valor: true },
          where: { tipo: 'EGRESO', fecha: { gte: startOfToday, lte: endOfToday } }
        })
      ]);
      cajaHoy = (ingresosHoy._sum.valor || 0) - (egresosHoy._sum.valor || 0);
    }

    res.json({
      totalClientes,
      tramitesActivos,
      urgentes: tramitesUrgentes,
      citasHoy,
      recaudoMes,
      carteraPendiente,
      cajaHoy,
      nombreMes: now.toLocaleString('es-CO', { month: 'long' })
    });
  } catch (err) {
    console.error('Error al obtener estadísticas del dashboard:', err);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: err.message });
  }
};

module.exports = { getDashboardStats };
