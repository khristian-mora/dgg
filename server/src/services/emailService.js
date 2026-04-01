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

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"GestorArmas Pro" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || `<div style="font-family: sans-serif; padding: 20px; background: #f4f5f1; border-radius: 10px;">
                            <h2 style="color: #68774c;">Notificación GestorArmas Pro</h2>
                            <p style="color: #363d2b; font-size: 16px;">${text}</p>
                            <hr style="border: 0.5px solid #ccd3bc;" />
                            <p style="font-size: 10px; color: #a8b48f;">Este es un mensaje automático, por favor no responda.</p>
                          </div>`
        });
        console.log(`[EMAIL] Enviado a ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        throw error;
    }
};

module.exports = { sendEmail };
