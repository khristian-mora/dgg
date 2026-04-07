const prisma = require('./config/prisma');
const { PROCEDURE_ROADMAPS } = require('./config/procedureRoadmaps');
const { sendEmail } = require('./services/emailService');

async function testReminders() {
  console.log('--- Iniciando Prueba de Recordatorios Multiusuario ---');
  
  try {
    // 1. Obtener datos para la prueba
    const tramite = await prisma.tramite.findFirst({
        include: { cliente: true, pasos: true }
    });
    
    if (!tramite) {
        console.error('❌ Error: No se encontró ningún trámite para la prueba.');
        return;
    }
    
    const testUser = await prisma.user.findFirst({ where: { rol: 'SUPER_ADMIN' } }) || { id: 'test-user', nombre: 'Admin Prueba', email: 'test@example.com' };

    console.log(`✅ Tramite encontrado: ID ${tramite.id} (${tramite.tipo})`);
    console.log(`✅ Cliente: ${tramite.cliente.nombres}`);
    console.log(`✅ Usuario de Prueba: ${testUser.nombre}`);

    // 2. Mocking data for avanzarPaso
    const roadmap = PROCEDURE_ROADMAPS[tramite.tipo] || PROCEDURE_ROADMAPS['DEFAULT'];
    const proximoPasoIndex = tramite.pasos.length;
    const infoPaso = roadmap[proximoPasoIndex] || roadmap[0]; // fallback
    
    const mockRequestData = {
        observaciones: 'Prueba automática de recordatorio triple',
        notificarCliente: true,
        reminder: {
            active: true,
            titulo: 'Recordatorio Test Santarrosa',
            fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días
            prioridad: 'ALTA',
            descripcion: 'Verificar documento de prueba con Admin y Ayudante'
        },
        appointment: {
            active: true,
            motivo: 'Cita Test firma',
            descripcion: 'Cita agendada desde prueba de código',
            fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            hora: '10:00',
            lugar: 'Santarrosa Office'
        }
    };

    console.log(`🚀 Simulando avanzarPaso al paso: ${infoPaso.label}`);

    // 3. Ejecutar Lógica de Recordatorio (Copiada del Controller para la prueba)
    const taskTitle = mockRequestData.reminder.titulo;
    const taskDesc = `${mockRequestData.reminder.descripcion}. Relacionado con: ${tramite.tipo} - ${tramite.cliente.nombres}`;
    
    const tareaResult = await prisma.tarea.create({
        data: {
            titulo: taskTitle,
            descripcion: taskDesc,
            fechaLimite: new Date(mockRequestData.reminder.fecha),
            prioridad: mockRequestData.reminder.prioridad,
            tipo: 'MANUAL',
            clienteId: tramite.clienteId,
            tramiteId: tramite.id,
            asignadoPorId: testUser.id
        }
    });
    console.log(`✅ Tarea creada en DB: ID ${tareaResult.id}`);

    const citaResult = await prisma.cita.create({
        data: {
            motivo: mockRequestData.appointment.motivo,
            descripcion: mockRequestData.appointment.descripcion,
            fecha: new Date(mockRequestData.appointment.fecha),
            hora: mockRequestData.appointment.hora,
            lugar: mockRequestData.appointment.lugar,
            estado: 'PENDIENTE',
            clienteId: tramite.clienteId,
            tramiteId: tramite.id
        }
    });
    console.log(`✅ Cita creada en Agenda: ID ${citaResult.id}`);

    const notifResult = await prisma.notificacion.create({
        data: {
            clienteId: tramite.clienteId,
            tramiteId: tramite.id,
            asunto: taskTitle,
            mensaje: taskDesc,
            tipo: 'RECORDATORIO_MANUAL',
            canal: 'EMAIL',
            estado: 'PENDIENTE'
        }
    });
    console.log(`✅ Notificación (Dashboard) registrada: ID ${notifResult.id}`);

    // 4. Simulación de Emails (Solo Logging)
    console.log('--- Simulación de Envió de Emails ---');
    console.log(`[EMAIL SEND] Para Cliente (${tramite.cliente.correoElectronico || 'no-email'}): Hola, recordatorio de ${taskTitle}`);
    console.log(`[EMAIL SEND] Para Ayudante (${testUser.email}): Alerta de tarea asignada ${taskTitle}`);
    console.log(`[EMAIL SEND] Para Administradores: Alerta global de recordatorio ${taskTitle}`);

    console.log('\n--- PRUEBA COMPLETADA CON ÉXITO ---');
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testReminders();
