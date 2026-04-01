const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@dggestionarmas.com';
  const newPassword = 'DggAdmin2026!';
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error(`Error: User with email ${email} not found.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  console.log(`Successfully reset password for ${email}.`);
  console.log(`New temporary password: ${newPassword}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
