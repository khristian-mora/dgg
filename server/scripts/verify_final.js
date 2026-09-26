const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function verify() {
    const dbPath = path.resolve(__dirname, '../prisma/prod.db');
    console.log(`Verificando: ${dbPath}`);
    const prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });
    
    try {
        const count = await prisma.cliente.count();
        console.log(`✅ TOTAL CLIENTES EN PROD.DB LOCAL: ${count}`);
        
        if (count > 0) {
            const sample = await prisma.cliente.findMany({ take: 2, select: { nombre: true, apellido: true } });
            console.log('Muestras:', JSON.stringify(sample));
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
