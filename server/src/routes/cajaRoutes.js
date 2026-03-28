const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

// Registrar movimiento en caja (ahora acepta clienteId opcional)
router.post('/movimiento', authMiddleware, async (req, res) => {
    try {
        const { tipo, concepto, valor, categoria, referencia, notas, metodoPago, comprobante, clienteId } = req.body;
        const valorNum = parseFloat(valor);

        // 1. Crear el movimiento en Caja
        const movimiento = await prisma.caja.create({
            data: { 
                tipo, 
                concepto, 
                valor: valorNum, 
                categoria, 
                referencia, 
                notas, 
                metodoPago, 
                comprobante, 
                clienteId: clienteId || null 
            },
            include: {
                cliente: { select: { id: true, nombres: true, apellidos: true, cedula: true } }
            }
        });

        // 2. Si es un INGRESO de un TRAMITE, actualizar el saldo y abonos del trámite
        if (tipo === 'INGRESO' && (categoria === 'tramite' || categoria === 'TRAMITE') && referencia) {
            try {
                const tramite = await prisma.tramite.findUnique({ where: { id: referencia } });
                if (tramite) {
                    await prisma.tramite.update({
                        where: { id: referencia },
                        data: {
                            abonoTotal: { increment: valorNum },
                            saldoPendiente: { decrement: valorNum }
                        }
                    });

                    // También crear registro en la tabla de Pagos del tramite
                    await prisma.pago.create({
                        data: {
                            tramiteId: referencia,
                            clienteId: clienteId || tramite.clienteId,
                            tipo: 'ABONO',
                            concepto: concepto || 'Abono registrado desde Caja',
                            valor: valorNum,
                            metodoPago: metodoPago || 'EFECTIVO'
                        }
                    });
                }
            } catch (err) {
                console.error('Error sincronizando pago con trámite:', err);
                // No detenemos la respuesta, el movimiento de caja ya se creó
            }
        }

        res.json(movimiento);
    } catch (error) {
        console.error('Error registrar movimiento:', error);
        res.status(500).json({ error: 'Error al registrar movimiento' });
    }
});

// Historial de pagos de un cliente específico
router.get('/cliente/:clienteId', authMiddleware, async (req, res) => {
    try {
        const { clienteId } = req.params;
        const movimientos = await prisma.caja.findMany({
            where: { clienteId },
            orderBy: { fecha: 'desc' }
        });
        
        const totalPagado = movimientos
            .filter(m => m.tipo === 'INGRESO')
            .reduce((sum, m) => sum + m.valor, 0);
        
        res.json({ movimientos, totalPagado });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial del cliente' });
    }
});

// Arqueo Diario
router.get('/arqueo/diario', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { fecha } = req.query;
        const targetDate = fecha ? new Date(fecha) : new Date();
        targetDate.setHours(0,0,0,0);
        
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        const movimientos = await prisma.caja.findMany({
            where: {
                fecha: { gte: targetDate, lt: nextDay }
            },
            include: {
                cliente: { select: { id: true, nombres: true, apellidos: true, cedula: true } }
            },
            orderBy: { fecha: 'desc' }
        });

        const ingresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.valor, 0);
        const egresos = movimientos.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + m.valor, 0);

        res.json({
            fecha: targetDate,
            movimientos,
            resumen: {
                ingresos,
                egresos,
                balance: ingresos - egresos
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar arqueo diario' });
    }
});

// Arqueo Mensual
router.get('/arqueo/mensual', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { mes, anio } = req.query;
        const targetDate = new Date(anio, mes, 1);
        const nextMonth = new Date(anio, parseInt(mes) + 1, 1);

        const movimientos = await prisma.caja.findMany({
            where: { fecha: { gte: targetDate, lt: nextMonth } },
            include: {
                cliente: { select: { id: true, nombres: true, apellidos: true } }
            },
            orderBy: { fecha: 'desc' }
        });

        const ingresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.valor, 0);
        const egresos = movimientos.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + m.valor, 0);

        res.json({
            periodo: `${mes}/${anio}`,
            movimientos,
            resumen: {
                ingresos,
                egresos,
                balance: ingresos - egresos,
                totalMovimientos: movimientos.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar arqueo mensual' });
    }
});

// Arqueo Anual
router.get('/arqueo/anual', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { anio } = req.query;
        const targetAnio = parseInt(anio) || new Date().getFullYear();
        const startOfYear = new Date(targetAnio, 0, 1);
        const endOfYear = new Date(targetAnio + 1, 0, 1);

        const movimientos = await prisma.caja.findMany({
            where: { fecha: { gte: startOfYear, lt: endOfYear } },
            include: {
                cliente: { select: { id: true, nombres: true, apellidos: true } }
            },
            orderBy: { fecha: 'asc' }
        });

        const ingresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.valor, 0);
        const egresos = movimientos.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + m.valor, 0);

        // Agrupar por mes para el gráfico
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const datosGrafico = meses.map((nombre, index) => {
            const movsMes = movimientos.filter(m => m.fecha.getMonth() === index);
            return {
                name: nombre,
                ingresos: movsMes.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.valor, 0),
                egresos: movsMes.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + m.valor, 0)
            };
        });

        res.json({
            anio: targetAnio,
            resumen: {
                ingresos,
                egresos,
                balance: ingresos - egresos,
                totalMovimientos: movimientos.length
            },
            grafico: datosGrafico
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar arqueo anual' });
    }
});

module.exports = router;
