const { PrismaClient } = require('@prisma/client');

async function check() {
    console.log('--- STARTING DEEP COMPARISON ---\n');

    const devPrisma = new PrismaClient({ datasources: { db: { url: 'file:./prisma/dev.db' } } });
    const prodPrisma = new PrismaClient({ datasources: { db: { url: 'file:./prisma/prod.db' } } });

    async function getTables(prisma) {
        const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'prisma_%' AND name NOT LIKE 'sqlite_%'");
        return tables.map(t => t.name).sort();
    }

    const devTables = await getTables(devPrisma);
    const prodTables = await getTables(prodPrisma);

    console.log('STRUCTURE COMPARISON:');
    console.log(`- DEV Tables:  ${devTables.join(', ')}`);
    console.log(`- PROD Tables: ${prodTables.join(', ')}`);
    
    const onlyInDev = devTables.filter(t => !prodTables.includes(t));
    const onlyInProd = prodTables.filter(t => !devTables.includes(t));

    if (onlyInDev.length > 0) console.log(`\n⚠️  Tables ONLY in DEV: ${onlyInDev.join(', ')}`);
    if (onlyInProd.length > 0) console.log(`\n⚠️  Tables ONLY in PROD: ${onlyInProd.join(', ')}`);

    console.log('\nDATA COMPARISON (Counts):');
    console.log('Table'.padEnd(20) + ' | ' + 'DEV'.padEnd(10) + ' | ' + 'PROD');
    console.log('-'.repeat(50));

    const allTables = Array.from(new Set([...devTables, ...prodTables]));
    for (const table of allTables) {
        let devCount = 'N/A';
        let prodCount = 'N/A';
        
        if (devTables.includes(table)) {
            try {
                const res = await devPrisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM ${table}`);
                devCount = res[0].c;
            } catch(e) {}
        }
        if (prodTables.includes(table)) {
            try {
                const res = await prodPrisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM ${table}`);
                prodCount = res[0].c;
            } catch(e) {}
        }
        console.log(table.padEnd(20) + ' | ' + devCount.toString().padEnd(10) + ' | ' + prodCount);
    }

    console.log('\n--- COMPARISON COMPLETE ---');
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
}

check();
