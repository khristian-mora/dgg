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

const createCliente = async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Encriptación Nivel Bancario: Ciframos campos sensibles antes de guardar
    if (data.contrasenaDCCAE) data.contrasenaDCCAE = encrypt(data.contrasenaDCCAE);
    if (data.correoDCCAE) data.correoDCCAE = encrypt(data.correoDCCAE);

    const { 
      nombres, apellidos, cedula, fechaExpedicionCC, lugarExpedicionCC, nacionalidad,
      telefono, celular, correoElectronico, sexo, estadoCivil, nivelAcademico,
      direccion, barrio, ciudad, departamento, ocupacion, fechaNacimiento, 
      contrasenaDCCAE, correoDCCAE,
      tipoCliente, estado, prospectoInteres
    } = data;
    
    const cliente = await prisma.cliente.create({
      data: {
        nombres,
        apellidos,
        cedula,
        fechaExpedicionCC: fechaExpedicionCC ? new Date(fechaExpedicionCC) : null,
        lugarExpedicionCC,
        nacionalidad: nacionalidad || 'COLOMBIANA',
        telefono,
        celular,
        correoElectronico,
        sexo: sexo || 'MASCULINO',
        estadoCivil,
        nivelAcademico,
        direccion,
        barrio,
        ciudad,
        departamento,
        ocupacion,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        contrasenaDCCAE,
        correoDCCAE,
        tipoCliente: tipoCliente || 'CLIENTE',
        estado: estado || 'ACTIVO',
        prospectoInteres
      }
    });

    // --- MEJORA: CREACIÓN AUTOMÁTICA DE CUENTA DE USUARIO Y CORREO ---
    if (correoElectronico) {
      try {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(cedula, 10); // Contraseña inicial = CÉDULA
        const { sendEmail } = require('../services/emailService');
        
        await prisma.user.create({
          data: {
            nombre: `${nombres} ${apellidos}`,
            email: correoElectronico,
            passwordHash: hashedPassword,
            rol: 'CLIENTE',
            clienteId: cliente.id
          }
        });

        // Enviar Correo de Bienvenida
        const htmlWelcome = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e1e1e1; border-radius: 20px; background-color: #ffffff; box-shadow: 0 10px 20px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #68774c; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">GestorArmas Pro</h1>
              <p style="color: #a8b48f; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px;">Diana Gomez Garcia</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #68774c 0%, #363d2b 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">¡Bienvenido, ${nombres}!</h2>
              <p style="color: #ccd3bc; margin: 10px 0 0 0; font-size: 14px;">Tu expediente digital ha sido activado con éxito.</p>
            </div>

            <p style="color: #4a5568; line-height: 1.6; font-size: 15px;">Ya tienes acceso a nuestro sistema para realizar seguimiento de tus trámites, cargar tus fotos y descargar tus resoluciones oficiales.</p>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px dashed #cbd5e0; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase;">Tus credenciales de ingreso:</p>
              <p style="margin: 5px 0; font-size: 16px; color: #1e293b;"><strong>Usuario:</strong> ${correoElectronico}</p>
              <p style="margin: 5px 0; font-size: 16px; color: #1e293b;"><strong>Contraseña:</strong> ${cedula}</p>
            </div>
            
            <p style="color: #4a5568; font-size: 14px;">Para tu seguridad, te recomendamos cambiar tu contraseña una vez ingreses por primera vez.</p>
            
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
            
            <p style="text-align: center; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin: 0;">© 2026 Diana Gomez Garcia - GestorArmas Pro</p>
            <p style="text-align: center; font-size: 10px; color: #cbd5e0; margin-top: 5px;">DCCAE & Indumil Legal Compliance Engine</p>
          </div>
        `;

        await sendEmail(
          correoElectronico,
          '¡Bienvenido a DGG GestorArmas Pro - Acceso al Sistema!',
          `Hola ${nombres}, ya puedes acceder al sistema. Usuario: ${correoElectronico}, Contraseña: ${cedula}`,
          htmlWelcome
        );

        console.log(`Usuario y Email de bienvenida enviado a: ${correoElectronico}`);
      } catch (authErr) {
        console.error('Error al crear cuenta o enviar correo:', authErr.message);
      }
    }

    // --- Tarea automática para prospectos ---
    if (cliente.tipoCliente === 'PROSPECTO') {
      try {
        await prisma.tarea.create({
          data: {
            titulo: `Contactar Prospecto: ${cliente.nombres}`,
            descripcion: `Nuevo registro desde la landing page para: ${cliente.prospectoInteres || 'No especificado'}`,
            fechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000),
            prioridad: 'ALTA',
            tipo: 'AUTOMATICA',
            clienteId: cliente.id
          }
        });
      } catch (taskErr) {
        console.error('Error creating automatic task:', taskErr);
      }
    }

    res.status(201).json(cliente);
    } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('cedula')) {
        return res.status(400).json({ 
            message: 'El número de cédula ya se encuentra registrado en el sistema.' 
        });
    }
    console.error('Error creating cliente:', err);
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
