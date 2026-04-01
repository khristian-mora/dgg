const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      rol: {
        contains: 'ADMIN'
      }
    }
  });
  fs.writeFileSync('admins.json', JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
