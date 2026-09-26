const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function migrate() {
    console.log('🚀 INICIANDO MIGRACIÓN RESILIENTE: DEV -> PROD\n');

    const devPath = path.resolve(__dirname, '../prisma/dev.db');
    const prodPath = path.resolve(__dirname, '../prisma/prod.db');
    const devPrisma = new PrismaClient({ datasources: { db: { url: `file:${devPath}` } } });
    const prodPrisma = new PrismaClient({ datasources: { db: { url: `file:${prodPath}` } } });

    try {
        // 1. Respaldar datos críticos de Producción
        console.log('📦 Backup de administrativos de producción...');
        const prodAdmins = await prodPrisma.user.findMany({
            where: { rol: { in: ['SUPER_ADMIN', 'GESTION'] } }
        });
        const prodConfigs = await prodPrisma.configuracion.findMany();

        // 2. Limpieza total en PROD
        const tablesToClear = [
            'AuditLog', 'PasoTramite', 'Notificacion', 'Cita', 'Tarea', 'Pago', 'Caja',
            'Documento', 'Tramite', 'Arma', 'CatalogoArma', 'Formato', 'Contacto',
            'DocumentoImportante', 'Multimedia', 'Consulta', 'User', 'Cliente'
        ];
        console.log('🧹 Limpiando base de datos de destino...');
        for (const table of tablesToClear) {
            await prodPrisma[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany({});
        }

        // 3. Migración por bloques con manejo de errores
        async function migrateTable(tableName, label) {
            const data = await devPrisma[tableName].findMany();
            console.log(`📥 Migrando ${data.length} registros de ${label}...`);
            if (data.length === 0) return;

            try {
                // Intentamos createMany primero
                await prodPrisma[tableName].createMany({ data, skipDuplicates: true });
            } catch (err) {
                console.warn(`   ⚠️ createMany falló en ${label}, reintentando fila por fila...`);
                let errors = 0;
                for (const item of data) {
                    try {
                        await prodPrisma[tableName].create({ data: item });
                    } catch (e) {
                        errors++;
                        // Silencioso o log específico si quieres ver qué falló
                    }
                }
                if (errors > 0) console.warn(`   ⚠️ ${errors} registros de ${label} fallaron (posiblemente huérfanos).`);
            }
        }

        // ORDEN DE MIGRACIÓN PARA RESPETAR FKs
        await migrateTable('user', 'Usuarios');
        await migrateTable('cliente', 'Clientes');
        await migrateTable('arma', 'Armas');
        await migrateTable('tramite', 'Trámites');
        await migrateTable('documento', 'Documentos');
        await migrateTable('pago', 'Pagos');
        await migrateTable('caja', 'Caja');
        await migrateTable('cita', 'Citas');
        await migrateTable('tarea', 'Tareas');
        await migrateTable('pasoTramite', 'Pasos de Trámite');
        await migrateTable('notificacion', 'Notificaciones');
        await migrateTable('formato', 'Formatos');
        await migrateTable('catalogoArma', 'Catálogos');
        await migrateTable('contacto', 'Contactos');
        await migrateTable('documentoImportante', 'Docs Importantes');
        await migrateTable('multimedia', 'Multimedia');
        await migrateTable('consulta', 'Consultas');

        // 4. Restaurar Admins y Configs de Producción (SOBRESCRIBIR los de DEV si colisionan)
        console.log('\n🔐 Restaurando Administradores y Configuraciones reales de producción...');
        for (const admin of prodAdmins) {
            await prodPrisma.user.upsert({
                where: { email: admin.email },
                update: admin,
                create: admin
            });
        }
        for (const config of prodConfigs) {
            await prodPrisma.configuracion.upsert({
                where: { clave: config.clave },
                update: config,
                create: config
            });
        }

        console.log('\n✨ MIGRACIÓN FINALIZADA');
        console.log(`📊 Clientes finales: ${await prodPrisma.cliente.count()}`);

    } catch (err) {
        console.error('\n❌ ERROR FATAL:', err);
    } finally {
        await devPrisma.$disconnect();
        await prodPrisma.$disconnect();
    }
}

migrate();
