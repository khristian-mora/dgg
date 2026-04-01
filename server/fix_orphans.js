const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOrphans() {
    try {
        const pasos = await prisma.pasoTramite.findMany();
        const tramites = await prisma.tramite.findMany({ select: { id: true } });
        const tramiteIds = new Set(tramites.map(t => t.id));
        
        const orphans = pasos.filter(p => !tramiteIds.has(p.tramiteId));
        console.log(`Found ${orphans.length} orphaned PasoTramite records.`);
        
        if (orphans.length > 0) {
            console.log('Deleting orphans...');
            const result = await prisma.pasoTramite.deleteMany({
                where: {
                    id: { in: orphans.map(o => o.id) }
                }
            });
            console.log('Deleted:', result.count);
        }
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

fixOrphans();
