const prisma = require('../config/prisma');

const createPago = async (req, res) => {
    const { tramiteId, valor, metodoPago, concepto, comprobante } = req.body;

    try {
        const tramite = await prisma.tramite.findUnique({
            where: { id: tramiteId },
            include: { cliente: true }
        });

        if (!tramite) return res.status(404).json({ message: 'Trámite no encontrado' });

        // Crear el Pago
        const pago = await prisma.pago.create({
            data: {
                tramiteId,
                clienteId: tramite.clienteId,
                valor: parseFloat(valor),
                metodoPago,
                concepto: concepto || `Abono a trámite: ${tramite.tipo}`,
                comprobante
            }
        });

        // RECALCULAR Totales del Trámite
        const pagosExistentes = await prisma.pago.findMany({
            where: { tramiteId }
        });

        const abonoTotal = pagosExistentes.reduce((sum, p) => sum + p.valor, 0);
        const valorAcuerdo = tramite.valorAcuerdo || 0;
        const saldoPendiente = Math.max(0, valorAcuerdo - abonoTotal);

        await prisma.tramite.update({
            where: { id: tramiteId },
            data: {
                abonoTotal,
                saldoPendiente,
                pazYSalvo: saldoPendiente <= 0 && valorAcuerdo > 0
            }
        });

        // Tambien registrar en Caja General para reporte contable unificado
        await prisma.caja.create({
            data: {
                tipo: 'INGRESO',
                concepto: `Pago Trámite ${tramite.tipo} - Cliente: ${tramite.cliente.nombres} ${tramite.cliente.apellidos}`,
                valor: parseFloat(valor),
                categoria: 'TRAMITE',
                referencia: pago.id,
                clienteId: tramite.clienteId,
                metodoPago,
                comprobante
            }
        });

        res.status(201).json(pago);
    } catch (err) {
        console.error('Error al registrar pago:', err);
        res.status(500).json({ message: 'Error al registrar el pago', error: err.message });
    }
};

const getPagosByTramite = async (req, res) => {
    const { tramiteId } = req.params;
    try {
        const pagos = await prisma.pago.findMany({
            where: { tramiteId },
            orderBy: { fecha: 'desc' }
        });
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener pagos', error: err.message });
    }
};

const deletePago = async (req, res) => {
    const { id } = req.params;
    try {
        const pago = await prisma.pago.findUnique({
            where: { id },
            include: { tramite: true }
        });

        if (!pago) return res.status(404).json({ message: 'Pago no encontrado' });

        const tramiteId = pago.tramiteId;

        // Borrar de Pago
        await prisma.pago.delete({ where: { id } });

        // Borrar el registro espejo en Caja si existe
        await prisma.caja.deleteMany({
            where: { referencia: id }
        });

        // RECALCULAR Totales del Trámite
        const pagosRestantes = await prisma.pago.findMany({
            where: { tramiteId }
        });

        const abonoTotal = pagosRestantes.reduce((sum, p) => sum + p.valor, 0);
        const valorAcuerdo = pago.tramite.valorAcuerdo || 0;
        const saldoPendiente = Math.max(0, valorAcuerdo - abonoTotal);

        await prisma.tramite.update({
            where: { id: tramiteId },
            data: {
                abonoTotal,
                saldoPendiente,
                pazYSalvo: saldoPendiente <= 0 && valorAcuerdo > 0
            }
        });

        res.json({ message: 'Pago eliminado y totales actualizados' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar pago', error: err.message });
    }
};

module.exports = { createPago, getPagosByTramite, deletePago };
