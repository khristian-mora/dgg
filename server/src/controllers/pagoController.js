const prisma = require('../config/prisma');
const { sendEmail } = require('../services/emailService');

const createPago = async (req, res) => {
    const { tramiteId, valor, metodoPago, concepto, comprobante, fecha } = req.body;

    console.log(`[PAGOS] Registrando abono para trámite ${tramiteId}, valor: ${valor}, fecha: ${fecha || 'Hoy'}`);

    try {
        const tramite = await prisma.tramite.findUnique({
            where: { id: tramiteId },
            include: { cliente: true }
        });

        if (!tramite) return res.status(404).json({ message: 'Trámite no encontrado' });

        // 1. Crear el Pago (Operación Crítica)
        const monto = parseFloat(valor);
        if (isNaN(monto)) throw new Error('El valor del pago no es un número válido');

        const pago = await prisma.pago.create({
            data: {
                tramiteId,
                clienteId: tramite.clienteId,
                valor: monto,
                metodoPago: metodoPago || 'EFECTIVO',
                concepto: concepto || `Abono a trámite: ${tramite.tipo}`,
                comprobante,
                tipo: 'ABONO',
                fecha: fecha ? new Date(fecha) : new Date()
            }
        });

        // 2. RECALCULAR Totales del Trámite (Crítico para el negocio)
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

        // 3. SECUNDARIO: Registrar en Caja General
        try {
            await prisma.caja.create({
                data: {
                    tipo: 'INGRESO',
                    concepto: `Pago Trámite ${tramite.tipo} - Cliente: ${tramite.cliente.nombres} ${tramite.cliente.apellidos}`,
                    valor: monto,
                    categoria: 'TRAMITE',
                    referencia: pago.id,
                    clienteId: tramite.clienteId,
                    metodoPago: metodoPago || 'EFECTIVO',
                    comprobante,
                    fecha: fecha ? new Date(fecha) : new Date()
                }
            });
            console.log(`[PAGOS] Registro en Caja exitoso`);
        } catch (cajaErr) {
            console.error('[PAGOS ERROR] Fallo al registrar en caja general (No crítico):', cajaErr);
        }

        // 4. SECUNDARIO: Notificación de Pago al Cliente
        if (tramite.cliente.correoElectronico) {
            try {
                const subject = `Recibo de Pago: Abono a Trámite ${tramite.tipo}`;
                const text = `Hola ${tramite.cliente.nombres}, hemos registrado tu abono de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(monto)}. 
                Concepto: ${concepto || 'Abono general'}. 
                Nuevo Saldo Pendiente: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saldoPendiente)}.`;
                
                await sendEmail(tramite.cliente.correoElectronico, subject, text, { type: 'PAGO' });
            } catch (notifyErr) {
                console.error('[PAGOS ERROR] Fallo al enviar notificación de pago:', notifyErr);
            }
        }

        res.status(201).json(pago);
    } catch (err) {
        console.error('[PAGOS CRITICAL ERROR]:', err);
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
