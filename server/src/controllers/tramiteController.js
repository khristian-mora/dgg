const prisma = require('../config/prisma');
const { PROCEDURE_ROADMAPS } = require('../config/procedureRoadmaps');
const { sendEmail } = require('../services/emailService');

// List and search procedures
const getTramites = async (req, res) => {
  const { clienteId, estado, tipo, urgente } = req.query;
  
  try {
    const tramites = await prisma.tramite.findMany({
      where: {
        AND: [
          clienteId ? { clienteId } : {},
          estado ? { estado } : {},
          tipo ? { tipo } : {},
          urgente === 'true' ? { esUrgente: true } : {}
        ]
      },
      include: {
        cliente: {
          select: { nombres: true, apellidos: true, cedula: true }
        },
        arma: true,
        _count: { select: { pasos: true } },
        pasos: {
           orderBy: { fechaAccion: 'desc' },
           take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    const tramitesConProgreso = tramites.map(t => {
        const roadmap = PROCEDURE_ROADMAPS[t.tipo] || PROCEDURE_ROADMAPS['DEFAULT'];
        const totalPasos = t._count?.pasos ?? t.pasos.length;
        const progreso = Math.min(Math.round((totalPasos / roadmap.length) * 100), 100);
        return { ...t, progreso };
    });
    
    res.json(tramitesConProgreso);
  } catch (err) {
    res.status(500).json({ message: 'Error al recuperar trámites', error: err.message });
  }
};

// Create new procedure and update client if necessary
const createTramite = async (req, res) => {
  const { clienteId, armaId, tipo, valorAcuerdo, abono, esUrgente, observaciones } = req.body;
  
  try {
    // 1. Check if client exists
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    // 2. Create the procedure
    const tramite = await prisma.tramite.create({
      data: {
        clienteId,
        armaId: armaId || null,
        tipo,
        estado: 'EN_PROCESO',
        valorAcuerdo: parseFloat(valorAcuerdo) || 0,
        abonoTotal: parseFloat(abono) || 0,
        saldoPendiente: (parseFloat(valorAcuerdo) || 0) - (parseFloat(abono) || 0),
        esUrgente: esUrgente || false,
        observaciones: observaciones || null,
        ultimaAccion: 'PASO 1: Inicio de trámite',
        pasos: {
            create: {
                descripcion: `Trámite de ${tipo} iniciado por ${req.user.nombre}. Paso 1: Inicio.`,
                realizadoPor: req.user.nombre
            }
        }
      }
    });

    // 3. Update client type if he was a prospect
    if (cliente.tipoCliente === 'PROSPECTO') {
      await prisma.cliente.update({
        where: { id: clienteId },
        data: { tipoCliente: 'CLIENTE', estado: 'ACTIVO' }
      });
    }

    // 4. Register initial payment as box entry if there was an 'abono'
    if (parseFloat(abono) > 0) {
        await prisma.caja.create({
            data: {
                tipo: 'INGRESO',
                concepto: `Abono inicial trámite ${tipo} - Cliente ${cliente.nombres}`,
                valor: parseFloat(abono),
                categoria: 'tramite',
                referencia: tramite.id,
                clienteId: cliente.id // VINCULAR AL CLIENTE
            }
        });
        
        await prisma.pago.create({
            data: {
                tramiteId: tramite.id,
                clienteId: cliente.id, // VINCULAR AL CLIENTE
                tipo: 'ABONO',
                concepto: 'Abono inicial de apertura',
                valor: parseFloat(abono)
            }
        });
    }

    // 5. Crear tarea automática para revisión de documentos
    try {
        await prisma.tarea.create({
          data: {
            titulo: `Revisión: Trámite ${tipo}`,
            descripcion: `Validar documentos iniciales para ${cliente.nombres}.`,
            fechaLimite: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 días
            prioridad: esUrgente ? 'URGENTE' : 'NORMAL',
            tipo: 'AUTOMATICA',
            clienteId: cliente.id,
            tramiteId: tramite.id
          }
        });
    } catch (taskErr) {
        console.error('Error creating automatic task:', taskErr);
    }

    res.status(201).json(tramite);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear trámite', error: err.message });
  }
};

const getTramiteDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const tramite = await prisma.tramite.findUnique({
      where: { id },
      include: {
        cliente: true,
        arma: true,
        pasos: { orderBy: { fechaAccion: 'desc' } },
        pagos: { orderBy: { fecha: 'desc' } },
        documentos: { orderBy: { createdAt: 'desc' } },
        citas: true
      }
    });
    
    if (!tramite) return res.status(404).json({ message: 'Trámite no encontrado' });

    // Seguridad de Recurso: Si el usuario es un CLIENTE, solo puede ver su propio trámite
    if (req.user.rol === 'CLIENTE' && req.user.clienteId !== tramite.clienteId) {
        return res.status(403).json({ message: 'No tiene permiso para ver los detalles de este trámite' });
    }
    
    // Calcular avance basado en el número de pasos registrados vs total del roadmap
    const roadmap = PROCEDURE_ROADMAPS[tramite.tipo] || PROCEDURE_ROADMAPS['DEFAULT'];
    const pasosRealizados = tramite.pasos.length;
    const totalPasos = roadmap.length;
    const progreso = Math.min(Math.round((pasosRealizados / totalPasos) * 100), 100);

    res.json({
        ...tramite,
        roadmap,
        progreso
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener detalle del trámite', error: err.message });
  }
};

const addPaso = async (req, res) => {
    const { id } = req.params;
    const { descripcion, adjunto } = req.body;
    try {
        const paso = await prisma.pasoTramite.create({
            data: {
                tramiteId: id,
                descripcion,
                adjunto,
                realizadoPor: req.user.nombre
            }
        });
        
        await prisma.tramite.update({
            where: { id },
            data: { ultimaAccion: descripcion, updatedAt: new Date() }
        });
        
        res.status(201).json(paso);
    } catch (err) {
        res.status(400).json({ message: 'Error al registrar paso', error: err.message });
    }
};

const updateEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const tramite = await prisma.tramite.update({
      where: { id },
      data: { estado }
    });
    
    await prisma.pasoTramite.create({
        data: {
            tramiteId: id,
            descripcion: `Estado cambiado a: ${estado}`,
            realizadoPor: req.user.nombre
        }
    });
    
    res.json(tramite);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar estado', error: err.message });
  }
};

const avanzarPaso = async (req, res) => {
    const { id } = req.params;
    const { observaciones, notificarCliente, reminder, appointment } = req.body;
    
    console.log(`[AVANZAR PASO] Iniciando para trámite ${id}`);
    
    try {
        const tramite = await prisma.tramite.findUnique({
            where: { id },
            include: { pasos: { orderBy: { fechaAccion: 'asc' } }, cliente: true }
        });
        
        if (!tramite) return res.status(404).json({ message: 'Trámite no encontrado' });
        
        const roadmap = PROCEDURE_ROADMAPS[tramite.tipo] || PROCEDURE_ROADMAPS['DEFAULT'];
        const proximoPasoIndex = tramite.pasos.length;
        
        if (proximoPasoIndex >= roadmap.length) {
            return res.status(400).json({ message: 'El trámite ya ha completado todos los pasos del roadmap' });
        }
        
        const infoPaso = roadmap[proximoPasoIndex] || { id: proximoPasoIndex + 1, label: 'Paso Extra', desc: 'Gestión adicional' };
        const descripcionPaso = `PASO ${infoPaso.id}: ${infoPaso.label} - ${observaciones || infoPaso.desc}`;
        
        // 1. Registro del paso (Crítico)
        const nuevoPaso = await prisma.pasoTramite.create({
            data: {
                tramiteId: id,
                descripcion: descripcionPaso,
                realizadoPor: req.user.nombre || 'Sistema'
            }
        });
        console.log(`[AVANZAR PASO] Paso registrado: ${nuevoPaso.id}`);
        
        // 2. Actualizar trámite (Crítico)
        const esUltimoPaso = proximoPasoIndex === roadmap.length - 1;
        const nuevoEstado = esUltimoPaso ? 'COMPLETADO' : tramite.estado;
        
        await prisma.tramite.update({
            where: { id },
            data: { 
                ultimaAccion: descripcionPaso,
                estado: nuevoEstado,
                updatedAt: new Date(),
                fechaFin: esUltimoPaso ? new Date() : tramite.fechaFin
            }
        });
        console.log(`[AVANZAR PASO] Trámite actualizado. Estado: ${nuevoEstado}`);
        
        // 3. SECUNDARIO: Crear Recordatorio Manual (Tarea)
        if (reminder && reminder.active && reminder.fecha) {
            try {
                const taskTitle = reminder.titulo || `Recordatorio: ${infoPaso.label}`;
                const taskDesc = `${reminder.descripcion || 'Sin descripción adicional'}. Relacionado con: ${tramite.tipo} - ${tramite.cliente.nombres}`;
                
                await prisma.tarea.create({
                    data: {
                        titulo: taskTitle,
                        descripcion: taskDesc,
                        fechaLimite: new Date(reminder.fecha),
                        prioridad: reminder.prioridad || 'NORMAL',
                        tipo: 'MANUAL',
                        clienteId: tramite.clienteId,
                        tramiteId: id,
                        asignadoPorId: req.user.id,
                        asignadoAId: req.user.id
                    }
                });

                const emailText = `🔔 RECORDATORIO DGG: ${taskTitle}\n\nDetalle: ${taskDesc}\nFecha límite: ${new Date(reminder.fecha).toLocaleDateString()}\n\nEste recordatorio ha sido registrado en su expediente.`;
                
                // Emails (Try-catch ya incluido en sendEmail, pero aislamos por seguridad)
                if (tramite.cliente.correoElectronico) {
                    await sendEmail(tramite.cliente.correoElectronico, `Recordatorio: ${taskTitle}`, emailText, { type: 'NOTIFICACION' });
                }
                if (req.user.email) {
                    await sendEmail(req.user.email, `Recordatorio (Asignado): ${taskTitle}`, emailText, { type: 'NOTIFICACION' });
                }

                await prisma.notificacion.create({
                    data: {
                        clienteId: tramite.clienteId,
                        tramiteId: id,
                        asunto: taskTitle,
                        mensaje: taskDesc,
                        tipo: 'RECORDATORIO_MANUAL',
                        canal: 'EMAIL',
                        estado: 'ENVIADO'
                    }
                });
                console.log(`[AVANZAR PASO] Recordatorio creado con éxito`);
            } catch (reminderErr) {
                console.error('[AVANZAR PASO ERROR] Fallo en creación de recordatorio (No crítico):', reminderErr);
            }
        }

        // 4. SECUNDARIO: Crear Cita Manual
        if (appointment && appointment.active && appointment.fecha) {
            try {
                await prisma.cita.create({
                    data: {
                        motivo: appointment.motivo || `Cita: ${infoPaso.label}`,
                        descripcion: appointment.descripcion,
                        fecha: new Date(appointment.fecha),
                        hora: appointment.hora,
                        estado: 'PENDIENTE',
                        clienteId: tramite.clienteId,
                        tramiteId: id
                    }
                });
                console.log(`[AVANZAR PASO] Cita agendada con éxito`);
            } catch (citaErr) {
                console.error('[AVANZAR PASO ERROR] Fallo en creación de cita (No crítico):', citaErr);
            }
        }
        
        // 5. SECUNDARIO: Notificación de paso avanzado al cliente
        if (notificarCliente && tramite.cliente.correoElectronico) {
            try {
                await sendEmail(
                    tramite.cliente.correoElectronico, 
                    `Actualización de Trámite: ${infoPaso.label}`, 
                    `Hola ${tramite.cliente.nombres}, tu trámite de ${tramite.tipo} ha avanzado al paso: ${infoPaso.label}. ${observaciones || ''}`,
                    { type: 'TRAMITE' }
                );

                await prisma.notificacion.create({
                    data: {
                        clienteId: tramite.clienteId,
                        tramiteId: id,
                        asunto: `Actualización: ${infoPaso.label}`,
                        mensaje: `Paso avanzado a ${infoPaso.label}. ${observaciones || ''}`,
                        tipo: 'ESTADO_TRAMITE',
                        canal: 'EMAIL',
                        estado: 'ENVIADO'
                    }
                });
                console.log(`[AVANZAR PASO] Notificación enviada al cliente`);
            } catch (notifErr) {
                console.error('[AVANZAR PASO ERROR] Fallo en notificación al cliente (No crítico):', notifErr);
            }
        }
        
        res.json({
            message: 'Paso avanzado con éxito',
            paso: nuevoPaso,
            progreso: Math.round(((proximoPasoIndex + 1) / roadmap.length) * 100)
        });
        
    } catch (err) {
        console.error('[AVANZAR PASO CRITICAL ERROR]:', err);
        res.status(500).json({ 
            message: 'Error al avanzar paso', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const updateTramite = async (req, res) => {
    const { id } = req.params;
    const { valorAcuerdo, esUrgente, observaciones, estado } = req.body;
    
    try {
        const data = {};
        if (valorAcuerdo !== undefined) data.valorAcuerdo = parseFloat(valorAcuerdo);
        if (esUrgente !== undefined) data.esUrgente = esUrgente;
        if (observaciones !== undefined) data.observaciones = observaciones;
        if (estado !== undefined) data.estado = estado;

        const tramite = await prisma.tramite.update({
            where: { id },
            data,
            include: { pagos: true }
        });

        // Recalcular saldo si cambio el valor acuerdo
        if (valorAcuerdo !== undefined) {
            const abonoTotal = tramite.pagos.reduce((sum, p) => sum + p.valor, 0);
            const saldoPendiente = Math.max(0, parseFloat(valorAcuerdo) - abonoTotal);
            
            await prisma.tramite.update({
                where: { id },
                data: { 
                    abonoTotal,
                    saldoPendiente,
                    pazYSalvo: saldoPendiente <= 0 && parseFloat(valorAcuerdo) > 0
                }
            });
        }

        res.json(tramite);
    } catch (err) {
        res.status(400).json({ message: 'Error al actualizar trámite', error: err.message });
    }
};

const getAllPasosHistory = async (req, res) => {
    try {
        const pasos = await prisma.pasoTramite.findMany({
            include: {
                tramite: {
                    include: { cliente: true }
                }
            },
            orderBy: { fechaAccion: 'desc' },
            take: 100 // Ultimos 100 movimientos por rendimiento
        });
        res.json(pasos);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener historial global', error: err.message });
    }
};

module.exports = { getTramites, createTramite, getTramiteDetail, addPaso, updateEstado, avanzarPaso, updateTramite, getAllPasosHistory };
