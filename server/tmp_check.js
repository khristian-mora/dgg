const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const clientes = await prisma.user.findMany({
    where: { rol: 'CLIENTE' },
    select: { id: true, nombre: true, email: true, clienteId: true }
  });
  
  for (const c of clientes) {
    process.stdout.write('CLIENTE: ' + c.nombre + ' | ' + c.email + ' | clienteId: ' + c.clienteId + '\n');
    if (c.clienteId) {
      const hash = await bcrypt.hash('Cliente123', 10);
      await prisma.user.update({ where: { id: c.id }, data: { passwordHash: hash } });
      process.stdout.write('Password reseteada a: Cliente123\n');
    }
  }
}
main().finally(() => prisma.$disconnect());
