const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function repair() {
    console.log('🛡️ INICIANDO AUTO-REPARACIÓN REMOTA...\n');

    try {
        await ssh.connect({
            host: '76.13.125.242',
            username: 'root',
            password: '1096205317Ab+'
        });
        console.log('✅ Conexión establecida con el servidor VPS.');

        // 1. Detectar y corregir el archivo .env
        console.log('📂 Leyendo archivo .env en el servidor...');
        const envPath = '/var/www/dgg/server/.env';
        const envContent = await ssh.execCommand(`cat ${envPath}`);
        
        if (envContent.stdout) {
            console.log('📄 Contenido del .env detectado. Realizando limpieza de rutas Windows...');
            let lines = envContent.stdout.split('\n');
            let updated = false;

            lines = lines.map(line => {
                if (line.includes('DATABASE_URL') && line.includes('C:')) {
                    updated = true;
                    // Forzamos la ruta correcta de Linux
                    return 'DATABASE_URL="file:./prisma/dev.db"';
                }
                return line;
            });

            if (updated) {
                const newContent = lines.join('\n');
                await ssh.execCommand(`echo '${newContent}' > ${envPath}`);
                console.log('✅ Archivo .env corregido con éxito para Linux.');
            } else {
                console.log('ℹ️ La ruta en el .env parece ya estar correcta o no es de Windows.');
            }
        }

        // 2. Reiniciar PM2 con las nuevas variables
        console.log('🔄 Reiniciando PM2 (dgg-api) con --update-env...');
        await ssh.execCommand('pm2 restart dgg-api --update-env', { cwd: '/var/www/dgg' });
        console.log('✅ Aplicación reiniciada.');

        // 3. Verificación Final en el servidor
        console.log('\n📊 Verificando conteo de clientes real en el servidor...');
        const countCheck = await ssh.execCommand('sqlite3 /var/www/dgg/server/prisma/dev.db "SELECT COUNT(*) FROM Cliente"');
        
        if (countCheck.stdout) {
            console.log(`✨ CONCLUSIÓN: El servidor detecta ${countCheck.stdout.trim()} clientes.`);
            if (parseInt(countCheck.stdout.trim()) === 193) {
                console.log('🎊 ¡ÉXITO TOTAL! Los 193 clientes están activos en producción.');
            } else {
                console.log('⚠️ ALERTA: El conteo no es 193. Es posible que el archivo subido no fuera el correcto.');
            }
        } else {
            console.warn('⚠️ No se pudo ejecutar sqlite3 para verificar, verifica el panel administrativo.');
        }

    } catch (err) {
        console.error('❌ ERROR FATAL DURANTE LA REPARACIÓN:', err.message);
    } finally {
        ssh.dispose();
    }
}

repair();
