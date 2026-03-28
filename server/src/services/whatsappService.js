const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Global client state
let clientStatus = 'DISCONNECTED';
let lastQR = null;

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '../../.wwebjs_auth')
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

const initializeWhatsApp = () => {
    console.log('--- Iniciando Bot de WhatsApp (Automático) ---');

    client.on('qr', (qr) => {
        // Guardar el último QR para que el frontend lo muestre
        lastQR = qr;
        clientStatus = 'QR_READY';
        console.log('--- ESCANEA ESTE CÓDIGO QR PARA VINCULAR ---');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        clientStatus = 'CONNECTED';
        lastQR = null;
        console.log('✅ WhatsApp Bot conectado y listo para enviar mensajes.');
    });

    client.on('authenticated', () => {
        console.log('--- Autenticado con éxito en WhatsApp ---');
    });

    client.on('auth_failure', ({ msg }) => {
        clientStatus = 'AUTH_FAILURE';
        console.error('--- Error de autenticación en WhatsApp ---', msg);
    });

    client.on('disconnected', (reason) => {
        clientStatus = 'DISCONNECTED';
        console.log('--- WhatsApp Bot desconectado ---', reason);
    });

    client.initialize().catch(err => {
        console.error('Error al inicializar cliente WhatsApp:', err);
    });
};

const sendAutomatedMessage = async (phone, message) => {
    if (clientStatus !== 'CONNECTED') {
        console.warn('Intento de envío fallido: WhatsApp no está conectado.');
        return false;
    }

    try {
        // Limpiar el número de teléfono (solo números)
        const cleanPhone = phone.replace(/\D/g, '');
        // El formato debe ser 57XXXXXXXXXX@c.us para Colombia
        const chatId = `57${cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone}@c.us`;
        
        await client.sendMessage(chatId, message);
        console.log(`[WA BOT] Mensaje automático enviado a 57${cleanPhone}`);
        return true;
    } catch (error) {
        console.error('[WA BOT ERROR]', error);
        return false;
    }
};

const getWhatsAppStatus = () => {
    return { status: clientStatus, lastQR };
};

module.exports = { initializeWhatsApp, sendAutomatedMessage, getWhatsAppStatus };
