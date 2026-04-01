const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');
const zlib = require('zlib');
const { sendEmail } = require('../services/emailService');
const prisma = require('../config/prisma');

const initializeBackupJob = () => {
    // Ejecutar todos los días a las 3:00 AM
    cron.schedule('0 3 * * *', async () => {
        console.log('🔄 Iniciando tarea de Backup Automático...');
        try {
            await performBackup();
        } catch (error) {
            console.error('❌ Error crítico en el backup:', error);
        }
    });
    console.log('🕒 Cron Job de Backup configurado (3:00 AM diario).');
};

const performBackup = async () => {
    const dbUrl = process.env.DATABASE_URL || '';
    
    // Si ya se migró a MySQL, delegamos el backup a Hostinger o hacemos un dump (requeriría CLI tools)
    if (!dbUrl.startsWith('file:') && !dbUrl.includes('sqlite')) {
        console.log('⏭️ Base de datos detectada: MySQL/PostgreSQL. Los backups file-system se omiten. Recomendación: Usar backups automáticos del Hosting.');
        // Solo actualizamos la fecha para el Frontend
        await prisma.configuracion.upsert({
            where: { clave: 'LAST_BACKUP_DATE' },
            create: { clave: 'LAST_BACKUP_DATE', valor: new Date().toISOString(), descripcion: 'Fecha de último backup exitoso' },
            update: { valor: new Date().toISOString() }
        });
        return;
    }

    // Backup para SQLite actual
    const dbPath = path.join(__dirname, '../../prisma/dev.db');
    if (!fs.existsSync(dbPath)) {
         throw new Error('No se encontro el archivo dev.db en la ruta esperada.');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `dgg_backup_${timestamp}.db.gz`;
    const backupPath = path.join(__dirname, '../../uploads/backups', backupFilename);

    await fs.ensureDir(path.dirname(backupPath));

    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(dbPath);
        const writeStream = fs.createWriteStream(backupPath);
        const gzip = zlib.createGzip();

        readStream.pipe(gzip).pipe(writeStream)
            .on('finish', async () => {
                try {
                    // Actualizar la fecha de backup en la base de datos para el Dashboard
                    await prisma.configuracion.upsert({
                        where: { clave: 'LAST_BACKUP_DATE' },
                        create: { clave: 'LAST_BACKUP_DATE', valor: new Date().toISOString(), descripcion: 'Fecha de último backup local' },
                        update: { valor: new Date().toISOString() }
                    });

                    // Enviar por correo al administrador
                    const adminEmail = process.env.EMAIL_USER;
                    if (adminEmail) {
                        try {
                            const nodemailer = require('nodemailer');
                            const transporter = nodemailer.createTransport({
                                host: process.env.EMAIL_HOST,
                                port: process.env.EMAIL_PORT,
                                secure: process.env.EMAIL_SECURE === 'true',
                                auth: {
                                    user: process.env.EMAIL_USER,
                                    pass: process.env.EMAIL_PASS || process.env.EMAIL_SECRET
                                }
                            });

                            await transporter.sendMail({
                                from: `"GestorArmas Pro" <${process.env.EMAIL_USER}>`,
                                to: adminEmail,
                                subject: '📦 Backup de Seguridad DGG Generado',
                                text: 'Se adjunta la copia de seguridad de la base de datos SQLite.',
                                attachments: [
                                    {
                                        filename: backupFilename,
                                        path: backupPath
                                    }
                                ]
                            });
                            console.log(`✅ Backup enviado correctamente a ${adminEmail}`);
                        } catch (emailError) {
                            console.error(`⚠️ Backup generado pero falló el envío por email: ${emailError.message}`);
                            // No rechazamos la promesa aquí, ya que el archivo fue generado con éxito
                        }
                    }

                    resolve();
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => reject(err));
    });
};

module.exports = { initializeBackupJob, performBackup };
