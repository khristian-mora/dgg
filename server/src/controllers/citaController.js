const prisma = require('../config/prisma');

// Get all appointments with optional date filtering
const getCitas = async (req, res) => {
  const { start, end, clienteId, fecha } = req.query;
  
  try {
    const where = {
      AND: [
        clienteId ? { clienteId } : {},
      ]
    };

    // If 'fecha' is provided, filter for that entire day
    if (fecha && fecha !== 'undefined') {
        const targetDate = new Date(fecha);
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);
        
        where.AND.push({
            fecha: {
                gte: targetDate,
                lt: nextDay
            }
        });
    } else if (start && end && start !== 'undefined' && end !== 'undefined') {
        // Range filtering
        where.AND.push({
            fecha: {
                gte: new Date(start),
                lte: new Date(end)
            }
        });
    }

    const citas = await prisma.cita.findMany({
      where,
      include: {
        cliente: {
          select: { nombres: true, apellidos: true, cedula: true, telefono: true }
        },
        tramite: {
          select: { tipo: true, estado: true }
        }
      },
      orderBy: { fecha: 'asc' }
    });
    
    return res.status(200).json(citas);
  } catch (err) {
    console.error("GET CITAS FATAL SQL ERROR:", err.message);
    return res.status(500).json({ message: 'Error al recuperar citas', error: err.message });
  }
};

const createCita = async (req, res) => {
  const { clienteId, tramiteId, fecha, hora, motivo, recordatorioEnviado } = req.body;
  
  try {
    const cita = await prisma.cita.create({
      data: {
        clienteId: clienteId || null,
        tramiteId: tramiteId || null,
        fecha: new Date(fecha),
        hora,
        motivo,
        estado: 'PENDIENTE',
        recordatorioEnviado: recordatorioEnviado || false
      }
    });

    // Create a notification for the system
    await prisma.notificacion.create({
      data: {
        clienteId: clienteId || null,
        tramiteId: tramiteId || null,
        asunto: 'Nueva Cita Programada',
        mensaje: `Cita para el día ${new Date(fecha).toLocaleDateString()} a las ${hora}`,
        tipo: 'CITA',
        canal: 'SISTEMA'
      }
    });

    res.status(201).json(cita);
  } catch (err) {
    console.error("Error creating cita:", err);
    res.status(400).json({ message: 'Error al agendar cita', error: err.message });
  }
};

const updateCitaStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // PENDIENTE, REALIZADA, CANCELADA, REPROGRAMADA
  
  try {
    const cita = await prisma.cita.update({
      where: { id },
      data: { estado }
    });
    
    res.json(cita);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar cita', error: err.message });
  }
};

const deleteCita = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.cita.delete({ where: { id } });
    res.json({ message: 'Cita eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar cita', error: err.message });
  }
};

// Consolidated: returns ALL events for a given date (citas + tramites created + pagos + pasos)
const getEventosDia = async (req, res) => {
  const { fecha } = req.query;
  
  try {
    const targetDate = fecha ? new Date(fecha) : new Date();
    // Set time to start of day
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const [citas, tramitesCreados, pagos, pasos] = await Promise.all([
      // Citas del día
      prisma.cita.findMany({
        where: { fecha: { gte: targetDate, lt: nextDay } },
        include: { cliente: { select: { nombres: true, apellidos: true } }, tramite: { select: { tipo: true } } },
        orderBy: { fecha: 'asc' }
      }),
      // Trámites creados el día
      prisma.tramite.findMany({
        where: { createdAt: { gte: targetDate, lt: nextDay } },
        include: { cliente: { select: { nombres: true, apellidos: true } } },
        orderBy: { createdAt: 'asc' }
      }),
      // Pagos/abonos registrados el día
      prisma.pago.findMany({
        where: { fecha: { gte: targetDate, lt: nextDay } },
        include: {
          tramite: { select: { tipo: true } },
          cliente: { select: { nombres: true, apellidos: true } }
        },
        orderBy: { fecha: 'asc' }
      }),
      // Pasos avanzados del día
      prisma.pasoTramite.findMany({
        where: { fechaAccion: { gte: targetDate, lt: nextDay } },
        include: {
          tramite: {
            select: { tipo: true, cliente: { select: { nombres: true, apellidos: true } } }
          }
        },
        orderBy: { fechaAccion: 'asc' }
      })
    ]);

    // Normalize events into a unified format
    const eventos = [
      ...citas.map(c => ({
        tipo: 'CITA',
        id: c.id,
        hora: c.hora || new Date(c.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        titulo: c.motivo,
        subtitulo: c.cliente ? `${c.cliente.nombres} ${c.cliente.apellidos}` : 'Cliente',
        color: 'blue',
        meta: c
      })),
      ...tramitesCreados.map(t => ({
        tipo: 'TRAMITE_CREADO',
        id: t.id,
        hora: new Date(t.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        titulo: `Nuevo Trámite: ${t.tipo}`,
        subtitulo: t.cliente ? `${t.cliente.nombres} ${t.cliente.apellidos}` : 'Cliente',
        color: 'gold',
        meta: t
      })),
      ...pagos.map(p => ({
        tipo: 'ABONO',
        id: p.id,
        hora: new Date(p.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        titulo: `Abono: $${Number(p.valor).toLocaleString()}`,
        subtitulo: p.cliente ? `${p.cliente.nombres} ${p.cliente.apellidos}` : (p.tramite?.tipo || 'Trámite'),
        color: 'green',
        meta: p
      })),
      ...pasos.map(p => ({
        tipo: 'PASO_TRAMITE',
        id: p.id,
        hora: new Date(p.fechaAccion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        titulo: p.descripcion,
        subtitulo: p.tramite?.cliente ? `${p.tramite.cliente.nombres} ${p.tramite.cliente.apellidos}` : p.tramite?.tipo || '',
        color: 'purple',
        meta: p
      }))
    ];

    // Sort by time
    eventos.sort((a, b) => a.hora.localeCompare(b.hora));

    res.json(eventos);
  } catch (err) {
    console.error('Error getEventosDia:', err.message);
    res.status(500).json({ message: 'Error al obtener eventos del día', error: err.message });
  }
};

const getResumenMes = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ message: 'Faltan parámetros start/end' });

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const [citas, tramites, pagos, pasos] = await Promise.all([
      prisma.cita.findMany({ where: { fecha: { gte: startDate, lte: endDate } }, select: { fecha: true } }),
      prisma.tramite.findMany({ where: { createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true } }),
      prisma.pago.findMany({ where: { fecha: { gte: startDate, lte: endDate } }, select: { fecha: true } }),
      prisma.pasoTramite.findMany({ where: { fechaAccion: { gte: startDate, lte: endDate } }, select: { fechaAccion: true } })
    ]);

    // Combinar todas las fechas en un set de días únicos (formato dia del mes o YYYY-MM-DD)
    const diasConEventos = new Set();
    
    citas.forEach(c => diasConEventos.add(new Date(c.fecha).getUTCDate()));
    tramites.forEach(t => diasConEventos.add(new Date(t.createdAt).getUTCDate()));
    pagos.forEach(p => diasConEventos.add(new Date(p.fecha).getUTCDate()));
    pasos.forEach(p => diasConEventos.add(new Date(p.fechaAccion).getUTCDate()));

    res.json(Array.from(diasConEventos));
  } catch (err) {
    res.status(500).json({ message: 'Error en resumen mes', error: err.message });
  }
};

module.exports = { getCitas, createCita, updateCitaStatus, deleteCita, getEventosDia, getResumenMes };
