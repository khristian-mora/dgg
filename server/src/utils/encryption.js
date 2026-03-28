const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recomendación para GCM
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long-!!'; // Debe ser de 32 bytes

if (!process.env.ENCRYPTION_KEY) {
    console.warn('⚠️ ADVERTENCIA: Usando clave de cifrado por defecto. Configura ENCRYPTION_KEY en tu .env para máxima seguridad bancaria.');
}

/**
 * Cifra un texto usando AES-256-GCM
 */
function encrypt(text) {
    if (!text) return null;
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // El resultado final es IV:AuthTag:EncryptedText
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Descifra un texto cifrado con AES-256-GCM
 */
function decrypt(hash) {
    if (!hash || !hash.includes(':')) return hash; // Si no tiene el formato, devolverlo tal cual
    
    try {
        const [ivHex, authTagHex, encryptedHex] = hash.split(':');
        
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
        
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Error al descifrar:', error.message);
        return '--- ERROR AL DESCIFRAR ---';
    }
}

module.exports = { encrypt, decrypt };
