const { performBackup } = require('../jobs/backupJob');
const fs = require('fs-extra');
const path = require('path');
const prisma = require('../config/prisma');

/**
 * Genera un backup manual y lo envía al cliente para su descarga.
 */
const handleManualBackup = async (req, res) => {
    try {
        console.log('🔄 Iniciando generación de backup manual solicitado por el usuario...');
        
        // Ejecuta la lógica existente de backup (crea el .db.gz)
        await performBackup();
        
        // Buscar el archivo más reciente en uploads/backups
        const backupsDir = path.join(__dirname, '../../uploads/backups');
        
        if (!fs.existsSync(backupsDir)) {
            return res.status(404).json({ message: 'No se pudo encontrar el directorio de backups.' });
        }

        const files = fs.readdirSync(backupsDir)
            .filter(file => file.endsWith('.gz'))
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(backupsDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time); // Ordenar por fecha descendente

        if (files.length === 0) {
            return res.status(404).json({ message: 'No se generó ningún archivo de backup.' });
        }

        const latestBackup = files[0].name;
        const filePath = path.join(backupsDir, latestBackup);

        console.log(`📤 Enviando archivo de backup: ${latestBackup}`);

        // Forzar descarga del archivo
        res.download(filePath, latestBackup, (err) => {
            if (err) {
                console.error('❌ Error al enviar el archivo de backup:', err);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Error al descargar el archivo de backup.' });
                }
            }
        });

    } catch (error) {
        console.error('❌ Error en handleManualBackup:', error);
        res.status(500).json({ message: 'Error interno al procesar el backup.', error: error.message });
    }
};

module.exports = {
    handleManualBackup
};
