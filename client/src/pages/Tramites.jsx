import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, History, CheckCircle2, Clock, AlertCircle, User, FileText, ChevronRight, DollarSign, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'
import toast from 'react-hot-toast'

const Tramites = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filter, setFilter] = useState('EN_PROCESO');
    const [tramites, setTramites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState({
        clienteId: '',
        tipo: 'Permiso para Porte',
        valorAcuerdo: '',
        abono: '',
        esUrgente: false,
        observaciones: ''
    });

    const fetchClientes = async () => {
        try {
            const data = await api.users.getAll();
            setClientes(data.filter(u => u.rol === 'CLIENTE'));
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const requisitosOficiales = {
        'Permiso para Porte': ['Cédula original', 'Certificado Psicomédico ACE', 'Curso de Tiro', 'Certificado Laboral', 'Extractos 3 meses'],
        'Permiso para Tenencia': ['Cédula original', 'Certificado Psicomédico ACE', 'Curso de Tiro', 'Escritura Pública o Contrato Arriendo'],
        'Cesión de Armas': ['Cédula de Cedente y Cesionario', 'Ficha técnica del arma', 'Improntas del arma', 'Paz y Salvo de Indumil'],
        'Revalidación': ['Cédula original', 'Carné actual para entrega', 'Certificado Psicomédico ACE', 'Improntas del arma']
    };

    useEffect(() => {
        fetchTramites();
        fetchClientes();
    }, []);

    const fetchTramites = async () => {
        try {
            setLoading(true);
            const data = await api.tramites.getAll();
            setTramites(data);
        } catch (error) {
            console.error('Error fetching tramites:', error);
            toast.error('Error al cargar trámites');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTramite = async (e) => {
        e.preventDefault();
        if (!formData.clienteId) return toast.error('Debe seleccionar un cliente');

        try {
            await api.tramites.create(formData);
            toast.success('Trámite creado exitosamente');
            setShowModal(false);
            setFormData({ clienteId: '', tipo: 'Permiso para Porte', valorAcuerdo: '', abono: '', esUrgente: false, observaciones: '' });
            fetchTramites();
        } catch (error) {
            console.error('Error creating tramite:', error);
            toast.error('Error al crear trámite');
        }
    };

    const filteredTramites = tramites.filter(t => t.estado === filter || filter === 'ALL');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Motor de Procesos</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">Gestión de Trámites</h1>
                </div>
                
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-gold-gradient text-military-950 font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
                >
                    <Plus size={20} />
                    <span>INICIAR NUEVO TRÁMITE</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                <TabButton active={filter === 'EN_PROCESO'} onClick={() => setFilter('EN_PROCESO')} label="En Proceso" count={tramites.filter(t => t.estado === 'EN_PROCESO').length} />
                <TabButton active={filter === 'EN_ESPERA'} onClick={() => setFilter('EN_ESPERA')} label="En Espera" count={tramites.filter(t => t.estado === 'EN_ESPERA').length} />
                <TabButton active={filter === 'COMPLETADO'} onClick={() => setFilter('COMPLETADO')} label="Finalizados" count={tramites.filter(t => t.estado === 'COMPLETADO').length} />
                <TabButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="Todos" count={tramites.length} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
            ) : filteredTramites.length === 0 ? (
                <div className="glass p-12 rounded-[2.5rem] text-center">
                    <p className="text-military-500">No hay trámites en este estado</p>
                </div>
            ) : (
                <div className="glass overflow-hidden rounded-[2.5rem] border border-military-100/10 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-military-900/50">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-military-400">Cliente / Info</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-military-400">Servicio / Tipo</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-military-400">Estado / Última Acción</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-military-400">Finanzas</th>
                                    <th className="p-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-military-100/5">
                                {filteredTramites.map((t) => (
                                    <tr key={t.id} className="hover:bg-military-800/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-military-800 border border-military-700 flex items-center justify-center text-gold-500">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{t.cliente?.nombre || 'Cliente'}</p>
                                                    <p className="text-[10px] text-military-500 uppercase font-black">{t.cliente?.cedula || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText size={14} className="text-gold-500" />
                                                <p className="text-sm font-bold text-military-100">{t.tipo}</p>
                                            </div>
                                            <p className="text-[10px] text-military-500 font-medium">Iniciado: {new Date(t.fechaInicio).toLocaleDateString('es-CO')}</p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <StatusBadge status={t.estado} urgent={t.esUrgente} />
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-military-400">
                                                <History size={12} className="shrink-0" />
                                                <span className="truncate max-w-[180px]">{t.observaciones || 'Sin observaciones'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px] text-military-400 uppercase font-black">
                                                    <span>Abono</span>
                                                    <span className="text-green-500">${(t.abono || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-military-400 uppercase font-black">
                                                    <span>Saldo</span>
                                                    <span className={`${(t.saldo || 0) > 0 ? 'text-red-500' : 'text-military-600'}`}>${(t.saldo || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                             <button 
                                                 onClick={() => navigate(`/clientes/${t.clienteId}`)}
                                                 className="p-2 rounded-xl bg-military-900 border border-military-800 text-military-500 hover:text-gold-500 hover:border-gold-500/50 transition-all shadow-lg hover:shadow-gold-500/10"
                                                 title="Ver Expediente"
                                             >
                                                 <ChevronRight size={20} />
                                             </button>
                                         </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(requisitosOficiales).map(([tipo, items]) => (
                     <div key={tipo} className="glass p-6 rounded-[2.5rem] border border-military-100/10 hover:border-gold-500/20 transition-all group relative overflow-hidden">
                          <img src="/dgg_logo.jpg" alt="DGG Mini" className="absolute -right-2 -top-2 w-16 h-16 opacity-5 group-hover:rotate-12 transition-transform" />
                          <div className="flex items-center gap-3 mb-4">
                             <div className="p-2 bg-gold-500/10 rounded-lg">
                                 <Plus size={14} className="text-gold-500" />
                             </div>
                             <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{tipo}</h4>
                          </div>
                         <ul className="space-y-2">
                             {items.map((item, i) => (
                                 <li key={i} className="flex items-start gap-2 text-[10px] text-military-500 font-bold leading-tight group-hover:text-military-300 transition-colors">
                                     <div className="w-1 h-1 rounded-full bg-gold-500 mt-1 shrink-0" />
                                     <span>{item}</span>
                                 </li>
                             ))}
                         </ul>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="glass p-8 rounded-[2.5rem] w-full max-w-lg border border-gold-500/20 shadow-[0_0_50px_rgba(213,161,21,0.1)]">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center text-military-950">
                                 <Plus size={24} />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-white leading-tight">INICIAR TRÁMITE</h3>
                                 <p className="text-[10px] text-military-500 font-black uppercase tracking-widest">Apertura de expediente Diana Gomez Garcia</p>
                             </div>
                        </div>

                        <form onSubmit={handleCreateTramite} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] text-military-400 font-black uppercase tracking-widest mb-2 block">Seleccionar Cliente</label>
                                    <select 
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500/50 outline-none transition-all"
                                        value={formData.clienteId}
                                        onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Elige un cliente --</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre} (ID: {c.cedula || 'N/A'})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] text-military-400 font-black uppercase tracking-widest mb-2 block">Tipo de Trámite</label>
                                    <select 
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500/50 outline-none transition-all"
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                                    >
                                        {Object.keys(requisitosOficiales).map(tipo => (
                                            <option key={tipo} value={tipo}>{tipo}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] text-military-400 font-black uppercase tracking-widest mb-2 block">Valor Acuerdo</label>
                                    <input 
                                        type="number"
                                        placeholder="0"
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500/50 outline-none"
                                        value={formData.valorAcuerdo}
                                        onChange={(e) => setFormData({...formData, valorAcuerdo: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] text-military-400 font-black uppercase tracking-widest mb-2 block">Abono Inicial</label>
                                    <input 
                                        type="number"
                                        placeholder="0"
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500/50 outline-none"
                                        value={formData.abono}
                                        onChange={(e) => setFormData({...formData, abono: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-military-900/50 rounded-2xl border border-military-800">
                                <input 
                                    type="checkbox" 
                                    id="urgente"
                                    className="w-5 h-5 rounded-lg accent-gold-500 cursor-pointer"
                                    checked={formData.esUrgente}
                                    onChange={(e) => setFormData({...formData, esUrgente: e.target.checked})}
                                />
                                <label htmlFor="urgente" className="text-xs font-bold text-white cursor-pointer flex items-center gap-2">
                                    Marcar como Trámite URGENTE <Clock size={14} className="text-red-500" />
                                </label>
                            </div>

                            <div>
                                <label className="text-[10px] text-military-400 font-black uppercase tracking-widest mb-2 block">Observaciones Iniciales</label>
                                <textarea 
                                    className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white text-sm focus:border-gold-500/50 outline-none h-24 resize-none"
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-military-800 text-military-300 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-military-700 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 bg-gold-gradient text-military-950 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-gold-500/20 active:scale-95 transition-all"
                                >
                                    Abrir Expediente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Shield = ({ size, className }) => (
    <div className={className}>
         <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
);

const TabButton = ({ active, onClick, label, count }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-2xl flex items-center space-x-2 border transition-all ${active ? 'bg-gold-500/10 border-gold-500/50 text-gold-500' : 'bg-military-900/50 border-military-800 text-military-500 hover:text-military-100'}`}
    >
        <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${active ? 'bg-gold-500 text-military-950' : 'bg-military-800 text-military-600'}`}>
            {count || 0}
        </span>
    </button>
);

const StatusBadge = ({ status, urgent }) => {
    const configs = {
        EN_PROCESO: { icon: <Clock size={12} />, text: 'En Proceso', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        EN_ESPERA: { icon: <Clock size={12} />, text: 'En Espera', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
        COMPLETADO: { icon: <CheckCircle2 size={12} />, text: 'Finalizado', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
        CANCELADO: { icon: <AlertCircle size={12} />, text: 'Cancelado', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
    };

    const config = configs[status] || configs.EN_PROCESO;

    return (
        <div className="flex gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.class}`}>
                {config.icon}
                {config.text}
            </span>
            {urgent && (
                <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase animate-pulse">
                    URGENTE
                </span>
            )}
        </div>
    );
};

export default Tramites
