import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { 
    Clock, 
    Calendar, 
    User, 
    Search, 
    Filter, 
    ArrowRight,
    Loader2,
    FileText,
    ChevronRight,
    Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const HistorialGeneral = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await api.tramites.getHistory();
            setHistory(data);
        } catch (error) {
            toast.error('Error al cargar el historial global');
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item => 
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tramite?.cliente?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tramite?.cliente?.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
            <p className="text-military-400 font-bold uppercase tracking-widest text-xs">Cargando bitácora maestra...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="text-gold-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1 italic">Auditoría de Procesos</p>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                        <Clock className="text-gold-500" size={32} />
                        Historial General
                    </h1>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-military-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente o acción..."
                        className="w-full bg-military-900/50 border border-military-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-military-600 outline-none focus:border-gold-500/50 transition-all font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Summary (Mini) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Acciones" value={history.length} icon={<Clock size={14}/>} />
                <StatCard label="Acciones Hoy" value={history.filter(h => new Date(h.fechaAccion).toDateString() === new Date().toDateString()).length} icon={<Calendar size={14}/>} />
            </div>

            {/* Timeline */}
            <div className="glass p-8 rounded-[3rem] border border-military-100/10">
                <div className="relative pl-8 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-military-800">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((item, idx) => (
                            <div key={item.id} className="relative group">
                                {/* Dot */}
                                <div className={`absolute -left-[26px] top-4 w-4 h-4 rounded-full border-2 border-military-950 transition-all duration-300 ${idx === 0 ? 'bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-military-700 group-hover:bg-military-500'}`} />
                                
                                {/* Card */}
                                <div className="bg-military-950/40 hover:bg-military-900 border border-military-900 hover:border-military-800 p-6 rounded-[2.5rem] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer" onClick={() => navigate(`/tramites/${item.tramiteId}`)}>
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 bg-military-900 rounded-2xl flex items-center justify-center text-gold-500 shrink-0">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-1 italic">
                                                {item.tramite?.tipo} • {item.tramite?.cliente?.nombres} {item.tramite?.cliente?.apellidos}
                                            </p>
                                            <p className="text-white font-bold leading-tight group-hover:text-gold-500 transition-colors uppercase tracking-tight">
                                                {item.descripcion}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-military-800 rounded-lg text-[9px] font-black text-military-400 uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={10} /> {new Date(item.fechaAccion).toLocaleDateString('es-CO')}
                                            </span>
                                            <span className="px-3 py-1 bg-military-800 rounded-lg text-[9px] font-black text-military-400 uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={10} /> {new Date(item.fechaAccion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User size={10} className="text-military-600" />
                                            <p className="text-[9px] text-military-600 font-black uppercase tracking-widest">{item.realizadoPor || 'SISTEMA'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        <ChevronRight size={20} className="text-gold-500" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <Clock className="mx-auto text-military-800 mb-4" size={48} />
                            <p className="text-military-600 font-bold uppercase tracking-widest">No se encontraron movimientos registrados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon }) => (
    <div className="bg-military-900/30 border border-military-800 p-4 rounded-2xl flex items-center justify-between">
        <div>
            <p className="text-[8px] font-black text-military-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-lg font-black text-white">{value}</p>
        </div>
        <div className="text-gold-500/50">
            {icon}
        </div>
    </div>
);

export default HistorialGeneral;
