const express = require('express');
const router = express.Router();
const { createArma, getArmasByCliente, uploadFotosArma, getArmaById, updateArma } = require('../controllers/armaController');
const { verifyToken: protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'documentos'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `arma-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png) y PDF'));
  }
});

router.post('/', protect, createArma);
router.get('/cliente/:clienteId', protect, getArmasByCliente);
router.get('/:id', protect, getArmaById);
router.put('/:id', protect, updateArma);
router.post('/:id/fotos', protect, upload.fields([
  { name: 'foto1', maxCount: 1 },
  { name: 'foto2', maxCount: 1 },
  { name: 'foto3', maxCount: 1 },
  { name: 'foto4', maxCount: 1 },
  { name: 'fotoImprontas', maxCount: 1 }
]), uploadFotosArma);

module.exports = router;
