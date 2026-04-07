const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTasks() {
  console.log('--- Depuración de Tareas Pendientes ---');
  try {
    const tasks = await prisma.tarea.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        asignadoA: { select: { nombre: true, email: true } },
        asignadoPor: { select: { nombre: true, email: true } }
      }
    });

    if (tasks.length === 0) {
      console.log('No se encontraron tareas en la base de datos.');
      return;
    }

    tasks.forEach(t => {
      console.log(`[${t.id}] ${t.titulo} | Estado: ${t.estado} | Limite: ${t.fechaLimite.toISOString()} | Creado: ${t.createdAt.toISOString()}`);
      console.log(`      Asignado A: ${t.asignadoA?.nombre || 'NADIE'} | Por: ${t.asignadoPor?.nombre || 'SISTEMA'}`);
      console.log('-----------------------------------');
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

debugTasks();
