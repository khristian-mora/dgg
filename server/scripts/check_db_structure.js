const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listTables() {
    try {
        const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'prisma_%' AND name NOT LIKE 'sqlite_%'");
        console.log('--- TABLES IN dev.db ---');
        console.log(tables.map(t => t.name).join(', '));
        
        const counts = {};
        for (const table of tables) {
            const name = table.name;
            try {
                const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM ${name}`);
                counts[name] = count[0].c;
            } catch (e) {
                counts[name] = 'ERROR';
            }
        }
        console.log('\n--- RECORD COUNTS ---');
        console.log(JSON.stringify(counts, null, 2));
    } catch (err) {
        console.error('Error listing tables:', err);
    } finally {
        await prisma.$disconnect();
    }
}

listTables();
