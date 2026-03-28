const prisma = require('../config/prisma');

const getAllConfigs = async (req, res) => {
  try {
    const configs = await prisma.configuracion.findMany();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener configuraciones', error: err.message });
  }
};

const updateConfig = async (req, res) => {
  const { clave, valor, descripcion } = req.body;
  
  try {
    const config = await prisma.configuracion.upsert({
      where: { clave },
      update: { valor, descripcion },
      create: { clave, valor, descripcion }
    });

    // Auditoria
    await prisma.auditLog.create({
        data: {
            accion: 'CONFIG_ACTUALIZADA',
            userId: req.user.id,
            detalle: `Clave: ${clave}, Nuevo Valor: ${valor}`,
            modulo: 'CONFIG'
        }
    });

    res.json(config);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar configuración', error: err.message });
  }
};

const getConfigByClave = async (req, res) => {
    const { clave } = req.params;
    try {
        const config = await prisma.configuracion.findUnique({ where: { clave } });
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener config', error: err.message });
    }
};

module.exports = { getAllConfigs, updateConfig, getConfigByClave };
