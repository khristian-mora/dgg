const prisma = require('../config/prisma');

const globalSearch = async (req, res) => {
  const { q } = req.query;
  
  try {
    const [clientes, tramites, armas, citas, tareas, caja, users] = await Promise.all([
      // 1. Clientes
      prisma.cliente.findMany({
        where: { 
          OR: [
            { nombres: { contains: q } }, 
            { apellidos: { contains: q } }, 
            { cedula: { contains: q } },
            { telefono: { contains: q } },
            { celular: { contains: q } }
          ] 
        },
        take: 3,
        select: { id: true, nombres: true, apellidos: true, cedula: true, tipoCliente: true, celular: true }
      }),
      // 2. Trámites
      prisma.tramite.findMany({
        where: { OR: [{ tipo: { contains: q } }, { estado: { contains: q } }] },
        take: 3,
        include: { cliente: { select: { nombres: true, apellidos: true } } }
      }),
      // 3. Armas
      prisma.arma.findMany({
        where: { OR: [{ numeroSerie: { contains: q } }, { marca: { contains: q } }, { modelo: { contains: q } }] },
        take: 3,
        include: { cliente: { select: { nombres: true, apellidos: true } } }
      }),
      // 4. Agenda
      prisma.cita.findMany({
        where: { OR: [{ motivo: { contains: q } }, { estado: { contains: q } }] },
        take: 3
      }),
      // 5. Tareas
      prisma.tarea.findMany({
        where: { OR: [{ titulo: { contains: q } }, { descripcion: { contains: q } }] },
        take: 3
      }),
      // 6. Caja (Pagos)
      prisma.caja.findMany({
        where: { OR: [{ concepto: { contains: q } }, { referencia: { contains: q } }] },
        take: 3
      }),
      // 7. Usuarios del sistema
      prisma.user.findMany({
        where: { OR: [{ nombre: { contains: q } }, { email: { contains: q } }] },
        take: 3
      })
    ]);

    const results = [
      ...clientes.map(c => ({ id: c.id, type: 'CLIENTE', title: `${c.nombres} ${c.apellidos}`, subtitle: `Cédula: ${c.cedula}`, category: 'CLIENTE' })),
      ...tramites.map(t => ({ id: t.id, type: 'TRAMITE', title: t.tipo, subtitle: `De: ${t.cliente?.nombres || 'DGG'}`, category: 'TRÁMITE', clienteId: t.clienteId })),
      ...armas.map(a => ({ id: a.clienteId, type: 'CLIENTE', title: `${a.marca} ${a.modelo || ''}`, subtitle: `Serial: ${a.numeroSerie}`, category: 'ARMA' })),
      ...citas.map(c => ({ id: 'agenda', type: 'AGENDA', title: c.motivo, subtitle: `Fecha: ${new Date(c.fecha).toLocaleDateString()}`, category: 'CITA' })),
      ...tareas.map(t => ({ id: 'tareas', type: 'TAREA', title: t.titulo, subtitle: t.estado, category: 'TAREA' })),
      ...caja.map(ck => ({ id: 'caja', type: 'COBRO', title: ck.concepto, subtitle: `$${ck.valor}`, category: 'CAJA' })),
      ...users.map(u => ({ id: 'usuarios', type: 'USUARIO', title: u.nombre, subtitle: u.rol, category: 'ACCESO' }))
    ];

    res.json({ results });
  } catch (err) {
    console.error('GLOBAL SEARCH FAILED:', err);
    res.status(500).json({ message: 'Error en búsqueda profunda', error: err.message });
  }
};

module.exports = { globalSearch };
