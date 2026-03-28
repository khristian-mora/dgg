const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

// Generate filled DOCX from a template
const generateFormato = async (req, res) => {
    const { id: formatoId } = req.params; // ID of the Formato model
    const { clienteId, tramiteId } = req.body;

    try {
        // 1. Get the format details
        const formatRecord = await prisma.formato.findUnique({
            where: { id: formatoId }
        });

        if (!formatRecord || !formatRecord.urlArchivo) {
            return res.status(404).json({ message: 'Plantilla no encontrada o sin archivo base' });
        }

        // 2. Get client and tramite data
        const client = await prisma.cliente.findUnique({
            where: { id: clienteId },
            include: { armas: true }
        });

        if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

        const tramite = tramiteId ? await prisma.tramite.findUnique({
            where: { id: tramiteId },
            include: { arma: true }
        }) : null;

        // 3. Prepare data for the template
        const data = {
            nombres: client.nombres,
            apellidos: client.apellidos,
            nombre_completo: `${client.nombres} ${client.apellidos}`,
            cedula: client.cedula,
            telefono: client.telefono,
            ciudad: client.ciudad,
            direccion: client.direccion || 'No registrada',
            // Default arma if exists
            marca_arma: tramite?.arma?.marca || client.armas[0]?.marca || 'N/A',
            serie_arma: tramite?.arma?.numeroSerie || client.armas[0]?.numeroSerie || 'N/A',
            fecha_actual: new Date().toLocaleDateString('es-CO')
        };

        // 4. Load the template file
        const templatePath = path.resolve(__dirname, '../../templates', formatRecord.urlArchivo);
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ message: `El archivo de plantilla '${formatRecord.urlArchivo}' no se encuentra en el servidor. Por favor, asegúrate de que exista en la carpeta 'templates'.` });
        }

        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // 5. Render the document with dynamic data
        doc.render(data);

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        // 6. Send the file back or save it
        const filename = `GENERADO_${formatRecord.nombre.replace(/\s+/g, '_')}_${client.cedula}.docx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(buf);

    } catch (error) {
        console.error('Error generating document:', error);
        res.status(500).json({ message: 'Error durante la generación del documento', error: error.message });
    }
};

module.exports = { generateFormato };
