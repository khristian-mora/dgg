const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const password = 'Admin2026*';
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@dggestionarmas.com' },
    update: { passwordHash: hash, rol: 'SUPER_ADMIN', isActive: true },
    create: {
      nombre: 'Administrador Principal',
      email: 'admin@dggestionarmas.com',
      passwordHash: hash,
      rol: 'SUPER_ADMIN',
      isActive: true
    }
  });

  const totalClientes = await prisma.cliente.count();
  console.log('✅ Usuario admin creado/actualizado:', user.email);
  console.log('✅ Total de clientes en la base de datos:', totalClientes);
}

main()
  .catch(e => console.error('ERROR:', e))
  .finally(async () => await prisma.$disconnect());
