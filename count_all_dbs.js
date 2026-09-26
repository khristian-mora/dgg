const { PrismaClient } = require('@prisma/client');

const DBS = [
  { path: '/var/www/dgg/server/prisma/dev.db', label: 'dev.db (activa)' },
  { path: '/var/www/dgg/server/prisma/prod.db', label: 'prod.db' },
  { path: '/var/www/dgg/server/prisma/prod_original.db', label: 'prod_original.db' },
];

async function main() {
  for (const db of DBS) {
    const p = new PrismaClient({ datasources: { db: { url: `file:${db.path}` } } });
    try {
      const count = await p.cliente.count();
      console.log(`✅ ${db.label}: ${count} clientes`);
    } catch(e) {
      console.log(`❌ ${db.label}: ${e.message.split('\n')[0]}`);
    } finally {
      await p.$disconnect();
    }
  }
}

main().catch(console.error);
