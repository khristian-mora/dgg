const cron = require('node-cron');
const prisma = require('../config/prisma');
const { sendEmail } = require('./emailService');

/**
 * Verifica si una opción de envío de correos está habilitada en la base de datos
 */
async function isConfigEnabled(key, defaultValue = false) {
    try {
        const config = await prisma.configuracion.findUnique({ where: { clave: key } });
        if (!config) return defaultValue;
        return config.valor === 'true' || config.valor === '1';
    } catch {
        return defaultValue;
    }
}

/**
 * Servicio de Recordatorios GestorArmas Pro
 * Ejecuta tareas automáticas diariamente respetando las preferencias de configuración
 */
const startReminderJob = () => {
    console.log('--- Servicio de Recordatorios GestorArmas Pro Iniciado ---');
    
    // TAREA PRINCIPAL: 08:00 AM todos los días
    cron.schedule('0 8 * * *', async () => {
        console.log('[REMINDER] Iniciando tareas automatizadas del día...');
        
        try {
            await recordatoriosCitas();
            await recordatoriosVencimientoSalvoconducto();
            await recordatoriosCompraMunicion();
            await generarResumenDiarioAdmin();
        } catch (err) {
            console.error('Error crítico en el servicio de recordatorios:', err);
        }
    });

    console.log('--- Tareas programadas: Citas, Salvoconductos, Munición, Resumen (Bajo Control) ---');
};

/**
 * 1. Recordatorio de Citas (1 día antes)
 */
async function recordatoriosCitas() {
    const emailEnabled = await isConfigEnabled('EMAIL_CITAS_ENABLED', false);

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
        
        // Enviar Email SOLO si está activado en Configuración
        if (emailEnabled && cita.cliente.correoElectronico) {
            const subject = 'Recordatorio de Cita - GestorArmas Pro';
            const message = `Hola ${cita.cliente.nombres}, recuerda tu cita mañana a las ${cita.hora}. Motivo: ${cita.motivo}.`;
            await sendEmail(cita.cliente.correoElectronico, subject, message, { type: 'NOTIFICACION' });
        }

        await prisma.notificacion.create({
            data: {
                clienteId: cita.cliente.id,
                tramiteId: cita.tramiteId,
                asunto: 'Recordatorio de Cita',
                mensaje: `Hola ${cita.cliente.nombres}, recuerda tu cita mañana a las ${cita.hora}. Motivo: ${cita.motivo}.`,
                tipo: 'RECORDATORIO',
                canal: 'SISTEMA',
                estado: 'ENVIADO'
            }
        });

        await prisma.cita.update({
            where: { id: cita.id },
            data: { recordatorioEnviado: true }
        });
    }
}

/**
 * 2. Recordatorio Vencimiento Salvoconducto (45 días antes)
 * Crea tarea interna en el CRM para la administradora. NO envía correo automático al cliente por defecto.
 */
async function recordatoriosVencimientoSalvoconducto() {
    const emailEnabled = await isConfigEnabled('EMAIL_VENCIMIENTO_ENABLED', false);

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

        const message = `Aviso importante: Tu salvoconducto para el arma ${arma.marca || ''} (${arma.numeroSerie || ''}) vence el ${arma.fechaVencimientoSC ? arma.fechaVencimientoSC.toLocaleDateString() : ''}. Ya puedes iniciar el trámite de revalidación.`;
        
        // Enviar Email SOLO si el administrador lo tiene activado explícitamente
        if (emailEnabled && arma.cliente.correoElectronico) {
            await sendEmail(arma.cliente.correoElectronico, 'Aviso de Vencimiento de Salvoconducto', message, { type: 'NOTIFICACION' });
        }

        // Crear tarea interna para la administradora en el panel
        await prisma.tarea.create({
            data: {
                titulo: `Contactar a ${arma.cliente.nombres} - Revalidación`,
                descripcion: `El salvoconducto del arma ${arma.numeroSerie || ''} vence en 45 días (${arma.fechaVencimientoSC ? arma.fechaVencimientoSC.toLocaleDateString() : ''}).`,
                fechaLimite: new Date(),
                prioridad: 'URGENTE',
                tipo: 'AUTOMATICA',
                clienteId: arma.cliente.id
            }
        });
    }
}

