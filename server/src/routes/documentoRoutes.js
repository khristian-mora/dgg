const express = require('express');
const router = express.Router();
const { uploadDocumento, getDocumentosByCliente, deleteDocumento, updateDocumento, simpleUpload } = require('../controllers/documentoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.post('/upload', verifyToken, upload.single('archivo'), uploadDocumento);
router.post('/simple-upload', verifyToken, upload.single('archivo'), simpleUpload);
router.get('/cliente/:clienteId', verifyToken, getDocumentosByCliente);
router.put('/:id', verifyToken, updateDocumento);
router.delete('/:id', verifyToken, deleteDocumento);


module.exports = router;
