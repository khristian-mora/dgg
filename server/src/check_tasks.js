const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTasks() {
  const email = 'admin@dggestionarmas.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  const tasks = await prisma.tarea.findMany({
    where: {
      estado: 'PENDIENTE'
    },
    include: { asignadoA: true, asignadoPor: true }
  });

  console.log(`Total Tareas Pendientes: ${tasks.length}`);
  tasks.slice(0, 3).forEach(t => {
    console.log(`ID: ${t.id} | Titulo: ${t.titulo} | AsignadoA: ${t.asignadoAId} | AsignadoPor: ${t.asignadoPorId}`);
  });
  
  process.exit(0);
}

checkTasks();
