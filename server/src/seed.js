const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed de GestorArmas Pro ---');

  // 1. Limpiar base de datos (ordenado por dependencias)
  await prisma.auditLog.deleteMany({});
  await prisma.pago.deleteMany({});
  await prisma.caja.deleteMany({});
  await prisma.pasoTramite.deleteMany({});
  await prisma.tarea.deleteMany({});
  await prisma.notificacion.deleteMany({});
  await prisma.documento.deleteMany({});
  await prisma.cita.deleteMany({});
  await prisma.tramite.deleteMany({});
  await prisma.arma.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.configuracion.deleteMany({});
  await prisma.formato.deleteMany({});
  await prisma.catalogoArma.deleteMany({});
  await prisma.contacto.deleteMany({});
  await prisma.documentoImportante.deleteMany({});
  await prisma.multimedia.deleteMany({});


  const bcrypt = require('bcrypt');
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('admin123', salt);
  const gestionPass = await bcrypt.hash('gestion123', salt);

  // 2. Usuarios del Sistema
  const admin = await prisma.user.create({
    data: {
      nombre: 'Diana Gómez García',
      email: 'admin@dggestionarmas.com',
      passwordHash: adminPass,
      rol: 'SUPER_ADMIN'
    }
  });

  const gestion = await prisma.user.create({
    data: {
      nombre: 'Ayudante Maria',
      email: 'ayudante@dggestionarmas.com',
      passwordHash: gestionPass,
      rol: 'GESTION'
    }
  });


  console.log('- Usuarios creados');

  // 3. Clientes y Prospectos
  const cliente1 = await prisma.cliente.create({
    data: {
      nombres: 'Juan',
      apellidos: 'Pérez',
      cedula: '1.222.333',
      telefono: '3101234567',
      nacionalidad: 'COLOMBIANA',
      estado: 'ACTIVO',
      tipoCliente: 'CLIENTE',
      barrio: 'Chicó',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca'
    }
  });

  const prospecto1 = await prisma.cliente.create({
    data: {
      nombres: 'Roberto',
      apellidos: 'Casas',
      cedula: '4.555.666',
      telefono: '3129876543',
      nacionalidad: 'COLOMBIANA',
      correoElectronico: 'roberto.prospecto@email.com',
      estado: 'PROSPECTO',
      tipoCliente: 'PROSPECTO',
      prospectoInteres: 'Permiso para Porte'
    }
  });

  console.log('- Clientes/Prospectos creados');

  // 4. Armas
  const arma1 = await prisma.arma.create({
    data: {
      clienteId: cliente1.id,
      claseArma: 'Pistola',
      marca: 'Córdova',
      modelo: 'Compacta',
      calibre: '9mm',
      numeroSerie: 'IND-900456',
      longitudCanon: '3.7 pulg',
      paisOrigen: 'Colombia',
      tipoPermiso: 'Porte'
    }
  });

  console.log('- Armas creadas');

  // 5. Configuración Inicial (Indumil 2026)
  await prisma.configuracion.createMany({
    data: [
      { clave: 'PRECIO_CORDOVA_STD', valor: '5471400', descripcion: 'Pistola Córdova Estándar' },
      { clave: 'PRECIO_CORDOVA_CMP', valor: '5525520', descripcion: 'Pistola Córdova Compacta' },
      { clave: 'PRECIO_MUNICION_9MM', valor: '150000', descripcion: 'Caja Munición 9mm (50)' },
      { clave: 'TASA_ACE', valor: '550000', descripcion: 'Evaluación Psicomédica' }
    ]
  });

  console.log('- Configuración cargada');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
