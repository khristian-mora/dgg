const prisma = require('../config/prisma');
const { encrypt, decrypt } = require('../utils/encryption');

// Listar clientes con filtros básicos
const getClientes = async (req, res) => {
  const { q, estado, tipo } = req.query;
  
  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        AND: [
          q ? {
            OR: [
              { nombres: { contains: q } },
              { apellidos: { contains: q } },
              { cedula: { contains: q } }
            ]
          } : {},
          estado ? { estado } : {},
          tipo ? { tipoCliente: tipo } : {}
        ]
      },
      include: {
        armas: true,
        tramites: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    // No devolvemos credenciales sensibles en listas
    const maskedClientes = clientes.map(c => ({
        ...c,
        contrasenaDCCAE: c.contrasenaDCCAE ? '********' : null,
        correoDCCAE: c.correoDCCAE ? '********' : null
    }));

    res.json(maskedClientes);
  } catch (err) {
    res.status(500).json({ message: 'Error al recuperar clientes', error: err.message });
  }
};

const { createCliente: createClienteService } = require('../services/clienteService');

const createCliente = async (req, res) => {
  try {
    const cliente = await createClienteService(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('cedula')) {
      return res.status(400).json({ 
        message: 'El número de cédula ya se encuentra registrado en el sistema.' 
      });
    }
    console.error('Error in createCliente controller:', err);
    res.status(400).json({ message: 'Error al crear cliente', error: err.message });
  }
};

const getClienteById = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        armas: true,
        documentos: true,
        tramites: {
          include: { pasos: true, pagos: true }
        },
        citas: true
      }
    });
    
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    // Desciframos campos para visualización de personal autorizado
    if (cliente.contrasenaDCCAE) cliente.contrasenaDCCAE = decrypt(cliente.contrasenaDCCAE);
    if (cliente.correoDCCAE) cliente.correoDCCAE = decrypt(cliente.correoDCCAE);

    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener detalle del cliente', error: err.message });
  }
};

const updateCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const updateData = { ...req.body };
        
        // Encriptación Nivel Bancario en actualizaciones
        if (updateData.contrasenaDCCAE && !updateData.contrasenaDCCAE.includes('********')) {
            updateData.contrasenaDCCAE = encrypt(updateData.contrasenaDCCAE);
        }
        if (updateData.correoDCCAE && !updateData.correoDCCAE.includes('********')) {
            updateData.correoDCCAE = encrypt(updateData.correoDCCAE);
        }

        const cliente = await prisma.cliente.update({
            where: { id },
            data: updateData
        });
        res.json(cliente);
    } catch (err) {
        res.status(400).json({ message: 'Error al actualizar cliente', error: err.message });
    }
};

const uploadFoto = async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No hay archivo' });

    try {
        const cliente = await prisma.cliente.update({
            where: { id },
            data: { foto: `/uploads/documentos/${file.filename}` }
        });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar foto', error: err.message });
    }
};

const deleteCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await prisma.cliente.findUnique({ where: { id } });
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

        // Borrado lógico: Cambiamos el estado en lugar de eliminar el registro
        const nuevoEstado = cliente.estado === 'INACTIVO' ? 'ACTIVO' : 'INACTIVO';
        
        await prisma.cliente.update({
            where: { id },
            data: { estado: nuevoEstado }
        });

        // Registro de Auditoría
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                accion: nuevoEstado === 'INACTIVO' ? 'DESACTIVACIÓN' : 'ACTIVACIÓN',
                modulo: 'CLIENTES',
                detalle: `${nuevoEstado === 'INACTIVO' ? 'Desactivación' : 'Reactivación'} del cliente: ${cliente.nombres} ${cliente.apellidos} (${cliente.cedula})`
            }
        });

        res.json({ 
            message: `Cliente ${nuevoEstado === 'INACTIVO' ? 'desactivado' : 'reactivado'} correctamente`,
            estado: nuevoEstado 
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al cambiar estado del cliente', error: err.message });
    }
};

const hardDeleteCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await prisma.cliente.findUnique({ 
            where: { id },
            include: { tramites: true }
        });
        
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

        // 1. Borrar pasos de todos los trámites del cliente
        const tramiteIds = cliente.tramites.map(t => t.id);
        if (tramiteIds.length > 0) {
            await prisma.pasoTramite.deleteMany({ where: { tramiteId: { in: tramiteIds } } });
        }

        // 2. Borrar trámites y todos sus relacionados (Notificaciones, Pagos, Documentos, Citas, Tareas)
        // Nota: Muchos de estos refieren directamente al clienteId también.
        await prisma.pago.deleteMany({ where: { OR: [{ clienteId: id }, { tramiteId: { in: tramiteIds } }] } });
        await prisma.notificacion.deleteMany({ where: { OR: [{ clienteId: id }, { tramiteId: { in: tramiteIds } }] } });
        await prisma.tarea.deleteMany({ where: { OR: [{ clienteId: id }, { tramiteId: { in: tramiteIds } }] } });
        await prisma.cita.deleteMany({ where: { OR: [{ clienteId: id }, { tramiteId: { in: tramiteIds } }] } });
        await prisma.documento.deleteMany({ where: { OR: [{ clienteId: id }, { tramiteId: { in: tramiteIds } }] } });
        await prisma.tramite.deleteMany({ where: { clienteId: id } });

        // 3. Borrar Armas, Caja, User
        await prisma.arma.deleteMany({ where: { clienteId: id } });
        await prisma.caja.deleteMany({ where: { clienteId: id } });
        await prisma.user.deleteMany({ where: { clienteId: id } });

        // 4. Finalmente, borrar el Cliente
        await prisma.cliente.delete({ where: { id } });

        // Registro de Auditoría
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                accion: 'ELIMINACIÓN PERMANENTE',
                modulo: 'CLIENTES',
                detalle: `Eliminación física total del cliente: ${cliente.nombres} ${cliente.apellidos} (${cliente.cedula}). Se eliminaron todos sus trámites, armas y documentos vinculados.`
            }
        });

        res.json({ message: 'Cliente y toda su información asociada eliminados permanentemente.' });
    } catch (err) {
        console.error('Error in hardDeleteCliente:', err);
        res.status(500).json({ message: 'Error al eliminar cliente de forma permanente', error: err.message });
    }
};

module.exports = { getClientes, createCliente, getClienteById, updateCliente, uploadFoto, deleteCliente, hardDeleteCliente };
