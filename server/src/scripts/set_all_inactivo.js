const prisma = require('../config/prisma');

async function main() {
    const res = await prisma.cliente.updateMany({
        where: { estado: 'ACTIVO' },
        data: { estado: 'INACTIVO' }
    });
    console.log(`[OK] ${res.count} clientes actualizados a estado INACTIVO.`);
}

main().finally(() => process.exit(0));
