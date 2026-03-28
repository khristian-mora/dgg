import React, { useState, useEffect } from 'react';
import { 
    User, FileText, ShieldCheck, History, 
    Upload, Info, CheckCircle2, Circle, 
    ArrowRight, Clock, MapPin, Phone, Mail,
    Download, AlertCircle, FileStack, Shield
} from 'lucide-react';
import { api, getResourceUrl } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ClienteDashboard = () => {
    const { user } = useAuth();
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);

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
                 <p className="text-military-400 max-w-sm">Tu cuenta de usuario no está vinculada a un registro de cliente. Contacta a soporte para habilitar tu acceso.</p>
             </div>
        </div>
    );

    const activeTramite = cliente.tramites?.find(t => t.estado !== 'FINALIZADO' && t.estado !== 'RECHAZADO');

    return (
        <div className="min-h-screen bg-military-950 text-white pb-20">
            {/* Header / Banner */}
            <div className="relative h-64 bg-military-900 overflow-hidden">
                <div className="absolute inset-0 bg-gold-gradient opacity-10 blur-3xl animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-military-950 to-transparent" />
                
                <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-10 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-military-900 border-4 border-military-800 flex items-center justify-center text-4xl font-black shadow-2xl overflow-hidden text-military-300">
                            {cliente.foto ? <img src={getResourceUrl(cliente.foto)} className="w-full h-full object-cover" /> : cliente.nombres.charAt(0)}
                        </div>
                        <div className="space-y-2">
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Hola, {cliente.nombres}</h1>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    cliente.estado === 'ACTIVO' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-gold-500/10 text-gold-500 border-gold-500/30'
                                }`}>
                                    {cliente.estado}
                                </span>
                             </div>
                             <p className="text-military-400 font-bold uppercase text-[10px] tracking-[0.3em]">Portal del Ciudadano DCCAE • GestorArmas Pro</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Contenido Principal */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Estado del Trámite */}
                        <div className="glass p-8 rounded-[2.5rem] border border-military-100/10 bg-military-900/40">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                    <Clock className="text-gold-500" size={24} />
                                    Tu Trámite Activo
                                </h3>
                                {activeTramite && (
                                    <span className="px-3 py-1 bg-gold-500 text-military-950 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none">
                                        PRIORIDAD ALTA
                                    </span>
                                )}
                            </div>

                            {activeTramite ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-military-950/50 rounded-3xl border border-military-800 gap-6">
                                        <div>
                                            <p className="text-2xl font-black text-white italic uppercase tracking-tighter">{activeTramite.tipo}</p>
                                            <p className="text-xs font-bold text-military-500 uppercase tracking-[0.2em] mt-1">Radicado: {activeTramite.id.slice(-8)}</p>
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-3">Progreso del Expediente</p>
                                            <div className="w-full sm:w-56 h-3 bg-military-950 rounded-full overflow-hidden border border-military-800 p-0.5">
                                                <div className="h-full bg-gold-gradient rounded-full w-[65%] shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
                                            </div>
                                            <p className="text-[10px] font-black text-gold-500 mt-3 uppercase tracking-widest">Fase: Documentación • 65%</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <StatusStep label="Registro Inicial" status="COMPLETO" />
                                        <StatusStep label="Carga de Requisitos" status="EN_PROCESO" />
                                        <StatusStep label="Cita DCCAE" status="CONGELADO" />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-16 text-center space-y-4 border-2 border-dashed border-military-800 rounded-3xl">
                                    <FileStack size={48} className="text-military-800 mx-auto" />
                                    <p className="text-military-500 font-bold uppercase text-xs tracking-widest">No tienes trámites activos en este momento</p>
                                    <button className="gold-gradient px-8 py-3 rounded-2xl text-military-950 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Explorar Servicios</button>
                                </div>
                            )}
                        </div>

                        {/* Documentos */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <FileText className="text-gold-500" size={24} />
                                Lista de Requisitos Pendientes
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DocCheckItem label="Cédula de Ciudadanía" status="VERIFICADO" />
                                <DocCheckItem label="Certificado Psicomédico ACE" status="EN_REVISION" />
                                <DocCheckItem label="Diploma Curso de Tiro" status="CARGADO" />
                                <DocCheckItem label="Antecedentes Judiciales" status="PENDIENTE" />
                            </div>
                        </div>

                         {/* Armas */}
                         <div className="space-y-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <Shield className="text-gold-500" size={24} />
                                Mis Armas Vinculadas
                            </h3>
                            {cliente.armas?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cliente.armas.map(a => (
                                        <div key={a.id} className="glass p-6 rounded-3xl border border-military-100/5 flex items-center justify-between">
                                            <div>
                                                <p className="font-black text-white uppercase tracking-tighter text-lg">{a.marca} {a.modelo}</p>
                                                <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest">{a.claseArma} • {a.numeroSerie}</p>
                                            </div>
                                            <ShieldCheck size={24} className="text-military-700" />
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

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Info Personal */}
                        <div className="glass p-8 rounded-[3rem] border border-military-100/10 bg-military-900/60">
                            <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-6">Información del Ciudadano</h4>
                            <div className="space-y-6">
                                <InfoLine icon={<User size={16}/>} label="ID Ciudadano" value={cliente.cedula} />
                                <InfoLine icon={<Phone size={16}/>} label="Número Celular" value={cliente.telefono} />
                                <InfoLine icon={<Mail size={16}/>} label="Correo Personal" value={cliente.correoElectronico} />
                                <InfoLine icon={<MapPin size={16}/>} label="Lugar de Residencia" value={cliente.ciudad} />
                            </div>
                            <button className="w-full mt-10 py-4 bg-military-950 border border-military-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-military-400 hover:text-white hover:border-military-700 transition-all">
                                SOLICITAR CAMBIO DE DATOS
                            </button>
                        </div>

                        {/* WhatsApp Soporte */}
                        <div className="glass p-10 rounded-[3rem] bg-gold-gradient text-military-950 shadow-[0_20px_40px_rgba(234,179,8,0.2)]">
                             <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">¿Necesitas Ayuda?</h4>
                             <p className="text-[10px] font-bold uppercase opacity-70 mb-8 leading-relaxed">Tu asesor asignado está listo para resolver cualquier duda sobre tu trámite.</p>
                             <button className="w-full py-5 bg-military-950 text-white rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.03] active:scale-95 transition-all">
                                 <Phone size={18} /> Hablar por WhatsApp
                             </button>
                        </div>

                        {/* Alerta de Seguridad */}
                        <div className="p-8 rounded-[3rem] border border-gold-500/10 bg-military-950/40">
                             <div className="flex items-center gap-3 text-gold-500/50 mb-4">
                                <ShieldCheck size={24} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Protección de Datos</h4>
                             </div>
                             <p className="text-[10px] text-military-600 font-bold leading-relaxed">
                                 Información cifrada bajo los estándares de seguridad DCCAE para tu tranquilidad y cumplimiento legal.
                             </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

const StatusStep = ({ label, status }) => (
    <div className={`flex flex-col items-center text-center p-5 rounded-3xl border transition-all ${
        status === 'COMPLETO' ? 'bg-green-500/5 border-green-500/20' :
        status === 'EN_PROCESO' ? 'bg-gold-500/5 border-gold-500/20' :
        'bg-military-950/40 border-military-800'
    }`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
            status === 'COMPLETO' ? 'bg-green-500/20 text-green-500' :
            status === 'EN_PROCESO' ? 'bg-gold-500/20 text-gold-500 animate-pulse' :
            'bg-military-800 text-military-600'
        }`}>
            {status === 'COMPLETO' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </div>
        <p className={`text-[9px] font-black uppercase tracking-widest ${
            status === 'COMPLETO' ? 'text-green-500' :
            status === 'EN_PROCESO' ? 'text-gold-500' :
            'text-military-500'
        }`}>{label}</p>
    </div>
);

