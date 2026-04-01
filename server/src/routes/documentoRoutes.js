const express = require('express');
const router = express.Router();
const { uploadDocumento, getDocumentosByCliente, deleteDocumento, updateDocumento, simpleUpload, getDocumentosByTramite, getAllDocumentos } = require('../controllers/documentoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.get('/', verifyToken, getAllDocumentos);
router.post('/upload', verifyToken, upload.single('archivo'), uploadDocumento);
router.post('/simple-upload', verifyToken, upload.single('archivo'), simpleUpload);
router.get('/cliente/:clienteId', verifyToken, getDocumentosByCliente);
router.get('/tramite/:tramiteId', verifyToken, getDocumentosByTramite);
router.put('/:id', verifyToken, updateDocumento);
router.delete('/:id', verifyToken, deleteDocumento);


module.exports = router;
