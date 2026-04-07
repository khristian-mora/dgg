import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
    FileText, 
    Calendar, 
    Clock, 
    User, 
    ArrowLeft, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    Shield,
    DollarSign,
    Info,
    Send,
    Circle,
    CheckCircle,
    MessageSquare,
    ChevronRight,
    Play,
    Check,
    CreditCard,
    Plus,
    Trash2,
    Edit3,
    Upload,
    FileCheck,
    X
} from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatInputValue, parseAmount } from '../utils/formatters'
import { REQUISITOS_OFICIALES } from '../config/tramiteConfig'
import toast from 'react-hot-toast'
import AdvancementModal from '../components/tramites/AdvancementModal'

const TramiteDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdminOrGestion = user?.rol === 'SUPER_ADMIN' || user?.rol === 'GESTION';
    const [tramite, setTramite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [advancing, setAdvancing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showEditCostModal, setShowEditCostModal] = useState(false);
    const [newCost, setNewCost] = useState('');
    const [documentosTramite, setDocumentosTramite] = useState([]);
    const [uploadingReq, setUploadingReq] = useState(null); // id del requisito que se está subiendo
    const fileInputRef = useRef(null);
    const [paymentForm, setPaymentForm] = useState({
        valor: '',
        metodoPago: 'EFECTIVO',
        concepto: '',
        comprobante: '',
        fecha: new Date().toISOString().split('T')[0],
        comprobanteFile: null
    });
    const [showAdvancementModal, setShowAdvancementModal] = useState(false);

    useEffect(() => {
        fetchTramite();
    }, [id]);

    const fetchTramite = async () => {
        try {
            setLoading(true);
            const [data, docs] = await Promise.all([
                api.tramites.getById(id),
                api.documentos.getByTramite(id)
            ]);
            setTramite(data);
            setDocumentosTramite(docs);
        } catch (error) {
            console.error('Error fetching tramite:', error);
            toast.error('No se pudo cargar la información del trámite');
        } finally {
            setLoading(false);
        }
    };

    const handleAvanzarPaso = () => {
        setShowAdvancementModal(true);
    };

    const confirmAvanzarPaso = async (data) => {
        try {
            setAdvancing(true);
            await api.tramites.avanzarPaso(id, data);
            toast.success('Paso completado con éxito');
            fetchTramite();
        } catch (error) {
            console.error('Error al avanzar paso:', error);
            toast.error('Error al actualizar el trámite');
        } finally {
            setAdvancing(false);
        }
    };

    const handleUpdateCost = async () => {
        try {
            await api.tramites.update(id, { valorAcuerdo: parseAmount(newCost) });
            toast.success('Costo actualizado');
            setShowEditCostModal(false);
            fetchTramite();
        } catch (error) {
            toast.error('Error al actualizar costo');
        }
    };

    const handleRegisterPayment = async (e) => {
        e.preventDefault();
        try {
            setAdvancing(true);
            let comprobanteUrl = paymentForm.comprobante;

            // 1. Subir archivo si existe
            if (paymentForm.comprobanteFile) {
                const formData = new FormData();
                formData.append('archivo', paymentForm.comprobanteFile);
                const uploadRes = await api.documentos.simpleUpload(formData);
                comprobanteUrl = uploadRes.url;
            }

            // 2. Crear Pago
            const payload = { 
                ...paymentForm, 
                valor: parseAmount(paymentForm.valor),
                comprobante: comprobanteUrl,
                tramiteId: id
            };
            
            await api.pagos.create(payload);
            toast.success('Pago registrado con éxito');
            setShowPaymentModal(false);
            setPaymentForm({ 
                valor: '', 
                metodoPago: 'EFECTIVO', 
                concepto: '', 
                comprobante: '',
                fecha: new Date().toISOString().split('T')[0],
                comprobanteFile: null
            });
            fetchTramite();
        } catch (error) {
            console.error('Error al registrar pago:', error);
            toast.error('Error al registrar el pago');
        } finally {
            setAdvancing(false);
        }
    };

    const handleDeletePago = async (pagoId) => {
        if (!window.confirm('¿Estás seguro de eliminar este registro de pago?')) return;
        try {
            await api.pagos.delete(pagoId);
            toast.success('Pago eliminado');
            fetchTramite();
        } catch (error) {
            toast.error('Error al eliminar pago');
        }
    };

    const handleSubirRequisito = async (requisito, file) => {
        if (!file) return;
        setUploadingReq(requisito.id);
        try {
            const formData = new FormData();
            formData.append('archivo', file);
            formData.append('clienteId', tramite.clienteId);
            formData.append('tramiteId', id);
            formData.append('tipo', requisito.id);
            formData.append('titulo', requisito.label);
            await api.documentos.upload(formData);
            toast.success(`¡Documento "${requisito.label}" subido correctamente!`);
            // Refrescar solo los documentos
            const docs = await api.documentos.getByTramite(id);
            setDocumentosTramite(docs);
        } catch (error) {
            toast.error('Error al subir el documento');
        } finally {
            setUploadingReq(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
            <p className="text-military-400 font-bold uppercase tracking-widest text-xs">Cargando Trámite...</p>
        </div>
    );

    if (!tramite) return (
        <div className="p-10 text-center text-white">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <p>Trámite no encontrado</p>
            <button onClick={() => navigate('/tramites')} className="mt-4 text-gold-500 hover:underline">Volver a la lista</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => user?.rol === 'CLIENTE' ? navigate('/portal') : navigate(-1)} 
                    className="p-3 bg-military-900 rounded-2xl text-military-400 hover:text-white transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <p className="text-gold-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Expediente de Trámite</p>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{tramite.tipo}</h1>
                </div>
            </div>

            {/* ROADMAP / STEPPER */}
            <div className="glass p-8 rounded-[2.5rem] border border-military-100/10 overflow-x-auto">
                <div className="flex items-start justify-between min-w-[800px] relative">
                    <div className="absolute top-6 left-10 right-10 h-0.5 bg-military-800 z-0" />
                    
                    {tramite.roadmap?.map((step, index) => {
                        const isCompleted = index < (tramite.pasos?.length || 0);
                        const isCurrent = index === (tramite.pasos?.length || 0);
                        
                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center text-center w-32 group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 border-2 ${
                                    isCompleted ? 'bg-gold-500 border-gold-400 text-military-950 scale-110' : 
                                    isCurrent ? 'bg-military-800 border-gold-500 text-gold-500 animate-pulse' : 
                                    'bg-military-900 border-military-800 text-military-600'
                                }`}>
                                    {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-tighter mb-1 ${isCurrent ? 'text-gold-500' : 'text-military-400'}`}>{step.label}</p>
                                <p className="text-[8px] text-military-600 font-bold leading-tight group-hover:text-military-400 transition-colors uppercase">{step.desc}</p>
                                
                                {isCurrent && (
                                    <button 
                                        onClick={handleAvanzarPaso}
                                        disabled={advancing}
                                        className="mt-4 px-3 py-1.5 bg-gold-gradient text-military-950 rounded-lg text-[9px] font-black uppercase hover:scale-105 transition-transform flex items-center gap-1"
                                    >
                                        <Send size={10} /> {advancing ? 'Procesando...' : 'Completar'}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Info y Línea de Tiempo */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-[2.5rem] border border-military-100/10">
                        <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-4">
                                <div className="p-4 bg-military-900 rounded-2xl text-gold-500">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-military-500 uppercase tracking-widest italic">Radicado No.</p>
                                    <p className="text-xl font-black text-white tracking-tight">{tramite.id}</p>
                                </div>
                             </div>
                             <div className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest ${
                                 tramite.estado === 'COMPLETADO' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
                                 tramite.estado === 'RECHAZADO' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                                 'bg-gold-500/10 text-gold-500 border border-gold-500/30'
                             }`}>
                                 {tramite.estado}
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DetailItem icon={<Calendar size={18}/>} label="Fecha Inicio" value={new Date(tramite.createdAt).toLocaleDateString('es-CO')} />
                            <DetailItem icon={<Clock size={18}/>} label="Prioridad" value={tramite.esUrgente ? 'URGENTE' : 'ESTÁNDAR'} color={tramite.esUrgente ? 'text-red-500' : 'text-military-400'} />
                            <DetailItem icon={<Info size={18}/>} label="Última Actualización" value={new Date(tramite.updatedAt).toLocaleDateString('es-CO')} />
                        </div>
                    </div>

                    {/* Cliente Relacionado */}
                    <div className="glass p-8 rounded-[2.5rem] border border-military-100/10 flex items-center justify-between group hover:border-gold-500/20 transition-all cursor-pointer" onClick={() => navigate(`/clientes/${tramite.clienteId}`)}>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-military-900 flex items-center justify-center text-military-400 group-hover:text-gold-500 transition-colors">
                                <User size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-military-500 uppercase tracking-widest">Titular del Trámite</p>
                                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-gold-500 transition-colors">{tramite.cliente?.nombres} {tramite.cliente?.apellidos}</h3>
                                <p className="text-xs text-military-400">CC: {tramite.cliente?.cedula}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-military-900 rounded-2xl text-military-700 group-hover:text-white transition-all">
                            <ArrowLeft className="rotate-180" size={24} />
                        </div>
                    </div>

                    {/* Línea de Tiempo / Historial de Pasos */}
                    <div className="glass p-8 rounded-[2.5rem] border border-military-100/10">
                        <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                            <Clock className="text-gold-500" size={24} />
                            Línea de Tiempo del Trámite
                        </h3>
                        
                        <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-military-800">
                            {tramite.pasos?.length > 0 ? tramite.pasos.map((paso, idx) => (
                                <div key={paso.id} className="relative">
                                    <div className={`absolute -left-[26px] top-1.5 w-4 h-4 rounded-full border-2 border-military-950 ${idx === 0 ? 'bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-military-700'}`} />
                                    <div className="bg-military-900/40 p-5 rounded-[2rem] border border-military-800/50 hover:bg-military-900/60 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                                            <p className="text-sm font-bold text-white leading-tight">{paso.descripcion}</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="px-2 py-1 bg-military-800 rounded-lg text-[9px] font-black text-military-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar size={10} /> {new Date(paso.fechaAccion).toLocaleDateString('es-CO')}
                                                </span>
                                                <span className="px-2 py-1 bg-military-800 rounded-lg text-[9px] font-black text-military-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={10} /> {new Date(paso.fechaAccion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-military-800 flex items-center justify-center">
                                                <User size={10} className="text-military-400" />
                                            </div>
                                            <p className="text-[10px] text-military-500 font-black uppercase tracking-widest">
                                                Realizado por: <span className="text-military-300">{paso.realizadoPor || 'Sistema'}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 border-2 border-dashed border-military-800 rounded-[2rem]">
                                    <p className="text-xs text-military-600 font-bold uppercase tracking-widest">No hay actividad registrada aún</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Finanzas, Requisitos y Pagos */}
                <div className="space-y-6">
                    {/* Tarjeta Financiera */}
                    <div className="glass p-6 rounded-[2.5rem] border border-military-100/10 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                                <DollarSign className="text-gold-500" size={20} />
                                Resumen Financiero
                            </h3>
                            {isAdminOrGestion && (
                                <button 
                                    onClick={() => {
                                        setNewCost(tramite.valorAcuerdo);
                                        setShowEditCostModal(true);
                                    }}
                                    className="p-2 hover:bg-military-800 rounded-lg text-military-400 transition-all"
                                >
                                    <Edit3 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-military-900/50 p-4 rounded-2xl border border-military-800">
                                <p className="text-[10px] text-military-500 font-extrabold uppercase tracking-widest mb-1">Costo Total</p>
                                <p className="text-xl font-black text-white">
                                    {formatCurrency(tramite.valorAcuerdo || 0)}
                                </p>
                            </div>
                            <div className="bg-military-900/50 p-4 rounded-2xl border border-military-800">
                                <p className="text-[10px] text-military-500 font-extrabold uppercase tracking-widest mb-1">Saldo Pendiente</p>
                                <p className={`text-xl font-black ${tramite.saldoPendiente > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {formatCurrency(tramite.saldoPendiente || 0)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs font-bold text-military-400">
                                <span>Progreso de Pago</span>
                                <span className="text-gold-500">{Math.round(((tramite.abonoTotal || 0) / (tramite.valorAcuerdo || 1)) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-military-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gold-gradient transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                                    style={{ width: `${Math.min(100, (tramite.abonoTotal || 0) / (tramite.valorAcuerdo || 1) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {isAdminOrGestion && (
                            <button 
                                onClick={() => setShowPaymentModal(true)}
                                className="w-full py-4 bg-gold-gradient text-military-950 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                <Plus size={20} /> Registrar Abono
                            </button>
                        )}
                    </div>

                    {/* === CHECKLIST DE REQUISITOS === */}
                    {(() => {
                        const requisitos = REQUISITOS_OFICIALES[tramite.tipo] || [];
                        if (requisitos.length === 0) return null;

                        const docsEntregados = requisitos.filter(req =>
                            documentosTramite.some(doc =>
                                doc.tipo === req.id || doc.titulo?.toLowerCase().includes(req.label.toLowerCase().substring(0, 12))
                            )
                        );
                        const pct = Math.round((docsEntregados.length / requisitos.length) * 100);

                        return (
                            <div className="glass p-6 rounded-[2.5rem] border border-military-100/10">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                                        <FileCheck className="text-gold-500" size={20} />
                                        Requisitos del Trámite
                                    </h3>
                                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                                        pct === 100 ? 'bg-green-500/10 text-green-400' : 'bg-gold-500/10 text-gold-500'
                                    }`}>{docsEntregados.length}/{requisitos.length}</span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-[10px] font-black text-military-500 uppercase mb-1">
                                        <span>Documentos entregados</span>
                                        <span className={pct === 100 ? 'text-green-400' : 'text-gold-500'}>{pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-military-900 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-700 rounded-full ${
                                                pct === 100 ? 'bg-green-500' : 'bg-gold-gradient'
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {requisitos.map((req) => {
                                        const entregado = documentosTramite.some(doc =>
                                            doc.tipo === req.id || doc.titulo?.toLowerCase().includes(req.label.toLowerCase().substring(0, 12))
                                        );
                                        const cargando = uploadingReq === req.id;

                                        return (
                                            <div key={req.id} className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                                                entregado
                                                    ? 'bg-green-500/5 border-green-500/20'
                                                    : 'bg-military-900/40 border-military-800 hover:border-military-600'
                                            }`}>
                                                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                                    entregado ? 'bg-green-500' : 'bg-military-800 border border-military-700'
                                                }`}>
                                                    {entregado && <Check size={11} className="text-white" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold leading-tight ${
                                                        entregado ? 'text-green-400' : 'text-white'
                                                    }`}>{req.label}</p>
                                                    <p className="text-[9px] text-military-600 font-bold mt-0.5 leading-tight">{req.descripcion}</p>
                                                </div>
                                                {!entregado && (
                                                    <label className="shrink-0 cursor-pointer">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files[0]) handleSubirRequisito(req, e.target.files[0]);
                                                                e.target.value = '';
                                                            }}
                                                            disabled={cargando}
                                                        />
                                                        <div className={`p-1.5 rounded-lg transition-all ${
                                                            cargando
                                                                ? 'bg-military-800 text-military-600'
                                                                : 'bg-gold-500/10 text-gold-500 hover:bg-gold-500 hover:text-military-950'
                                                        }`}>
                                                            {cargando
                                                                ? <Loader2 size={12} className="animate-spin" />
                                                                : <Upload size={12} />}
                                                        </div>
                                                    </label>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Historial de Pagos */}
                    <div className="glass p-8 rounded-[2.5rem] border border-military-100/10">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6 uppercase tracking-tight">
                            <CreditCard className="text-gold-500" size={20} />
                            Historial de Pagos
                        </h3>
                        
                        <div className="space-y-4">
                            {tramite.pagos?.length > 0 ? tramite.pagos.map((pago) => (
                                <div key={pago.id} className="flex items-center justify-between p-4 bg-military-900/50 rounded-2xl border border-military-800 group">
                                    <div>
                                        <p className="font-bold text-white text-sm">{formatCurrency(pago.valor || 0)}</p>
                                        <p className="text-[10px] text-military-500 uppercase font-black tracking-widest mt-1">
                                            {new Date(pago.fecha).toLocaleDateString()} • {pago.metodoPago}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pago.comprobante && (
                                            <a 
                                                href={pago.comprobante.startsWith('http') ? pago.comprobante : `http://localhost:5000${pago.comprobante}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 text-gold-500 hover:text-white transition-all bg-military-800 rounded-xl"
                                                title="Ver comprobante"
                                            >
                                                <FileText size={14} />
                                            </a>
                                        )}
                                        {isAdminOrGestion && (
                                            <button 
                                                onClick={() => handleDeletePago(pago.id)}
                                                className="p-2 text-military-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-military-800 rounded-xl"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-6 border-2 border-dashed border-military-800 rounded-3xl">
                                    <p className="text-xs text-military-600 font-bold uppercase tracking-widest">Sin registros de pago</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Registro de Pago */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-military-950/80 backdrop-blur-sm">
                    <div className="glass w-full max-w-md p-8 rounded-[3rem] border border-military-800 shadow-2xl">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Registrar Abono</h3>
                        <form onSubmit={handleRegisterPayment} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Monto del Pago</label>
                                    <input 
                                        type="text" 
                                        value={formatInputValue(paymentForm.valor)}
                                        onChange={(e) => setPaymentForm({...paymentForm, valor: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-2xl p-4 text-white focus:border-gold-500 outline-none font-bold"
                                        required
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Fecha del Pago</label>
                                    <input 
                                        type="date" 
                                        value={paymentForm.fecha}
                                        onChange={(e) => setPaymentForm({...paymentForm, fecha: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-2xl p-4 text-white focus:border-gold-500 outline-none font-bold"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Método de Pago</label>
                                <select 
                                    value={paymentForm.metodoPago}
                                    onChange={(e) => setPaymentForm({...paymentForm, metodoPago: e.target.value})}
                                    className="w-full bg-military-900 border border-military-800 rounded-2xl p-4 text-white focus:border-gold-500 outline-none font-bold"
                                >
                                    <option value="EFECTIVO">EFECTIVO</option>
                                    <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                                    <option value="TARJETA">TARJETA</option>
                                    <option value="CONSIGNACION">CONSIGNACIÓN</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Prueba del Abono (Opcional)</label>
                                <div className="relative">
                                    <input 
                                        type="file"
                                        onChange={(e) => setPaymentForm({...paymentForm, comprobanteFile: e.target.files[0]})}
                                        className="hidden"
                                        id="comprobante-upload"
                                        accept="image/*,application/pdf"
                                    />
                                    <label 
                                        htmlFor="comprobante-upload"
                                        className="flex items-center justify-between w-full bg-military-900/50 border border-dashed border-military-700 rounded-2xl p-4 cursor-pointer hover:border-gold-500 transition-all text-xs font-bold text-military-300"
                                    >
                                        <span className="truncate max-w-[200px]">
                                            {paymentForm.comprobanteFile ? paymentForm.comprobanteFile.name : 'Seleccionar archivo...'}
                                        </span>
                                        <Upload size={16} className="text-gold-500" />
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-4 bg-military-900 text-military-400 font-bold rounded-2xl border border-military-800"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 bg-gold-gradient text-military-950 font-black rounded-2xl"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Costo Total */}
            {showEditCostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-military-950/80 backdrop-blur-sm">
                    <div className="glass w-full max-w-md p-8 rounded-[3rem] border border-military-800 shadow-2xl">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Editar Costo Total</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Nuevo Valor del Trámite</label>
                                <input 
                                    type="text" 
                                    value={formatInputValue(newCost)}
                                    onChange={(e) => setNewCost(e.target.value)}
                                    className="w-full bg-military-900 border border-military-800 rounded-2xl p-4 text-white focus:border-gold-500 outline-none font-bold"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowEditCostModal(false)}
                                    className="flex-1 py-4 bg-military-900 text-military-400 font-bold rounded-2xl border border-military-800"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleUpdateCost}
                                    className="flex-1 py-4 bg-gold-gradient text-military-950 font-black rounded-2xl"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AdvancementModal 
                isOpen={showAdvancementModal}
                onClose={() => setShowAdvancementModal(false)}
                onConfirm={confirmAvanzarPaso}
                currentStep={tramite?.roadmap?.[tramite?.pasos?.length || 0]}
                tramiteTipo={tramite?.tipo}
            />
        </div>
    );
};

const DetailItem = ({ icon, label, value, color = 'text-white' }) => (
    <div>
        <div className="flex items-center gap-2 mb-2 text-gold-500/70">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
        </div>
        <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
);

export default TramiteDetalle;
