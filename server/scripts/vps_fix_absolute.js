const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverDir = '/var/www/dgg/server';
const envPath = path.join(serverDir, '.env');

console.log('🚀 Iniciando Script de Reparación Interna...');

try {
    // 1. Reconstruir .env con rutas absolutas forzadas
    const envContent = `DATABASE_URL="file:${serverDir}/prisma/dev.db"
JWT_SECRET="GESTOR_ARMAS_TOP_SECRET_PRO_2026"
ENCRYPTION_KEY="DGG_PRO_SECURITY_KEY_2026_ELITE"
PORT=5000
FRONTEND_URL="https://www.dggestionarmas.com"
CORS_ORIGIN="https://www.dggestionarmas.com,https://dggestionarmas.com"
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env reconstruido con ÉXITO (Ruta Absoluta).');

    // 2. Regenerar Prisma Client
    console.log('⚙️ Regenerando Prisma Client...');
    execSync('npx prisma generate', { cwd: serverDir, stdio: 'inherit' });
    console.log('✅ Prisma Client regenerado.');

    // 3. Reiniciar PM2
    console.log('🔄 Reiniciando aplicación...');
    execSync('pm2 restart dgg-api --update-env', { cwd: serverDir, stdio: 'inherit' });
    console.log('✅ Aplicación reiniciada con las nuevas variables.');

    // 4. Verificación de datos
    console.log('📊 Verificando integridad de la base de datos...');
    const count = execSync(`sqlite3 ${serverDir}/prisma/dev.db "SELECT COUNT(*) FROM Cliente"`, { encoding: 'utf8' });
    console.log(`✨ Resultado Final: ${count.trim()} clientes detectados.`);

} catch (error) {
    console.error('❌ ERROR DURANTE LA REPARACIÓN:', error.message);
    process.exit(1);
}
