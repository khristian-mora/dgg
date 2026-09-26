const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfig() {
  try {
    const config = await prisma.configuracion.findUnique({
      where: { clave: 'LANDING_PAGE_DATA' }
    });
    console.log('--- Landing Config in DB ---');
    console.log(JSON.stringify(config, null, 2));
    console.log('----------------------------');
  } catch (error) {
    console.error('Error checking config:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfig();
