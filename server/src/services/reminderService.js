const cron = require('node-cron');
const prisma = require('../config/prisma');

/**
 * Servicio de Recordatorios GestorArmas Pro
 * Ejecuta tareas automáticas diariamente para mejorar el CRM y fidelización
 */
const startReminderJob = () => {
    console.log('--- Servicio de Recordatorios GestorArmas Pro Iniciado ---');
    
    // TAREA PRINCIPAL: 08:00 AM todos los días
    cron.schedule('0 8 * * *', async () => {
        console.log('[REMINDER] Iniciando tareas automatizadas del día...');
        
        try {
            await recordatoriosCitas();
            // await recordatoriosCumpleanios(); // Removido por solicitud del usuario
            await recordatoriosVencimientoSalvoconducto();
            await recordatoriosCompraMunicion();
            await generarResumenDiarioAdmin();
        } catch (err) {
            console.error('Error crítico en el servicio de recordatorios:', err);
        }
    });

    console.log('--- Tareas programadas: Citas, Cumpleaños, Salvoconductos, Munición ---');
};

/**
 * 1. Recordatorio de Citas (1 día antes)
 */
async function recordatoriosCitas() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const nextDayEnd = new Date(tomorrow);
    nextDayEnd.setHours(23, 59, 59, 999);

    const citas = await prisma.cita.findMany({
        where: {
            fecha: { gte: tomorrow, lte: nextDayEnd },
            recordatorioEnviado: false
        },
        include: { cliente: true }
    });

    for (const cita of citas) {
        if (!cita.cliente) continue;
        console.log(`[CITA] Recordatorio para ${cita.cliente.nombres} - Fecha: ${cita.fecha}`);
        
        // Enviar Email si el cliente tiene uno registrado
        if (cita.cliente.email) {
            const subject = 'Recordatorio de Cita - GestorArmas Pro';
            const message = `Hola ${cita.cliente.nombres}, recuerda tu cita mañana a las ${cita.hora}. Motivo: ${cita.motivo}.`;
            await sendEmail(cita.cliente.email, subject, message, { type: 'NOTIFICACION' });
        }

        await prisma.notificacion.create({
            data: {
                clienteId: cita.cliente.id,
                tramiteId: cita.tramiteId,
                asunto: 'Recordatorio de Cita',
                mensaje: `Hola ${cita.cliente.nombres}, recuerda tu cita mañana a las ${cita.hora}. Motivo: ${cita.motivo}.`,
                tipo: 'RECORDATORIO',
                canal: 'EMAIL',
                estado: 'ENVIADO'
            }
        });

        await prisma.cita.update({
            where: { id: cita.id },
            data: { recordatorioEnviado: true }
        });
    }
}

// Función de cumpleaños eliminada por solicitud del usuario

/**
 * 3. Recordatorio Vencimiento Salvoconducto (45 días antes)
 */
async function recordatoriosVencimientoSalvoconducto() {
    const fortyFiveDaysLater = new Date();
    fortyFiveDaysLater.setDate(fortyFiveDaysLater.getDate() + 45);
    fortyFiveDaysLater.setHours(0,0,0,0);

    const fortySixDaysLater = new Date(fortyFiveDaysLater);
    fortySixDaysLater.setDate(fortySixDaysLater.getDate() + 1);

    const armas = await prisma.arma.findMany({
        where: {
            fechaVencimientoSC: {
                gte: fortyFiveDaysLater,
                lte: fortySixDaysLater
            }
        },
        include: { cliente: true }
    });

    for (const arma of armas) {
        if (!arma.cliente) continue;
        console.log(`[SC VENCIMIENTO] El salvoconducto de ${arma.cliente.nombres} vence en 45 días`);

        const message = `⚠️ Aviso importante: Tu salvoconducto para el arma ${arma.marca} (${arma.numeroSerie}) vence el ${arma.fechaVencimientoSC.toLocaleDateString()}. Ya puedes iniciar el trámite de revalidación.`;
        
        // Enviar Email si el cliente lo tiene
        if (arma.cliente.email) {
            await sendEmail(arma.cliente.email, 'Aviso de Vencimiento de Salvoconducto', message, { type: 'NOTIFICACION' });
        }

        await prisma.notificacion.create({
            data: {
                clienteId: arma.cliente.id,
                asunto: 'Vencimiento de Salvoconducto',
                mensaje: message,
                tipo: 'VENCIMIENTO',
                canal: 'EMAIL',
                estado: 'ENVIADO'
            }
        });

        // Crear tarea urgente para la admin
        await prisma.tarea.create({
            data: {
                titulo: `Contactar a ${arma.cliente.nombres} - Revalidación`,
                descripcion: `El salvoconducto del arma ${arma.numeroSerie} vence en 45 días (${arma.fechaVencimientoSC.toLocaleDateString()}).`,
                fechaLimite: new Date(),
                prioridad: 'URGENTE',
                tipo: 'AUTOMATICA',
                clienteId: arma.cliente.id
            }
        });
    }
}

