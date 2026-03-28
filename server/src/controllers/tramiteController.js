const prisma = require('../config/prisma');

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
        pasos: {
           orderBy: { fechaAccion: 'desc' },
           take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(tramites);
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
        pasos: {
            create: {
                descripcion: `Trámite de ${tipo} iniciado por ${req.user.nombre}`,
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
        documentos: true,
        citas: true
      }
    });
    
    if (!tramite) return res.status(404).json({ message: 'Trámite no encontrado' });
    res.json(tramite);
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

module.exports = { getTramites, createTramite, getTramiteDetail, addPaso, updateEstado };
