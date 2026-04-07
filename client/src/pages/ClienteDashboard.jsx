import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User, FileText, ShieldCheck, Shield,
    Upload, CheckCircle2, Circle, Clock,
    MapPin, Phone, Mail, Download,
    AlertCircle, FileStack, X, Lock,
    ChevronRight, LogOut, Loader2, Info,
    ArrowRight, CalendarCheck
} from 'lucide-react';
import { api, getResourceUrl } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { REQUISITOS_OFICIALES } from '../config/tramiteConfig';
import { formatCurrency } from '../utils/formatters';

// ─── Roadmap local (espejo del server) ─────────────────────────
const ROADMAPS = {
  'Permiso para Porte': ['Inicio','Documentación','Psicofísico','Curso Manejo','Radicación DCCAE','Biometría','Comité','Entrega'],
  'Permiso para Tenencia': ['Inicio','Inspección','Documentación','Plataforma','Aprobación','Entrega'],
  'Adquisición de Armas': ['Solicitud','Documentación','Liquidación','Cita DCCAE','Entrega Arma'],
  'Revalidación de Salvoconducto': ['Inicio','Requisitos','Entrega Fisico','Procesamiento','Nuevo Carnet'],
  'Cesión de Armas': ['Solicitud','Peritaje','Poderes','Traspaso','Finalizado'],
  'Compra de Munición': ['Solicitud','Verificación','Pago','Entrega'],
  'Permiso Nacional': ['Solicitud','Justificación','Comité Central','Resolución'],
  'Permiso Regional': ['Solicitud','Justificación','Comité Regional','Resolución'],
  'Cambio de Correo': ['Solicitud','Validación','Actualización'],
  'Usuarios Bloqueados': ['Análisis','Descargo','Radicación','Respuesta'],
  'Otros Trámites': ['Inicio','Análisis','Gestión'],
  'DEFAULT': ['Inicio','Proceso','Finalizado'],
};

// ─── Sub-componentes ────────────────────────────────────────────