/**
 * 4. Recordatorio Compra de Munición (aprox 6 meses después de la última)
 */
async function recordatoriosCompraMunicion() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0,0,0,0);
    
    const sixMonthsAgoEnd = new Date(sixMonthsAgo);
    sixMonthsAgoEnd.setDate(sixMonthsAgoEnd.getDate() + 1);

    // Buscamos trámites de COMPRA_MUNICION completados hace exactamente 6 meses
    const tramitesMunicion = await prisma.tramite.findMany({
        where: {
            tipo: { contains: 'MUNICION' }, // O el nombre exacto que uses
            estado: 'COMPLETADO',
            fechaFin: {
                gte: sixMonthsAgo,
                lte: sixMonthsAgoEnd
            }
        },
        include: { cliente: true }
    });

    for (const tramite of tramitesMunicion) {
        if (!tramite.cliente) continue;
        console.log(`[MUNICION] ${tramite.cliente.nombres} compró munición hace 6 meses`);

        const message = `💬 Hola ${tramite.cliente.nombres}, ya han pasado 6 meses desde tu última compra de munición. ¡Ya puedes realizar este trámite nuevamente!`;
        
        // Enviar Email si el cliente lo tiene
        if (tramite.cliente.email) {
            await sendEmail(tramite.cliente.email, 'Disponibilidad de Compra de Munición', message, { type: 'NOTIFICACION' });
        }

        await prisma.notificacion.create({
            data: {
                clienteId: tramite.cliente.id,
                asunto: 'Compra de Munición disponible',
                mensaje: message,
                tipo: 'RECORDATORIO',
                canal: 'EMAIL',
                estado: 'ENVIADO'
            }
        });
    }
}

const { sendEmail } = require('./emailService');
const { sendAutomatedMessage } = require('./whatsappService');

/**
 * 5. Resumen Diario para la Dueña (Super Admin)
 */
async function generarResumenDiarioAdmin() {
    console.log('[SUMMARY] Generando resumen matutino para SUPER_ADMIN...');
    
    try {
        // --- WhatsApp Desactivado: No se procesan notificaciones PENDIENTES de WhatsApp ---
        const pendingTasks = await prisma.tarea.count({ where: { estado: 'PENDIENTE' } });
        const urgentTasks = await prisma.tarea.count({ where: { prioridad: 'URGENTE', estado: 'PENDIENTE' } });
        const todayAppointments = await prisma.cita.count({ 
            where: { 
                fecha: { gte: new Date(new Date().setHours(0,0,0,0)), lte: new Date(new Date().setHours(23,59,59,999)) } 
            } 
        });

        const adminUser = await prisma.user.findFirst({ where: { rol: 'SUPER_ADMIN' } });
        if (adminUser && adminUser.email) {
            const subject = `📊 Resumen Operativo DGG - ${new Date().toLocaleDateString('es-CO')}`;
            const text = `Hola ${adminUser.nombre}, hoy tienes ${todayAppointments} citas y ${urgentTasks} tareas urgentes en el sistema.`;
            const html = `
                <div style="font-family: Arial, sans-serif; background-color: #f4f5f1; padding: 40px; border-radius: 20px;">
                    <h1 style="color: #68774c; border-bottom: 2px solid #d5a115; padding-bottom: 10px;">GestorArmas Pro Dashboard</h1>
                    <p style="font-size: 16px; color: #363d2b;">Resumen diario de operaciones:</p>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 10px 0; padding: 15px; background: white; border-radius: 10px; border-left: 5px solid #d5a115;">
                            <strong>Citas Hoy:</strong> ${todayAppointments}
                        </li>
                        <li style="margin: 10px 0; padding: 15px; background: white; border-radius: 10px; border-left: 5px solid #ff4d4d;">
                            <strong>Tareas URGENTES:</strong> ${urgentTasks}
                        </li>
                        <li style="margin: 10px 0; padding: 15px; background: white; border-radius: 10px; border-left: 5px solid #a8b48f;">
                            <strong>Total Pendientes:</strong> ${pendingTasks}
                        </li>
                    </ul>
                    <a href="http://localhost:5001/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #68774c; color: white; border-radius: 10px; text-decoration: none; font-weight: bold;">
                        VER PANEL DE CONTROL
                    </a>
                </div>
            `;

            await sendEmail(adminUser.email, subject, text, { html, type: 'DEFAULT' });
        }

        console.log(`--- Resumen enviado correctamente ---`);
    } catch (err) {
        console.error('[SUMMARY ERROR]', err);
    }
}

module.exports = { startReminderJob };

