const prisma = require('../config/prisma');

// List tasks with filters (Daily, Weekly, Monthly)
const getTareas = async (req, res) => {
  const { period, status, priority, userId } = req.query;
  
  let dateFilter = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === 'day') {
    const startOfSearch = new Date(today);
    startOfSearch.setHours(-12); // Buffer for UTC/Local offsets
    const endOfSearch = new Date(today);
    endOfSearch.setHours(36); // Extend to end of day + buffer
    
    dateFilter = {
      fechaLimite: {
        gte: startOfSearch,
        lte: endOfSearch
      }
    };
  } else if (period === 'week') {
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    dateFilter = {
      fechaLimite: {
        gte: today,
        lte: endOfWeek
      }
    };
  } else if (period === 'month') {
    const endOfMonth = new Date(today);
    endOfMonth.setMonth(today.getMonth() + 1);
    dateFilter = {
      fechaLimite: {
        gte: today,
        lte: endOfMonth
      }
    };
  }

  try {
    // Role-based filtering logic
    let roleFilter = {};
    if (req.user.rol !== 'SUPER_ADMIN') {
      // Non-admins see tasks assigned to them OR created by them
      roleFilter = {
        OR: [
          { asignadoAId: req.user.id },
          { asignadoPorId: req.user.id }
        ]
      };
    } else if (userId) {
      roleFilter = { asignadoAId: userId };
    }

    const tareas = await prisma.tarea.findMany({
      where: {
        AND: [
          dateFilter,
          roleFilter,
          status ? { estado: status } : {},
          priority ? { prioridad: priority } : {},
        ]
      },
      include: {
        asignadoA: { select: { nombre: true, id: true } },
        asignadoPor: { select: { nombre: true } },
        cliente: { select: { nombres: true, apellidos: true, cedula: true } },
        tramite: { select: { tipo: true, estado: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(tareas);
  } catch (err) {
    res.status(500).json({ message: 'Error al recuperar tareas', error: err.message });
  }
};

const createTarea = async (req, res) => {
  const { titulo, descripcion, fechaLimite, prioridad, asignadoAId, clienteId, tramiteId } = req.body;
  
  try {
    const tarea = await prisma.tarea.create({
      data: {
        titulo,
        descripcion,
        fechaLimite: new Date(fechaLimite),
        prioridad: prioridad || 'NORMAL',
        estado: 'PENDIENTE',
        tipo: 'MANUAL',
        asignadoAId,
        asignadoPorId: req.user.id,
        clienteId,
        tramiteId
      }
    });

    res.status(201).json(tarea);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear tarea', error: err.message });
  }
};

const updateTarea = async (req, res) => {
  const { id } = req.params;
  try {
    const tarea = await prisma.tarea.update({
      where: { id },
      data: req.body
    });
    res.json(tarea);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar tarea', error: err.message });
  }
};

const deleteTarea = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.tarea.delete({ where: { id } });
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar tarea', error: err.message });
  }
};

module.exports = { getTareas, createTarea, updateTarea, deleteTarea };
