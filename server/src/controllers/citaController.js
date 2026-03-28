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
  const { clienteId, tramiteId, fecha, motivo, recordatorioEnviado } = req.body;
  
  try {
    const cita = await prisma.cita.create({
      data: {
        clienteId,
        tramiteId,
        fecha: new Date(fecha),
        motivo,
        estado: 'PENDIENTE',
        recordatorioEnviado: recordatorioEnviado || false
      }
    });

    // Create a notification for the system
    await prisma.notificacion.create({
      data: {
        asunto: 'Nueva Cita Programada',
        mensaje: `Cita para el día ${new Date(fecha).toLocaleDateString()} a las ${new Date(fecha).toLocaleTimeString()}`,
        tipo: 'CITA',
        canal: 'SISTEMA'
      }
    });

    res.status(201).json(cita);
  } catch (err) {
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

module.exports = { getCitas, createCita, updateCitaStatus, deleteCita };
