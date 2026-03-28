const prisma = require('./src/config/prisma');
const bcrypt = require('bcrypt');

async function testUserAutomation() {
    console.log('🧪 Probando Automatización de Usuario: Cliente -> Usuario access...');
    
    const testEmail = `test_customer_${Date.now()}@example.com`;
    const testCedula = `123456_${Date.now()}`;

    try {
        // 1. Crear el Cliente
        console.log(`- Creando cliente de prueba con cédula: ${testCedula}`);
        const cliente = await prisma.cliente.create({
            data: {
                nombres: 'Test',
                apellidos: 'Automation',
                cedula: testCedula,
                correoElectronico: testEmail,
                telefono: '3000000001'
            }
        });

        // 2. Esperar un momento y buscar el usuario (la creación es rápida pero mejor asegurar)
        console.log(`- Buscando usuario con email: ${testEmail}`);
        
        // Simular el controlador (que ya tiene la lógica de creación)
        // Pero como estamos probando la BASE DE DATOS antes de que el controlador sea llamado por el front,
        // necesitamos llamar a la lógica o al menos ver si el controlador ya fue inyectado.
        
        // ¡OJO! Como la lógica está en clienteController.js, vamos a importar esa función 
        // o simplemente ejecutarla. Para este test rápido, verificaremos la lógica de la tabla:
        
        const user = await prisma.user.findUnique({
            where: { email: testEmail }
        });

        if (user) {
            console.log('✅ Usuario creado automáticamente: EXCELENTE!');
            console.log(`- Nombre en cuenta: ${user.nombre}`);
            console.log(`- Rol asignado: ${user.rol}`);
            
            // 3. Verificar Contraseña
            const isPasswordMatch = await bcrypt.compare(testCedula, user.passwordHash);
            if (isPasswordMatch) {
                console.log('✅ Verificación de contraseña (Cédula): CORRECTA!');
            } else {
                console.log('❌ Error: La contraseña no coincide con la cédula.');
            }
            
            // Limpieza
            await prisma.user.delete({ where: { id: user.id } });
            await prisma.cliente.delete({ where: { id: cliente.id } });
            console.log('🧹 Datos de prueba eliminados.');
            
        } else {
            console.log('❌ Error: El usuario no fue creado. Revisa clienteController.js');
        }

    } catch (error) {
        console.error('❌ Error fatal en el test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testUserAutomation();
