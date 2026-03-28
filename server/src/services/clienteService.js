const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const { encrypt } = require('../utils/encryption');
const { sendEmail } = require('./emailService');

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

  // 3. --- MEJORA: CREACIÓN AUTOMÁTICA DE CUENTA DE USUARIO Y CORREO ---
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

      // Solo enviar correo si no estamos en modo prueba (CI) para evitar lentitud y errores de transporte
      if (process.env.NODE_ENV !== 'test') {
        await sendEmail(
          correoElectronico,
          '¡Bienvenido a DGG GestorArmas Pro - Acceso al Sistema!',
          `Hola ${nombres}, ya puedes acceder al sistema. Usuario: ${correoElectronico}, Contraseña: ${cedula}`,
          htmlWelcome
        );
        console.log(`Usuario y Email de bienvenida enviado a: ${correoElectronico}`);
      } else {
        console.log(`[TEST] Email de bienvenida simulado para: ${correoElectronico}`);
      }
    } catch (authErr) {
      console.error('Error al crear cuenta o enviar correo:', authErr.message);
      // No fallamos la creación del cliente si falla el correo/usuario
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
