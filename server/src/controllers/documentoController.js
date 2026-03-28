const prisma = require('../config/prisma');
const path = require('path');
const fs = require('fs-extra');

const uploadDocumento = async (req, res) => {
  const { clienteId, tramiteId, titulo, tipo } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo' });
  }

  try {
    const documento = await prisma.documento.create({
      data: {
        clienteId: clienteId || null,
        tramiteId: tramiteId || null,
        titulo: titulo || file.originalname,
        tipo: tipo || 'OTRO',
        nombreArchivo: file.filename,
        mimetype: file.mimetype,
        extension: path.extname(file.originalname).substring(1),
        url: `/uploads/documentos/${file.filename}`,
        size: file.size,
        estado: 'REVISADO'
      }
    });

    // Auditoría automática segura
    try {
        await prisma.auditLog.create({
            data: {
                accion: 'DOCUMENTO_SUBIDO',
                userId: req.user.id,
                detalle: `Archivo ${file.originalname} subido${clienteId ? ` para el cliente ${clienteId}` : ''}`,
                modulo: 'DOCUMENTOS'
            }
        });
    } catch (auditErr) {
        console.error('Error al registrar auditoría:', auditErr.message);
        // No bloqueamos la respuesta exitosa si solo falla el log
    }

    res.status(201).json(documento);
  } catch (err) {
    if (file) await fs.remove(file.path);
    res.status(500).json({ message: 'Error al registrar documento', error: err.message });
  }
};

const getDocumentosByCliente = async (req, res) => {
  const { clienteId } = req.params;
  try {
    const documentos = await prisma.documento.findMany({
      where: { clienteId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documentos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener documentos', error: err.message });
  }
};

const deleteDocumento = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await prisma.documento.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ message: 'Documento no encontrado' });

    // Eliminar archivo físico
    const filePath = path.join(process.cwd(), doc.url.replace(/^\//, ''));
    if (await fs.exists(filePath)) {
      await fs.remove(filePath);
    }

    // Eliminar registro
    await prisma.documento.delete({ where: { id } });

    res.json({ message: 'Documento eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar documento', error: err.message });
  }
};

const updateDocumento = async (req, res) => {
  const { id } = req.params;
  const { verificado } = req.body;
  
  try {
    const updated = await prisma.documento.update({
      where: { id },
      data: { verificado }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar documento', error: err.message });
  }
};

const simpleUpload = async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No hay archivo' });
    
    // Devolvemos la URL pública directamente
    res.json({ 
        url: `/uploads/documentos/${file.filename}`,
        filename: file.filename
    });
};

module.exports = { uploadDocumento, getDocumentosByCliente, deleteDocumento, updateDocumento, simpleUpload };
