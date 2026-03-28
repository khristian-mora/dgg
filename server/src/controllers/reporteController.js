const prisma = require('../config/prisma');

// Get overall performance data for the year
const getResumenAnual = async (req, res) => {
  try {
    // 1. Procedure count by month for current year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const tramites = await prisma.tramite.findMany({
      where: { createdAt: { gte: startOfYear } },
      select: { createdAt: true, valorAcuerdo: true }
    });

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyStats = months.map((m, i) => ({
      month: m,
      count: 0,
      revenue: 0
    }));

    tramites.forEach(t => {
      const mIdx = new Date(t.createdAt).getMonth();
      monthlyStats[mIdx].count += 1;
      monthlyStats[mIdx].revenue += t.valorAcuerdo || 0;
    });

    // 2. Procedures by Type (Pie Chart)
    const types = await prisma.tramite.groupBy({
      by: ['tipo'],
      _count: { _all: true }
    });

    const distributionByType = types.map(t => ({
        name: t.tipo,
        value: t._count._all
    }));

    // 3. Client growth
    const clients = await prisma.cliente.findMany({
        where: { createdAt: { gte: startOfYear } },
        select: { createdAt: true }
    });
    
    const clientStats = months.map(m => ({ month: m, count: 0 }));
    clients.forEach(c => {
        const mIdx = new Date(c.createdAt).getMonth();
        clientStats[mIdx].count += 1;
    });

    res.json({
        monthlyStats,
        distributionByType,
        clientStats
    });

  } catch (err) {
    res.status(500).json({ message: 'Error al generar reportes', error: err.message });
  }
};

module.exports = { getResumenAnual };
