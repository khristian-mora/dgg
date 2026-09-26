const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const { encrypt } = require('../utils/encryption');
const { sendEmail } = require('./emailService');

const parseSafeDate = (d) => {
  if (!d) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  const year = parsed.getUTCFullYear();
  if (year < 1900 || year > 2100) return null;
  return parsed;
};

/**
 * Crea un cliente con toda la lógica de automatización vinculada:
 * - Cifrado de campos sensibles DCCAE/Indumil.
 * - Creación automática de cuenta de usuario (Credenciales: Email / Cédula).
 * - Envío de correo de bienvenida.
 * - Creación de tareas automáticas para prospectos.
 */
const createCliente = async (clienteData) => {
  const data = { ...clienteData };
  
  // 1. Encriptación Nivel Bancario: Ciframos campos sensibles antes de guardar
  if (data.contrasenaDCCAE) data.contrasenaDCCAE = encrypt(data.contrasenaDCCAE);
  if (data.correoDCCAE) data.correoDCCAE = encrypt(data.correoDCCAE);

  const { 
    nombres, apellidos, cedula, fechaExpedicionCC, lugarExpedicionCC, nacionalidad,
    telefono, celular, correoElectronico, sexo, estadoCivil, nivelAcademico,
    direccion, barrio, ciudad, departamento, ocupacion, fechaNacimiento, 
    contrasenaDCCAE, correoDCCAE,
    tipoCliente, estado, prospectoInteres
  } = data;
  
  // 2. Crear el Cliente en la DB
  const cliente = await prisma.cliente.create({
    data: {
      nombres,
      apellidos,
      cedula,
      fechaExpedicionCC: parseSafeDate(fechaExpedicionCC),
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
      fechaNacimiento: parseSafeDate(fechaNacimiento),
      contrasenaDCCAE,
      correoDCCAE,
      tipoCliente: tipoCliente || 'CLIENTE',
      estado: estado || 'ACTIVO',
      prospectoInteres
    }
  });

  // 3. --- CREACIÓN DE CUENTA DE USUARIO (SIN ENVÍO AUTOMÁTICO DE CORREO) ---
  if (correoElectronico) {
    try {
      const hashedPassword = await bcrypt.hash(cedula, 10); // Contraseña inicial = CÉDULA
      
      await prisma.user.create({
        data: {
          nombre: `${nombres} ${apellidos}`,
          email: correoElectronico,
          passwordHash: hashedPassword,
          rol: 'CLIENTE',
          clienteId: cliente.id
        }
      });
      console.log(`[CLIENTE] Cuenta de usuario creada para: ${correoElectronico} (Envío de correo desactivado por defecto)`);
    } catch (authErr) {
      console.error('Error al crear cuenta de usuario inicial (No crítico):', authErr.message);
    }
  }

  // 4. --- Tarea automática para prospectos ---
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

  return cliente;
};

module.exports = { createCliente };
