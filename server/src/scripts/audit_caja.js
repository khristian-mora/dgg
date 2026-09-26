const prisma = require('../config/prisma');

async function main() {
    const totalIngresos = await prisma.caja.aggregate({
        _sum: { valor: true },
        where: { tipo: 'INGRESO' }
    });
    const totalEgresos = await prisma.caja.aggregate({
        _sum: { valor: true },
        where: { tipo: 'EGRESO' }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const ingresosMes = await prisma.caja.aggregate({
        _sum: { valor: true },
        where: { tipo: 'INGRESO', fecha: { gte: startOfMonth, lte: endOfMonth } }
    });

    const movs = await prisma.caja.findMany({
        take: 10,
        orderBy: { fecha: 'desc' }
    });

    console.log('--- REPORTE DE CAJA ---');
    console.log('Total Histórico Ingresos:', totalIngresos._sum.valor);
    console.log('Total Histórico Egresos:', totalEgresos._sum.valor);
    console.log('Ingresos del Mes Actual:', ingresosMes._sum.valor);
    console.log('Últimos 10 movimientos:');
    console.log(JSON.stringify(movs, null, 2));
}

main().finally(() => process.exit(0));