/**
 * 3. Recordatorio Compra de Munición (6 meses después de la última)
 */
async function recordatoriosCompraMunicion() {
    const emailEnabled = await isConfigEnabled('EMAIL_MUNICION_ENABLED', false);
    if (!emailEnabled) return; // Desactivado por defecto para evitar molestias

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0,0,0,0);
    
    const sixMonthsAgoEnd = new Date(sixMonthsAgo);
    sixMonthsAgoEnd.setDate(sixMonthsAgoEnd.getDate() + 1);

    const tramitesMunicion = await prisma.tramite.findMany({
        where: {
            tipo: { contains: 'MUNICION' },
            estado: 'COMPLETADO',
            fechaFin: {
                gte: sixMonthsAgo,
                lte: sixMonthsAgoEnd
            }
        },
        include: { cliente: true }
    });

    for (const tramite of tramitesMunicion) {
        if (!tramite.cliente || !tramite.cliente.correoElectronico) continue;
        console.log(`[MUNICION] ${tramite.cliente.nombres} compró munición hace 6 meses`);

        const message = `Hola ${tramite.cliente.nombres}, ya han pasado 6 meses desde tu última compra de munición. ¡Ya puedes realizar este trámite nuevamente!`;
        
        await sendEmail(tramite.cliente.correoElectronico, 'Disponibilidad de Compra de Munición', message, { type: 'NOTIFICACION' });
    }
}

/**
 * 4. Resumen Diario para la Dueña (Super Admin)
 */
async function generarResumenDiarioAdmin() {
    const resumenEnabled = await isConfigEnabled('EMAIL_RESUMEN_ADMIN_ENABLED', false);
    if (!resumenEnabled) return;

    console.log('[SUMMARY] Generando resumen matutino para SUPER_ADMIN...');
    
    try {
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
                <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px; border-radius: 20px; border: 1px solid #e2e8f0;">
                    <h1 style="color: #0f172a; border-bottom: 2px solid #d5a115; padding-bottom: 10px;">GestorArmas Pro Dashboard</h1>
                    <p style="font-size: 16px; color: #334155;">Resumen diario de operaciones:</p>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 10px 0; padding: 15px; background: white; border-radius: 10px; border-left: 5px solid #d5a115; border: 1px solid #e2e8f0;">
                            <strong>Citas Hoy:</strong> ${todayAppointments}
                        </li>
                        <li style="margin: 10px 0; padding: 15px; background: white; border-radius: 10px; border-left: 5px solid #ef4444; border: 1px solid #e2e8f0;">
                            <strong>Tareas URGENTES:</strong> ${urgentTasks}
                        </li>
                        <li style="margin: 10px 0; padding: 15px; background: white; border-radius: 10px; border-left: 5px solid #64748b; border: 1px solid #e2e8f0;">
                            <strong>Total Pendientes:</strong> ${pendingTasks}
                        </li>
                    </ul>
                    <a href="https://dggestionarmas.com/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #d5a115 0%, #f6e98d 50%, #b87b0f 100%); color: #0f172a; border-radius: 10px; text-decoration: none; font-weight: bold;">
                        VER PANEL DE CONTROL
                    </a>
                </div>
            `;

            await sendEmail(adminUser.email, subject, text, { html, type: 'DEFAULT' });
            console.log(`--- Resumen enviado correctamente a ${adminUser.email} ---`);
        }
    } catch (err) {
        console.error('[SUMMARY ERROR]', err);
    }
}

module.exports = { startReminderJob };


