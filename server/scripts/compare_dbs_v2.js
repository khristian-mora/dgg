const { PrismaClient } = require('@prisma/client');

async function compare() {
    console.log('--- DETAILED DB COMPARISON ---\n');

    const devPrisma = new PrismaClient({
        datasources: { db: { url: 'file:./prisma/dev.db' } }
    });
    const prodPrisma = new PrismaClient({
        datasources: { db: { url: 'file:../prisma/prod.db' } }
    });

    async function getStats(prisma, label) {
        const stats = {};
        try {
            stats.clientes = await prisma.cliente.count();
            stats.users = await prisma.user.count();
            stats.configs = await prisma.configuracion.count();
            stats.formatos = await prisma.formato.count();
            stats.caja = await prisma.caja.count();
            stats.tramites = await prisma.tramite.count();
        } catch (e) {
            console.error(`Error with ${label}:`, e.message);
        }
        return stats;
    }

    const devStats = await getStats(devPrisma, 'DEV');
    const prodStats = await getStats(prodPrisma, 'PROD');

    console.log('TABLE          | DEV COUNT | PROD COUNT');
    console.log('---------------|-----------|-----------');
    for (const key of Object.keys(devStats)) {
        console.log(`${key.padEnd(14)} | ${devStats[key].toString().padEnd(9)} | ${prodStats[key]}`);
    }

    // Identify production-unique users (Admin)
    try {
        const prodAdmins = await prodPrisma.user.findMany({
            where: { rol: { in: ['SUPER_ADMIN', 'GESTION'] } },
            select: { email: true, nombre: true, rol: true }
        });
        console.log('\n--- PROD ADMIN USERS ---');
        prodAdmins.forEach(u => console.log(`- ${u.nombre} (${u.email}) [${u.rol}]`));

        const devAdmins = await devPrisma.user.findMany({
            where: { rol: { in: ['SUPER_ADMIN', 'GESTION'] } },
            select: { email: true }
        });
        const devAdminEmails = devAdmins.map(u => u.email);
        const uniqueInProd = prodAdmins.filter(u => !devAdminEmails.includes(u.email));
        
        if (uniqueInProd.length > 0) {
            console.log('\n⚠️  Production has unique admins that will be lost if overwritten:');
            uniqueInProd.forEach(u => console.log(`   - ${u.email}`));
        }
    } catch (e) {
        console.error('Error fetching admins:', e.message);
    }

    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
}

compare();
