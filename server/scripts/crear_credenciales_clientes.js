/**
 * SCRIPT: Crear credenciales para todos los clientes sin cuenta
 * 
 * Reglas:
 *  - Email de acceso: correoElectronico del cliente, o si no tiene → cedula@dgg.local
 *  - Contraseña inicial: número de cédula (el cliente la puede cambiar desde el portal)
 *  - Rol: CLIENTE
 *  - Vinculado a clienteId
 * 
 * Uso: node scripts/crear_credenciales_clientes.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando clientes sin cuenta de usuario...\n');

  // 1. Traer todos los clientes activos
  const clientes = await prisma.cliente.findMany({
    where: { estado: 'ACTIVO' },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      cedula: true,
      correoElectronico: true,
      telefono: true,
      user: { select: { id: true } }   // null si no tiene cuenta
    },
    orderBy: { createdAt: 'asc' }
  });

  const sinCuenta  = clientes.filter(c => !c.user);
  const conCuenta  = clientes.filter(c =>  c.user);

  console.log(`📊 Total clientes ACTIVOS : ${clientes.length}`);
  console.log(`✅ Ya tienen cuenta       : ${conCuenta.length}`);
  console.log(`⚠️  Sin cuenta (a crear)  : ${sinCuenta.length}\n`);

  if (sinCuenta.length === 0) {
    console.log('✅ Todos los clientes ya tienen credenciales. Nada que hacer.');
    return;
  }

  const resultados = [];
  let creados = 0;
  let errores = 0;

  for (const c of sinCuenta) {
    const nombreCompleto = `${c.nombres} ${c.apellidos}`;
    const emailAcceso    = c.correoElectronico?.trim()
                         ? c.correoElectronico.trim().toLowerCase()
                         : `${c.cedula}@dgg.local`;
    const passwordPlana  = c.cedula; // cédula como contraseña inicial

    try {
      // Verificar que el email no esté ya usado por otro usuario
      const emailExistente = await prisma.user.findFirst({
        where: { email: emailAcceso }
      });

      let emailFinal = emailAcceso;
      if (emailExistente) {
        // Fallback: cédula@dgg.local si el correo ya está tomado
        emailFinal = `${c.cedula}@dgg.local`;
      }

      const passwordHash = await bcrypt.hash(passwordPlana, 10);

      await prisma.user.create({
        data: {
          nombre:       nombreCompleto,
          email:        emailFinal,
          passwordHash,
          rol:          'CLIENTE',
          clienteId:    c.id,
          isActive:     true
        }
      });

      creados++;
      resultados.push({
        nombre:   nombreCompleto,
        cedula:   c.cedula,
        email:    emailFinal,
        password: passwordPlana,
        estado:   '✅ Creado'
      });

      process.stdout.write(`  ✅ ${nombreCompleto} → ${emailFinal}\n`);

    } catch (err) {
      errores++;
      resultados.push({
        nombre:   nombreCompleto,
        cedula:   c.cedula,
        email:    'ERROR',
        password: '-',
        estado:   `❌ Error: ${err.message}`
      });
      process.stderr.write(`  ❌ ${nombreCompleto} → ${err.message}\n`);
    }
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`📋 RESUMEN FINAL:`);
  console.log(`   ✅ Cuentas creadas : ${creados}`);
  console.log(`   ❌ Errores         : ${errores}`);
  console.log('══════════════════════════════════════════');
  console.log('\n📋 CREDENCIALES GENERADAS:');
  console.log('═'.repeat(80));
  console.log('Nombre                        | Email de acceso           | Contraseña');
  console.log('─'.repeat(80));
  for (const r of resultados) {
    const nom = r.nombre.padEnd(30).slice(0, 30);
    const em  = r.email.padEnd(25).slice(0, 25);
    console.log(`${nom} | ${em} | ${r.password}`);
  }
  console.log('═'.repeat(80));
  console.log('\n⚠️  La contraseña inicial es la CÉDULA del cliente.');
  console.log('   El cliente puede cambiarla desde su portal en "Cambiar contraseña".\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
