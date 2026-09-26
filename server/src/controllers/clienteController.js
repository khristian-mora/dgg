const prisma = require('../config/prisma');
const { encrypt, decrypt } = require('../utils/encryption');
const { PROCEDURE_ROADMAPS } = require('../config/procedureRoadmaps');

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
        user: {
          select: {
            id: true,
            email: true,
            rol: true
          }
        },
        tramites: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    // No devolvemos credenciales sensibles en listas + Calculamos progreso
    const maskedClientes = clientes.map(c => ({
        ...c,
        contrasenaDCCAE: c.contrasenaDCCAE ? '********' : null,
        correoDCCAE: c.correoDCCAE ? '********' : null,
        tramites: c.tramites.map(t => {
            const roadmap = PROCEDURE_ROADMAPS[t.tipo] || PROCEDURE_ROADMAPS['DEFAULT'];
            const progreso = Math.min(Math.round((t.pasos?.length || 0) / (roadmap?.length || 3) * 100), 100);
            return { ...t, progreso };
        })
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
          include: {
            pasos: { orderBy: { fechaAccion: 'asc' } },
            pagos: { orderBy: { fecha: 'desc' }, take: 5 }
          },
          orderBy: { createdAt: 'desc' }
        },
        citas: { orderBy: { fecha: 'desc' }, take: 5 },
        user: {
          select: {
            id: true,
            email: true,
            rol: true
          }
        }
      }
    });
    
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    // Seguridad de Recurso: Si el usuario es un CLIENTE, solo puede ver su propia info
    if (req.user.rol === 'CLIENTE' && req.user.clienteId !== id) {
        return res.status(403).json({ message: 'No tiene permiso para ver la información de otro cliente' });
    }

    // Desciframos campos para visualización de personal autorizado
    if (cliente.contrasenaDCCAE) cliente.contrasenaDCCAE = decrypt(cliente.contrasenaDCCAE);
    if (cliente.correoDCCAE) cliente.correoDCCAE = decrypt(cliente.correoDCCAE);

    // Calcular progreso para cada tramite
    if (cliente.tramites) {
        cliente.tramites = cliente.tramites.map(t => {
            const roadmap = PROCEDURE_ROADMAPS[t.tipo] || PROCEDURE_ROADMAPS['DEFAULT'];
            const progreso = Math.min(Math.round((t.pasos?.length || 0) / (roadmap?.length || 3) * 100), 100);
            return { ...t, progreso };
        });
    }

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

        const parseSafeDate = (d) => {
            if (!d) return null;
            const parsed = new Date(d);
            if (isNaN(parsed.getTime())) return null;
            const year = parsed.getUTCFullYear();
            if (year < 1900 || year > 2100) return null;
            return parsed;
        };

        if ('fechaExpedicionCC' in updateData) {
            updateData.fechaExpedicionCC = parseSafeDate(updateData.fechaExpedicionCC);
        }
        if ('fechaNacimiento' in updateData) {
            updateData.fechaNacimiento = parseSafeDate(updateData.fechaNacimiento);
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

const activarPortal = async (req, res) => {
    const { id } = req.params;
    const bcrypt = require('bcrypt');
    const { sendEmail } = require('../services/emailService');

    try {
        const cliente = await prisma.cliente.findUnique({ 
            where: { id },
            include: { user: true }
        });

        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
        
        const email = cliente.correoElectronico || cliente.email;
        if (!email) return res.status(400).json({ message: 'El cliente no tiene un correo electrónico registrado para activar el portal' });

        let user = cliente.user;

        // Si no tiene usuario, crearlo
        if (!user) {
            const hashedPassword = await bcrypt.hash(cliente.cedula, 10);
            user = await prisma.user.create({
                data: {
                    nombre: `${cliente.nombres} ${cliente.apellidos}`,
                    email: email,
                    passwordHash: hashedPassword,
                    rol: 'CLIENTE',
                    clienteId: id
                }
            });
        }

        // Preparar Correo de Bienvenida / Credenciales
        const htmlWelcome = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e1e1e1; border-radius: 20px; background-color: #ffffff; box-shadow: 0 10px 20px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #68774c; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">GestorArmas Pro</h1>
              <p style="color: #a8b48f; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px;">Diana Gomez Garcia</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #68774c 0%, #363d2b 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">¡Hola, ${cliente.nombres}!</h2>
              <p style="color: #ccd3bc; margin: 10px 0 0 0; font-size: 14px;">Hemos habilitado tu acceso al de consulta de trámites.</p>
            </div>

            <p style="color: #4a5568; line-height: 1.6; font-size: 15px;">A través de esta plataforma podrás ver el avance de tus procesos en tiempo real y cargar documentos pendientes.</p>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px dashed #cbd5e0; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase;">Tus credenciales de ingreso:</p>
              <div style="margin: 15px 0;">
                <p style="margin: 5px 0; font-size: 16px; color: #1e293b;"><strong>🌐 URL:</strong> <a href="https://www.dggestionarmas.com/portal" style="color: #68774c;">Acceder al Portal</a></p>
                <p style="margin: 5px 0; font-size: 16px; color: #1e293b;"><strong>📧 Usuario:</strong> ${email}</p>
                <p style="margin: 5px 0; font-size: 16px; color: #1e293b;"><strong>🔑 Contraseña:</strong> ${cliente.cedula}</p>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8; font-style: italic;">* Te recomendamos cambiar tu contraseña una vez ingreses por primera vez.</p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
            <p style="text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin: 0;">© 2026 Diana Gomez Garcia - Gestión Profesional de Trámites</p>
          </div>
        `;

        await sendEmail(
            email,
            'Acceso al Portal de Trámites - DGG',
            `Hola ${cliente.nombres}, tu cuenta ha sido activada: User: ${email}, Pass: ${cliente.cedula}`,
            htmlWelcome
        );

        // Registro de Auditoría
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                accion: 'ACTIVACIÓN PORTAL',
                modulo: 'CLIENTES',
                detalle: `Se activó acceso al portal y se enviaron credenciales a: ${cliente.nombres} ${cliente.apellidos} (${email})`
            }
        });

        res.json({ message: 'Portal activado y credenciales enviadas correctamente' });
    } catch (err) {
        console.error('Error in activarPortal:', err);
        res.status(500).json({ message: 'Error al activar acceso al portal', error: err.message });
    }
};

module.exports = { getClientes, createCliente, getClienteById, updateCliente, uploadFoto, deleteCliente, hardDeleteCliente, activarPortal };
