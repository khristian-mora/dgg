const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function compareDBs() {
    console.log('--- DB COMPARISON START ---\n');

    // we need to use raw sqlite to check multiple files since Prisma connects to one URL
    const { execSync } = require('child_process');
    
    const dbPaths = {
        dev: path.resolve(__dirname, '../prisma/dev.db'),
        prod: path.resolve(__dirname, '../prisma/prod.db')
    };

    const getTables = (dbPath) => {
        try {
            const output = execSync(`sqlite3 "${dbPath}" ".tables"`).toString();
            return output.split(/\s+/).filter(t => t.length > 0);
        } catch (e) {
            console.error(`Error reading tables from ${dbPath}:`, e.message);
            return [];
        }
    };

    const devTables = getTables(dbPaths.dev);
    const prodTables = getTables(dbPaths.prod);

    console.log(`- Dev Tables (${devTables.length}): ${devTables.join(', ')}`);
    console.log(`- Prod Tables (${prodTables.length}): ${prodTables.join(', ')}`);

    const missingInProd = devTables.filter(t => !prodTables.includes(t));
    const missingInDev = prodTables.filter(t => !devTables.includes(t));

    if (missingInProd.length > 0) console.log(`⚠️  Missing in Production: ${missingInProd.join(', ')}`);
    if (missingInDev.length > 0) console.log(`⚠️  Missing in Development: ${missingInDev.join(', ')}`);

    // record counts for main tables
    const tablesToCheck = ['Cliente', 'User', 'Configuracion', 'Formato', 'Caja'];
    console.log('\n--- DATA SUMMARY ---');
    console.log('Table          | Dev Count | Prod Count');
    console.log('---------------|-----------|-----------');

    for (const table of tablesToCheck) {
        const getCount = (dbPath, tableName) => {
            try {
                return execSync(`sqlite3 "${dbPath}" "SELECT COUNT(*) FROM ${tableName}"`).toString().trim();
            } catch (e) {
                return 'N/A';
            }
        };
        const devCount = getCount(dbPaths.dev, table);
        const prodCount = getCount(dbPaths.prod, table);
        console.log(`${table.padEnd(14)} | ${devCount.toString().padEnd(9)} | ${prodCount}`);
    }

    console.log('\n--- DB COMPARISON END ---');
}

compareDBs().catch(console.error);
