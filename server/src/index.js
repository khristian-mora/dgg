const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de Seguridad (Auditoría Etapa 1)
app.use(helmet()); // Oculta Express y bloquea ataques web comunes configurando cabeceras
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Permite recursos como fotos

// Rate Limiting para prevenir Ataques DoS y SPAM
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3000, // Límite generoso de peticiones para operaciones continuas
    message: { message: "Demasiadas peticiones detectadas. Por favor espere unos minutos por seguridad." }
});

const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 15, // Max 15 intentos fallidos
    message: { message: "Sistemas de Defensa activados: Tu IP ha sido limitada temporalmente por alto tráfico." }
});

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5001', 'http://localhost:5002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Se eleva el límite a 10MB para subidas de excel y pantallas
app.use(morgan('dev'));
app.use('/api/', apiLimiter);

// Routes
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const auditRoutes = require('./routes/auditRoutes');
const armaRoutes = require('./routes/armaRoutes');
const statsRoutes = require('./routes/statsRoutes');
const tramiteRoutes = require('./routes/tramiteRoutes');
const documentoRoutes = require('./routes/documentoRoutes');
const citaRoutes = require('./routes/citaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const searchRoutes = require('./routes/searchRoutes');
const configRoutes = require('./routes/configRoutes');
const userRoutes = require('./routes/userRoutes');
const tareaRoutes = require('./routes/tareaRoutes');
const formatoRoutes = require('./routes/formatoRoutes');
const soporteRoutes = require('./routes/soporteRoutes');
const cajaRoutes = require('./routes/cajaRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const { startReminderJob } = require('./services/reminderService');
const { initializeWhatsApp } = require('./services/whatsappService');
const { initializeBackupJob } = require('./jobs/backupJob');
const path = require('path');
const fs = require('fs');

// Asegurar que existan las carpetas necesarias
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/fotos'),
    path.join(__dirname, '../uploads/backups'),
    path.join(__dirname, '../templates')
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Carpeta creada: ${dir}`);
    }
  });
};

ensureDirectories();

// Iniciar cron jobs
startReminderJob();
initializeWhatsApp();
initializeBackupJob();

const whatsappRoutes = require('./routes/whatsappRoutes');

const backupRoutes = require('./routes/backupRoutes');

app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/tramites', tramiteRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/config', configRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/formatos', formatoRoutes);
app.use('/api/soporte', soporteRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/armas', armaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/backups', backupRoutes);



// Servir archivos estáticos de forma segura
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor GestorArmas Pro activo', timestamp: new Date() });
});

// Basic routing for demo
app.get('/', (req, res) => {
  res.send('API de Gestión de Trámites de Armas (DCCAE) - Colombia');
});

// Interceptor global de errores
app.use((err, req, res, next) => {
    if (err) {
        console.error('SERVER ERROR 400/500 LOG:', err);
        if (err.status === 400) return res.status(400).json({ message: err.message, type: err.type });
        return res.status(err.status || 500).json({ message: err.message });
    }
    next();
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
