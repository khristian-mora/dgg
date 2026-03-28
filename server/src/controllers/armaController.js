const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createArma = async (req, res) => {
  try {
    const { 
      clienteId, claseArma, marca, modelo, calibre, 
      numeroSerie, capacidad, longitudCanon, paisOrigen,
      tipoPermiso, descripcion 
    } = req.body;

    if (!clienteId || !claseArma) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para el registro del arma' });
    }

    const nuevaArma = await prisma.arma.create({
      data: {
        clienteId,
        claseArma,
        marca,
        modelo,
        calibre,
        numeroSerie,
        capacidad: capacidad ? parseInt(capacidad) : null,
        longitudCanon,
        paisOrigen,
        tipoPermiso,
        descripcion
      }
    });

    res.status(201).json(nuevaArma);
  } catch (error) {
    console.error('Error al crear arma:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getArmasByCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const armas = await prisma.arma.findMany({
      where: { clienteId }
    });
    res.json(armas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener armas' });
  }
};

const uploadFotosArma = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const arma = await prisma.arma.findUnique({ where: { id } });
    if (!arma) {
      return res.status(404).json({ error: 'Arma no encontrada' });
    }

    const updateData = {};
    
    if (files.foto1) updateData.foto1 = `/uploads/documentos/${files.foto1[0].filename}`;
    if (files.foto2) updateData.foto2 = `/uploads/documentos/${files.foto2[0].filename}`;
    if (files.foto3) updateData.foto3 = `/uploads/documentos/${files.foto3[0].filename}`;
    if (files.foto4) updateData.foto4 = `/uploads/documentos/${files.foto4[0].filename}`;
    if (files.fotoImprontas) updateData.fotoImprontas = `/uploads/documentos/${files.fotoImprontas[0].filename}`;

    const armaActualizada = await prisma.arma.update({
      where: { id },
      data: updateData
    });

    res.json(armaActualizada);
  } catch (error) {
    console.error('Error al subir fotos del arma:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getArmaById = async (req, res) => {
  try {
    const { id } = req.params;
    const arma = await prisma.arma.findUnique({
      where: { id },
      include: { cliente: true }
    });
    
    if (!arma) {
      return res.status(404).json({ error: 'Arma no encontrada' });
    }

    res.json(arma);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener arma' });
  }
};

const updateArma = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const armaActualizada = await prisma.arma.update({
      where: { id },
      data
    });

    res.json(armaActualizada);
  } catch (error) {
    console.error('Error al actualizar arma:', error);
    res.status(500).json({ error: 'Error al actualizar arma' });
  }
};

module.exports = {
  createArma,
  getArmasByCliente,
  uploadFotosArma,
  getArmaById,
  updateArma
};