const DocCheckItem = ({ label, status }) => (
    <div className="flex items-center justify-between p-5 bg-military-900/60 rounded-[1.5rem] border border-military-100/5 hover:border-gold-500/20 transition-all">
        <div className="flex items-center gap-4">
             <div className={`p-2.5 rounded-xl ${
                 status === 'VERIFICADO' ? 'text-green-500 bg-green-500/10' :
                 status === 'PENDIENTE' ? 'text-military-700 bg-military-950' :
                 'text-gold-500 bg-gold-500/10'
             }`}>
                 {status === 'VERIFICADO' ? <CheckCircle2 size={20} /> : 
                  status === 'PENDIENTE' ? <Circle size={20} /> : 
                  <Upload size={20} />}
             </div>
             <p className="text-xs font-bold text-white tracking-tight">{label}</p>
        </div>
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${
            status === 'VERIFICADO' ? 'text-green-500' : 
            status === 'PENDIENTE' ? 'text-military-600' : 
            'text-gold-500'
        }`}>
            {status}
        </span>
    </div>
);

const InfoLine = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="text-gold-500/70 mt-1">{icon}</div>
        <div className="space-y-1">
            <p className="text-[8px] font-black text-military-600 uppercase tracking-[0.25em]">{label}</p>
            <p className="text-sm font-bold text-military-100">{value || 'No registrada'}</p>
        </div>
    </div>
);

export default ClienteDashboard;
