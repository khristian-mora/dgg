import React, { useState, useEffect } from 'react'
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
    Info
} from 'lucide-react'
import { api } from '../api/api'
import toast from 'react-hot-toast'

const TramiteDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tramite, setTramite] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTramite();
    }, [id]);

    const fetchTramite = async () => {
        try {
            setLoading(true);
            const data = await api.tramites.getById(id);
            setTramite(data);
        } catch (error) {
            console.error('Error fetching tramite:', error);
            toast.error('No se pudo cargar la información del trámite');
        } finally {
            setLoading(false);
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
                <button onClick={() => navigate(-1)} className="p-3 bg-military-900 rounded-2xl text-military-400 hover:text-white transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <p className="text-gold-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Expediente de Trámite</p>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{tramite.tipo}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
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

                        <div className="mt-10 p-6 bg-military-900/50 rounded-3xl border border-military-800">
                            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-3">Observaciones del Analista</p>
                            <p className="text-sm text-military-200 leading-relaxed">{tramite.observaciones || 'Sin observaciones adicionales registradas.'}</p>
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
                </div>

                {/* Sidebar - Finanzas */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-[2.5rem] bg-gold-gradient text-military-950">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                            <DollarSign size={20} /> Control de Pagos
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-military-950/10 pb-3">
                                <p className="text-[10px] font-bold uppercase opacity-70">Valor Acuerdo</p>
                                <p className="text-xl font-black">${(tramite.valorAcuerdo || 0).toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-military-950/10 pb-3">
                                <p className="text-[10px] font-bold uppercase opacity-70">Abonos</p>
                                <p className="text-xl font-black text-green-900">${(tramite.abono || 0).toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <p className="text-[10px] font-bold uppercase opacity-70">Saldo Pendiente</p>
                                <p className={`text-2xl font-black ${(tramite.saldo || 0) > 0 ? 'text-red-800' : 'text-military-950'}`}>${(tramite.saldo || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] border border-military-800 text-center">
                        <Shield className="mx-auto text-gold-500 mb-4" size={32} />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">Seguridad DCCAE</h4>
                        <p className="text-[10px] text-military-500 font-bold uppercase tracking-tight">Este trámite cumple con los protocolos vigentes de la Ley de Armas.</p>
                    </div>
                </div>
            </div>
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