const StatusStep = ({ label, isCompleted, isCurrent, index }) => (
    <div className={`flex flex-col items-center text-center p-4 rounded-3xl border transition-all ${
        isCompleted ? 'bg-green-500/5 border-green-500/20' :
        isCurrent   ? 'bg-gold-500/5 border-gold-500/30' :
        'bg-military-950/40 border-military-800'
    }`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 text-xs font-black ${
            isCompleted ? 'bg-green-500/20 text-green-500' :
            isCurrent   ? 'bg-gold-500/20 text-gold-500 animate-pulse' :
            'bg-military-800 text-military-600'
        }`}>
            {isCompleted ? <CheckCircle2 size={18} /> : <span>{index + 1}</span>}
        </div>
        <p className={`text-[9px] font-black uppercase tracking-widest leading-tight ${
            isCompleted ? 'text-green-500' :
            isCurrent   ? 'text-gold-500' :
            'text-military-600'
        }`}>{label}</p>
    </div>
);

const DocCheckItem = ({ label, status }) => {
    const s = status?.toUpperCase();
    return (
        <div className="flex items-center justify-between p-5 bg-military-900/60 rounded-[1.5rem] border border-military-100/5 hover:border-gold-500/20 transition-all">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                    s === 'VERIFICADO' ? 'text-green-500 bg-green-500/10' :
                    s === 'CARGADO'    ? 'text-blue-400 bg-blue-500/10' :
                    'text-military-700 bg-military-950'
                }`}>
                    {s === 'VERIFICADO' ? <CheckCircle2 size={18} /> :
                     s === 'CARGADO'    ? <Upload size={18} /> :
                     <Circle size={18} />}
                </div>
                <p className="text-xs font-bold text-white tracking-tight">{label}</p>
            </div>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${
                s === 'VERIFICADO' ? 'text-green-500' :
                s === 'CARGADO'    ? 'text-blue-400' :
                'text-military-600'
            }`}>
                {s === 'VERIFICADO' ? 'Verificado' : s === 'CARGADO' ? 'En revisión' : 'Pendiente'}
            </span>
        </div>
    );
};

const InfoLine = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="text-gold-500/70 mt-1">{icon}</div>
        <div className="space-y-1">
            <p className="text-[8px] font-black text-military-600 uppercase tracking-[0.25em]">{label}</p>
            <p className="text-sm font-bold text-military-100">{value || 'No registrada'}</p>
        </div>
    </div>
);

// ─── Componente Principal ───────────────────────────────────────

const ClienteDashboard = () => {
    const { user, logout } = useAuth();
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(null); // reqId en proceso

    useEffect(() => {
        if (user?.clienteId) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.clientes.getById(user.clienteId);
            setCliente(data);
        } catch (error) {
            console.error('Error fetching client data:', error);
            toast.error('No se pudo cargar tu información');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const newPass = e.target.newPassword.value;
        const confirmPass = e.target.confirmPassword.value;
        if (newPass !== confirmPass) return toast.error('Las contraseñas no coinciden');
        if (newPass.length < 6) return toast.error('Mínimo 6 caracteres');
        setChangingPassword(true);
        try {
            await api.users.updatePassword({ password: newPass });
            toast.success('Contraseña actualizada correctamente');
            setShowPasswordModal(false);
            e.target.reset();
        } catch {
            toast.error('Error al cambiar la contraseña');
        } finally {
            setChangingPassword(false);
        }
    };

    // Subida de documento desde el portal del cliente
    const handleDocUpload = async (file, reqId, reqLabel) => {
        if (!file || !activeTramite) return;
        try {
            setUploadingDoc(reqId);
            const formData = new FormData();
            formData.append('archivo', file);
            formData.append('clienteId', cliente.id);
            formData.append('tramiteId', activeTramite.id);
            formData.append('tipo', reqId);
            formData.append('titulo', `${reqLabel} - ${cliente.nombres}`);
            await api.documentos.upload(formData);
            toast.success(`Documento "${reqLabel}" enviado. Será revisado por tu asesor.`);
            fetchData();
        } catch {
            toast.error('Error al subir el documento');
        } finally {
            setUploadingDoc(null);
        }
    };

    // ── Loading & Error states ──────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-military-950 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-4" />
            <p className="text-military-400 font-bold uppercase tracking-widest text-xs">Accediendo a tu Portal...</p>
        </div>
    );

    if (!cliente) return (
        <div className="min-h-screen bg-military-950 p-10 flex items-center justify-center">
            <div className="text-center space-y-4">
                <AlertCircle size={64} className="text-gold-500 mx-auto" />
                <h1 className="text-2xl font-black text-white uppercase">Portal no Vinculado</h1>
                <p className="text-military-400 max-w-sm">Tu cuenta no está vinculada a un registro de cliente. Contacta a soporte para habilitar tu acceso.</p>
            </div>
        </div>
    );

    // ── Datos derivados reales ──────────────────────────────────
    const activeTramite = cliente.tramites?.find(t => t.estado !== 'FINALIZADO' && t.estado !== 'RECHAZADO');

    // Roadmap real del trámite activo
    const roadmapSteps = activeTramite
        ? (ROADMAPS[activeTramite.tipo] || ROADMAPS['DEFAULT'])
        : [];
    const pasosCompletados = activeTramite?.pasos?.length || 0;
    const progreso = activeTramite?.progreso || Math.min(Math.round((pasosCompletados / (roadmapSteps.length || 3)) * 100), 100);

    // Checklist de documentos real: requisitos del tipo de trámite vs los documentos subidos
    const requisitos = activeTramite
        ? (REQUISITOS_OFICIALES[activeTramite.tipo] || REQUISITOS_OFICIALES['Otros Trámites'])
        : [];

    const tramiteDocumentos = activeTramite?.documentos || cliente.documentos || [];

    const checklistConEstado = requisitos.map(req => {
        const docEncontrado = tramiteDocumentos.find(d =>
            d.tipo?.toLowerCase() === req.id?.toLowerCase() ||
            d.titulo?.toLowerCase().includes(req.id?.toLowerCase())
        );
        const status = docEncontrado
            ? (docEncontrado.verificado ? 'VERIFICADO' : 'CARGADO')
            : 'PENDIENTE';
        return { ...req, status, doc: docEncontrado };
    });

    const docsVerificados = checklistConEstado.filter(r => r.status === 'VERIFICADO').length;
    const docsCargados    = checklistConEstado.filter(r => r.status === 'CARGADO').length;

    // Número WhatsApp real
    const waPhone = cliente.telefono?.replace(/\D/g, '');
    const waUrl = waPhone
        ? `https://wa.me/${waPhone.startsWith('57') ? waPhone : '57' + waPhone}?text=${encodeURIComponent(`Hola, soy ${cliente.nombres} ${cliente.apellidos}, quiero consultar el estado de mi trámite ${activeTramite?.tipo || ''}.`)}`
        : null;

    return (
        <div className="min-h-screen bg-military-950 text-white pb-20">

            {/* ── Modal Cambiar Contraseña ─────────────── */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-military-900 border border-military-800 rounded-[2rem] p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-military-500 hover:text-white">
                            <X size={24} />
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="text-gold-500" size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white">Cambiar Contraseña</h2>
                            <p className="text-military-400 text-sm mt-2">Ingresa tu nueva contraseña de acceso</p>
                        </div>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-military-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                <input name="newPassword" type="password" placeholder="Mínimo 6 caracteres"
                                    className="w-full px-4 py-4 bg-military-950 border border-military-800 rounded-2xl focus:outline-none focus:border-gold-500/50 text-white font-bold mt-1" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-military-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                                <input name="confirmPassword" type="password" placeholder="Repite la contraseña"
                                    className="w-full px-4 py-4 bg-military-950 border border-military-800 rounded-2xl focus:outline-none focus:border-gold-500/50 text-white font-bold mt-1" required />
                            </div>
                            <button type="submit" disabled={changingPassword}
                                className="w-full py-4 gold-gradient text-military-950 font-black rounded-2xl hover:brightness-110 transition-all disabled:opacity-50">
                                {changingPassword ? 'Cambiando...' : 'CAMBIAR CONTRASEÑA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Header / Banner ──────────────────────── */}
            <div className="relative h-64 bg-military-900 overflow-hidden">
                <div className="absolute inset-0 bg-gold-gradient opacity-10 blur-3xl animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-military-950 to-transparent" />

                {/* Nav top bar */}
                <div className="absolute top-4 right-6 flex items-center gap-3 z-10">
                    <button onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-military-900/80 border border-military-700 rounded-xl text-xs font-bold text-military-300 hover:text-white transition-colors">
                        <Lock size={14} /> Cambiar clave
                    </button>
                    <button onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all">
                        <LogOut size={14} /> Salir
                    </button>
                </div>

                <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-10 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-military-900 border-4 border-military-800 flex items-center justify-center text-4xl font-black shadow-2xl overflow-hidden text-military-300">
                            {cliente.foto ? <img src={getResourceUrl(cliente.foto)} className="w-full h-full object-cover" alt="foto" /> : cliente.nombres?.charAt(0)}
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Hola, {cliente.nombres}</h1>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    cliente.estado === 'ACTIVO'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                                        : 'bg-gold-500/10 text-gold-500 border-gold-500/30'
                                }`}>{cliente.estado}</span>
                            </div>
                            <p className="text-military-400 font-bold uppercase text-[10px] tracking-[0.3em]">Portal del Ciudadano DCCAE • DGG Gestión de Armas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main content ──────────────────────────── */}
            <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Columna izquierda (2/3) ─────────── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* TRÁMITE ACTIVO ─────────────────── */}
                        <div className="glass p-8 rounded-[2.5rem] border border-military-100/10 bg-military-900/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                    <Clock className="text-gold-500" size={24} />
                                    Tu Trámite Activo
                                </h3>
                                {activeTramite && (
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                        activeTramite.esUrgente
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gold-500/10 text-gold-500 border border-gold-500/30'
                                    }`}>
                                        {activeTramite.esUrgente ? '⚡ URGENTE' : activeTramite.estado}
                                    </span>
                                )}
                            </div>

                            {activeTramite ? (
                                <div className="space-y-6">
                                    {/* Info del trámite */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-military-950/50 rounded-3xl border border-military-800 gap-6">
                                        <div>
                                            <p className="text-2xl font-black text-white italic uppercase tracking-tighter">{activeTramite.tipo}</p>
                                            <p className="text-xs font-bold text-military-500 uppercase tracking-[0.2em] mt-1">Radicado: #{activeTramite.id.slice(-8).toUpperCase()}</p>
                                            <p className="text-xs font-bold text-military-600 mt-1">
                                                Inicio: {new Date(activeTramite.fechaInicio || activeTramite.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-3">Progreso del Expediente</p>
                                            <div className="w-full sm:w-56 h-3 bg-military-950 rounded-full overflow-hidden border border-military-800 p-0.5">
                                                <div
                                                    className="h-full bg-gold-gradient rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all duration-700"
                                                    style={{ width: `${progreso}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] font-black text-gold-500 mt-3 uppercase tracking-widest">
                                                Paso {pasosCompletados} de {roadmapSteps.length} • {progreso}%
                                            </p>
                                            <Link 
                                                to={`/tramites/${activeTramite.id}`}
                                                className="mt-4 inline-flex items-center gap-2 text-[10px] font-black text-white hover:text-gold-500 uppercase tracking-widest transition-colors group/btn"
                                            >
                                                Ver Expediente Completo <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Roadmap real — máximo 6 pasos visibles */}
                                    <div className={`grid gap-3 ${roadmapSteps.length <= 4 ? 'grid-cols-4' : roadmapSteps.length <= 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-4 sm:grid-cols-8'}`}>
                                        {roadmapSteps.map((label, i) => (
                                            <StatusStep
                                                key={i}
                                                index={i}
                                                label={label}
                                                isCompleted={i < pasosCompletados}
                                                isCurrent={i === pasosCompletados}
                                            />
                                        ))}
                                    </div>

                                    {/* Último paso registrado */}
                                    {activeTramite.pasos?.length > 0 && (
                                        <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                                            <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Última actualización</p>
                                                <p className="text-xs text-military-300 mt-1">
                                                    {activeTramite.pasos[activeTramite.pasos.length - 1]?.descripcion}
                                                </p>
                                                <p className="text-[10px] text-military-600 mt-1">
                                                    {new Date(activeTramite.pasos[activeTramite.pasos.length - 1]?.fechaAccion).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Estado financiero si hay valor de acuerdo */}
                                    {activeTramite.valorAcuerdo > 0 && (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-military-950/50 rounded-2xl border border-military-800 text-center">
                                                <p className="text-[9px] font-black text-military-500 uppercase tracking-widest mb-1">Valor Total</p>
                                                <p className="text-sm font-black text-white">
                                                    {formatCurrency(activeTramite.valorAcuerdo)}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/20 text-center">
                                                <p className="text-[9px] font-black text-military-500 uppercase tracking-widest mb-1">Pagado</p>
                                                <p className="text-sm font-black text-green-400">
                                                    {formatCurrency(activeTramite.abonoTotal || 0)}
                                                </p>
                                            </div>
                                            <div className={`p-4 rounded-2xl border text-center ${activeTramite.pazYSalvo ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                                <p className="text-[9px] font-black text-military-500 uppercase tracking-widest mb-1">Saldo</p>
                                                <p className={`text-sm font-black ${activeTramite.pazYSalvo ? 'text-green-400' : 'text-red-400'}`}>
                                                    {activeTramite.pazYSalvo
                                                        ? '✓ Paz y Salvo'
                                                        : formatCurrency(activeTramite.saldoPendiente || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-16 text-center space-y-4 border-2 border-dashed border-military-800 rounded-3xl">
                                    <FileStack size={48} className="text-military-800 mx-auto" />
                                    <p className="text-military-500 font-bold uppercase text-xs tracking-widest">No tienes trámites activos en este momento</p>
                                    <p className="text-military-700 text-xs">Contacta con tu asesor para iniciar un nuevo trámite</p>
                                </div>
                            )}
                        </div>

                        {/* DOCUMENTOS REQUERIDOS ────────────── */}
                        {activeTramite && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                        <FileText className="text-gold-500" size={24} />
                                        Requisitos del Trámite
                                    </h3>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-military-400 uppercase">
                                            {docsVerificados + docsCargados}/{checklistConEstado.length} entregados
                                        </span>
                                        <div className="w-32 h-1.5 bg-military-800 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className="h-full bg-gold-gradient rounded-full"
                                                style={{ width: `${Math.round(((docsVerificados + docsCargados) / (checklistConEstado.length || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {checklistConEstado.map(req => (
                                        <div key={req.id} className="flex items-center justify-between p-5 bg-military-900/60 rounded-[1.5rem] border border-military-100/5 hover:border-gold-500/20 transition-all group">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className={`p-2.5 rounded-xl shrink-0 ${
                                                    req.status === 'VERIFICADO' ? 'text-green-500 bg-green-500/10' :
                                                    req.status === 'CARGADO'    ? 'text-blue-400 bg-blue-500/10' :
                                                    'text-military-700 bg-military-950'
                                                }`}>
                                                    {req.status === 'VERIFICADO' ? <CheckCircle2 size={18}/> :
                                                     req.status === 'CARGADO'    ? <Upload size={18}/> :
                                                     <Circle size={18}/>}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{req.label}</p>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${
                                                        req.status === 'VERIFICADO' ? 'text-green-500' :
                                                        req.status === 'CARGADO'    ? 'text-blue-400' :
                                                        'text-military-600'
                                                    }`}>
                                                        {req.status === 'VERIFICADO' ? '✓ Verificado' :
                                                         req.status === 'CARGADO'    ? 'En revisión' :
                                                         'Pendiente de entrega'}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Botón subir si está pendiente */}
                                            {req.status === 'PENDIENTE' && (
                                                <label className="shrink-0 ml-2 cursor-pointer p-2 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-500 hover:bg-gold-500 hover:text-military-950 transition-all">
                                                    {uploadingDoc === req.id
                                                        ? <Loader2 size={16} className="animate-spin"/>
                                                        : <Upload size={16}/>}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                        disabled={!!uploadingDoc}
                                                        onChange={e => {
                                                            if (e.target.files[0]) handleDocUpload(e.target.files[0], req.id, req.label);
                                                        }}
                                                    />
                                                </label>
                                            )}
                                            {/* Botón ver si está cargado */}
                                            {req.doc?.url && (
                                                <button
                                                    onClick={() => window.open(getResourceUrl(req.doc.url), '_blank')}
                                                    className="shrink-0 ml-2 p-2 bg-military-800 rounded-xl text-military-400 hover:text-white transition-colors"
                                                    title="Ver documento"
                                                >
                                                    <Download size={16}/>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {docsVerificados === checklistConEstado.length && checklistConEstado.length > 0 && (
                                    <div className="p-6 bg-green-500/5 border border-green-500/30 rounded-2xl flex items-center gap-4">
                                        <ShieldCheck size={32} className="text-green-500 shrink-0" />
                                        <div>
                                            <p className="font-black text-green-400 uppercase tracking-wider text-sm">¡Expediente Completo!</p>
                                            <p className="text-xs text-military-400 mt-1">Todos tus documentos han sido verificados. Tu asesor continuará con el siguiente paso.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ARMAS VINCULADAS ─────────────────── */}
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <Shield className="text-gold-500" size={24} />
                                Mis Armas Vinculadas
                                <span className="text-sm font-bold text-military-500 ml-2">({cliente.armas?.length || 0})</span>
                            </h3>
                            {cliente.armas?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cliente.armas.map(a => (
                                        <div key={a.id} className="glass p-6 rounded-3xl border border-military-100/5 hover:border-gold-500/30 transition-all">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="font-black text-white uppercase tracking-tighter text-lg">{a.marca} {a.modelo}</p>
                                                    <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest mt-1">{a.claseArma}</p>
                                                </div>
                                                <ShieldCheck size={24} className="text-military-600" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="p-3 bg-military-950/50 rounded-xl">
                                                    <p className="text-[8px] font-black text-military-600 uppercase">Serie</p>
                                                    <p className="text-xs font-bold text-white mt-0.5">{a.numeroSerie || 'N/A'}</p>
                                                </div>
                                                <div className="p-3 bg-military-950/50 rounded-xl">
                                                    <p className="text-[8px] font-black text-military-600 uppercase">Calibre</p>
                                                    <p className="text-xs font-bold text-white mt-0.5">{a.calibre || 'N/A'}</p>
                                                </div>
                                            </div>
                                            {a.tipoPermiso && (
                                                <div className="mt-3 px-3 py-1.5 bg-gold-500/10 rounded-lg inline-block">
                                                    <p className="text-[9px] font-black text-gold-500 uppercase">{a.tipoPermiso}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 bg-military-900/40 rounded-[2.5rem] border border-military-800 text-center">
                                    <p className="text-military-600 font-bold uppercase text-[10px] tracking-widest">No hay equipos registrados bajo tu nombre</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar (1/3) ────────────────────── */}
                    <div className="space-y-8">

                        {/* INFO PERSONAL REAL ─────────────── */}
                        <div className="glass p-8 rounded-[3rem] border border-military-100/10 bg-military-900/60 animate-in fade-in duration-500">
                            <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-6">Información del Ciudadano</h4>
                            <div className="space-y-6">
                                <InfoLine icon={<User size={16}/>}   label="Cédula"          value={cliente.cedula} />
                                <InfoLine icon={<Phone size={16}/>}  label="Teléfono"        value={cliente.telefono} />
                                <InfoLine icon={<Mail size={16}/>}   label="Correo Personal" value={cliente.correoElectronico} />
                                <InfoLine icon={<MapPin size={16}/>} label="Ciudad"          value={`${cliente.ciudad || ''}${cliente.departamento ? ', ' + cliente.departamento : ''}`} />
                            </div>
                        </div>

                        {/* HISTORIAL DE TRÁMITES ──────────── */}
                        {cliente.tramites?.length > 1 && (
                            <div className="glass p-6 rounded-[2.5rem] border border-military-100/10">
                                <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-4">Historial de Trámites</h4>
                                <div className="space-y-3">
                                    {cliente.tramites.slice(0, 4).map(t => (
                                        <Link 
                                            key={t.id} 
                                            to={`/tramites/${t.id}`}
                                            className="flex items-center justify-between p-3 bg-military-950/50 rounded-2xl hover:bg-military-800 transition-all border border-transparent hover:border-gold-500/20 group"
                                        >
                                            <div>
                                                <p className="text-xs font-bold text-white truncate max-w-[140px]">{t.tipo}</p>
                                                <p className="text-[9px] text-military-500 uppercase">{new Date(t.createdAt).toLocaleDateString('es-CO')}</p>
                                            </div>
                                            <span className={`text-[8px] px-2 py-1 rounded-lg font-black uppercase ${
                                                t.estado === 'FINALIZADO' ? 'bg-green-500/10 text-green-500' :
                                                t.estado === 'RECHAZADO'  ? 'bg-red-500/10 text-red-500' :
                                                'bg-gold-500/10 text-gold-500'
                                            }`}>{t.estado}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* WHATSAPP SOPORTE ───────────────── */}
                        <div className="glass p-10 rounded-[3rem] bg-gold-gradient text-military-950 shadow-[0_20px_40px_rgba(234,179,8,0.2)] animate-in fade-in duration-700">
                            <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">¿Necesitas Ayuda?</h4>
                            <p className="text-[10px] font-bold uppercase opacity-70 mb-8 leading-relaxed">
                                Tu asesor está listo para resolver cualquier duda sobre tu trámite. Escríbenos por WhatsApp ahora.
                            </p>
                            {waUrl ? (
                                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                                    className="w-full py-5 bg-military-950 text-white rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.03] active:scale-95 transition-all">
                                    <Phone size={18} /> Hablar por WhatsApp
                                </a>
                            ) : (
                                <div className="w-full py-5 bg-military-950/50 text-military-500 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest">
                                    <Phone size={18} /> Sin teléfono registrado
                                </div>
                            )}
                        </div>

                        {/* SEGURIDAD ──────────────────────── */}
                        <div className="p-8 rounded-[3rem] border border-gold-500/10 bg-military-950/40">
                            <div className="flex items-center gap-3 text-gold-500/50 mb-4">
                                <ShieldCheck size={24} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Protección de Datos</h4>
                            </div>
                            <p className="text-[10px] text-military-600 font-bold leading-relaxed">
                                Tu información está cifrada bajo los estándares DCCAE para tu tranquilidad y cumplimiento legal.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClienteDashboard;
