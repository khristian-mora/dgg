const { PrismaClient } = require('@prisma/client');
console.log('Got PrismaClient class');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
console.log('Initialized PrismaClient instance');
prisma.$connect()
  .then(() => {
    console.log('Connected successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to connect:', err);
    process.exit(1);
  });
