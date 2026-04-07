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

// Mapeo de alias según el contexto
const ALIAS_MAP = {
    NOTIFICACION: 'notificaciones@dggestionarmas.com',
    TRAMITE: 'tramites@dggestionarmas.com',
    PAGO: 'pagos@dggestionarmas.com',
    DEFAULT: process.env.EMAIL_USER || 'admin@dggestionarmas.com'
};

const sendEmail = async (to, subject, text, options = {}) => {
    const { html, type = 'DEFAULT' } = options;
    
    // Seleccionar el remitente basado en el tipo
    const fromAddress = ALIAS_MAP[type] || ALIAS_MAP.DEFAULT;
    const fromName = options.fromName || "GestorArmas Pro";

    // Verificar si hay credenciales configuradas
    if (!process.env.EMAIL_USER || (!process.env.EMAIL_PASS && !process.env.EMAIL_SECRET)) {
        console.warn(`[EMAIL SKIPPED] Credenciales no configuradas. Correo para ${to} no enviado.`);
        return { messageId: 'skipped-no-config' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            to,
            subject,
            text,
            html: html || `<div style="font-family: sans-serif; padding: 20px; background: #f4f5f1; border-radius: 10px; border: 1px solid #ccd3bc;">
                            <h2 style="color: #68774c;">Notificación GestorArmas Pro</h2>
                            <p style="color: #363d2b; font-size: 16px;">${text}</p>
                            <hr style="border: 0.5px solid #ccd3bc; margin: 20px 0;" />
                            <p style="font-size: 10px; color: #a8b48f;">Este es un mensaje automático enviado desde ${fromAddress}. Por favor no responda directamente a este correo si desea una atención inmediata.</p>
                          </div>`
        });
        console.log(`[EMAIL] Enviado a ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        // NO lanzar el error para evitar romper el flujo principal del servidor
        return { error: true, message: error.message };
    }
};

module.exports = { sendEmail };
