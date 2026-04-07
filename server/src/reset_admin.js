const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetAdmin() {
  console.log('--- Reseteando Administrador ---');
  
  try {
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);

    const user = await prisma.user.upsert({
      where: { email: 'admin@dggestionarmas.com' },
      update: {
        passwordHash: adminPass,
        rol: 'SUPER_ADMIN',
        isActive: true
      },
      create: {
        nombre: 'Diana Gómez García',
        email: 'admin@dggestionarmas.com',
        passwordHash: adminPass,
        rol: 'SUPER_ADMIN',
        isActive: true
      }
    });

    console.log(`✅ Administrador reseteado con éxito:`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Contraseña: admin123`);
  } catch (error) {
    console.error('❌ Error al resetear administrador:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

resetAdmin();
