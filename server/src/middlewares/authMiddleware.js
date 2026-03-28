const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Se requiere token de autenticación' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tiene permisos para acceder a este recurso' });
    }

    next();
  };
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'SUPER_ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Administrador' });
  }
};

module.exports = { 
  verifyToken, 
  checkRole, 
  authMiddleware: verifyToken, 
  isAdmin 
};
