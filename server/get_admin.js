const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: {
      rol: 'SUPER_ADMIN'
    }
  });

  if (admin) {
    console.log('Super Admin found:');
    console.log('Name:', admin.nombre);
    console.log('Email:', admin.email);
    console.log('Role:', admin.rol);
  } else {
    console.log('No Super Admin found in the database.');
    
    // Check for GESTION role if no super admin
    const gestionUsers = await prisma.user.findMany({
      where: {
        rol: 'GESTION'
      }
    });
    
    if (gestionUsers.length > 0) {
      console.log('Found GESTION users:');
      gestionUsers.forEach(u => {
        console.log(`- ${u.nombre} (${u.email})`);
      });
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
