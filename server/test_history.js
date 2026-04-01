const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function testHistory() {
    try {
        const pasos = await prisma.pasoTramite.findMany({
            include: {
                tramite: {
                    include: { cliente: true }
                }
            },
            orderBy: { fechaAccion: 'desc' },
            take: 100
        });
        fs.writeFileSync('test_error.json', JSON.stringify({ success: true, count: pasos.length }));
    } catch (error) {
        fs.writeFileSync('test_error.json', JSON.stringify({ success: false, message: error.message, stack: error.stack }, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

testHistory();
