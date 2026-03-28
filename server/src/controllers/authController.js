const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Actually we used Prisma with hashes already, let's keep it simple for now and use a mock user if the DB isn't seeded.

const prisma = require('../config/prisma');

const login = async (req, res) => {
  const { email, password } = req.body; // 'email' can now be either email or username
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

  console.log('[DEBUG] Login attempt:', { email, password });

  try {
    // Buscar usuario por email o por nombre de usuario (nombre.apellido)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { nombre: email }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña con bcrypt
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Limpiar objeto user antes de firmar token (no enviar hash)
    const { passwordHash, ...userData } = user;

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1d' });
    
    return res.json({ 
      token, 
      user: userData 
    });

  } catch (error) {
    console.error('Error en Login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getMe = async (req, res) => {
  return res.json(req.user);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al cambiar contraseña', error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Por seguridad, no decimos si el email existe o no, pero ya que es interno...
      return res.status(404).json({ message: 'No encontramos una cuenta con ese correo electrónico.' });
    }

    // Generar Token de Recuperación (Vence en 1 hora)
    const resetToken = jwt.sign({ id: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
    
    // Enviar Email
    const { sendEmail } = require('../services/emailService');
    const resetUrl = `https://www.dggestionarmas.com/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 15px;">
        <h2 style="color: #68774c; text-align: center;">Recuperación de Acceso - DGG</h2>
        <p>Hola <strong>${user.nombre}</strong>,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #68774c; color: white; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold;">RESTABLECER MI CONTRASEÑA</a>
        </div>
        <p style="font-size: 12px; color: #666;">Si no has solicitado este cambio, por favor ignora este correo. Este enlace vence en 1 hora.</p>
        <hr />
        <p style="font-size: 10px; color: #999; text-align: center;">Diana Gomez Garcia - Gestión Profesional de Trámites</p>
      </div>
    `;

    await sendEmail(email, 'Restablecer Contraseña - GestorArmas Pro', 'Haz clic aquí para restablecer tu contraseña.', htmlContent);

    res.json({ message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' });
  } catch (error) {
    console.error('Error en ForgotPassword:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud de recuperación' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'reset') throw new Error('Token inválido');

    const userId = decoded.id;
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.json({ message: 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error en ResetPassword:', error);
    res.status(401).json({ message: 'El enlace de recuperación es inválido o ha expirado.' });
  }
};

module.exports = { login, getMe, changePassword, forgotPassword, resetPassword };
