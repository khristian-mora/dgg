import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, History, CheckCircle2, Clock, AlertCircle, User, FileText, ChevronRight, DollarSign, Loader2, Search, CheckCircle, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'
import { REQUISITOS_LABELS } from '../config/tramiteConfig'
import { formatCurrency, formatInputValue, parseAmount } from '../utils/formatters'
import toast from 'react-hot-toast'

const Tramites = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filter, setFilter] = useState('EN_PROCESO');
    const [searchTerm, setSearchTerm] = useState('');
    const [tramites, setTramites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        clienteId: '',
        tipo: 'Permiso para Porte',
        valorAcuerdo: '',
        abono: '',
        esUrgente: false,
        observaciones: ''
    });

    // Estado para búsqueda de cliente
    const [clienteSearch, setClienteSearch] = useState('');
    const [clienteResults, setClienteResults] = useState([]);
    const [allClientes, setAllClientes] = useState([]);
    const [searchingCliente, setSearchingCliente] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [showResults, setShowResults] = useState(false);
    
    // Estado para Historial de Pagos Rápido
    const [selectedTramite, setSelectedTramite] = useState(null);
    const [pagosTramite, setPagosTramite] = useState([]);
    const [loadingPagos, setLoadingPagos] = useState(false);

    const handleClienteSearch = (q) => {
        setClienteSearch(q);
        setShowResults(true);

        if (!q.trim()) {
            setClienteResults(allClientes.slice(0, 15)); // Mostrar primeros 15 por defecto
            return;
        }

        if (searchTimeout) clearTimeout(searchTimeout);

        setSearchTimeout(setTimeout(async () => {
            setSearchingCliente(true);
            try {
                const res = await api.clientes.search(q);
                setClienteResults(res.slice(0, 8));
            } catch {
                setClienteResults([]);
            } finally {
                setSearchingCliente(false);
            }
        }, 350));
    };

    const fetchAllClientes = async () => {
        try {
            const data = await api.clientes.getAll();
            setAllClientes(data);
            setClienteResults(data.slice(0, 15));
        } catch (error) {
            console.error('Error fetching all clients:', error);
        }
    };

    const seleccionarCliente = (c) => {
        setClienteSeleccionado(c);
        setClienteSearch(`${c.nombres} ${c.apellidos}`);
        setClienteResults([]);
        setShowResults(false);
        setFormData(prev => ({ ...prev, clienteId: c.id }));
    };

    const stats = {
        totalActivos: tramites.filter(t => t.estado === 'EN_PROCESO').length,
        urgentes: tramites.filter(t => t.esUrgente && t.estado !== 'COMPLETADO').length,
        saldoTotal: tramites.reduce((acc, t) => acc + (t.saldoPendiente || 0), 0)
    };

    const requisitosOficiales = REQUISITOS_LABELS;

    useEffect(() => {
        fetchTramites();
        fetchAllClientes();
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

    const handleVerHistorial = async (tramite) => {
        setSelectedTramite(tramite);
        setLoadingPagos(true);
        try {
            const data = await api.pagos.getByTramite(tramite.id);
            setPagosTramite(data);
        } catch (error) {
            toast.error('Error al cargar historial de pagos');
            setPagosTramite([]);
        } finally {
            setLoadingPagos(false);
        }
    };

    const handleLaunchTramite = (tipo) => {
        setFormData(prev => ({ ...prev, tipo }));
        setShowModal(true);
    };

    const handleCreateTramite = async (e) => {
        e.preventDefault();
        if (!formData.clienteId) return toast.error('Debe seleccionar un cliente');

        try {
            const payload = {
                ...formData,
                valorAcuerdo: parseAmount(formData.valorAcuerdo),
                abono: parseAmount(formData.abono)
            };
            await api.tramites.create(payload);
            toast.success('Trámite creado exitosamente');
            setShowModal(false);
            setFormData({ clienteId: '', tipo: 'Permiso para Porte', valorAcuerdo: '', abono: '', esUrgente: false, observaciones: '' });
            setClienteSeleccionado(null);
            setClienteSearch('');
            fetchTramites();
        } catch (error) {
            console.error('Error creating tramite:', error);
            toast.error('Error al crear trámite');
        }
    };

    const filteredTramites = tramites.filter(t => {
        const matchesFilter = t.estado === filter || filter === 'ALL';
        const searchStr = `${t.cliente?.nombres} ${t.cliente?.apellidos} ${t.cliente?.cedula} ${t.tipo}`.toLowerCase();
        const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
                    <span>NUEVO TRÁMITE</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    label="Trámites Activos" 
                    value={stats.totalActivos} 
                    icon={<FileText className="text-gold-500" />} 
                    color="from-gold-500/20 to-transparent"
                />
                <StatCard 
                    label="Prioridad Alta (Urgentes)" 
                    value={stats.urgentes} 
                    icon={<AlertCircle className="text-red-500" />} 
                    color="from-red-500/20 to-transparent"
                />
                <StatCard 
                    label="Saldo Pendiente Total" 
                    value={formatCurrency(stats.saldoTotal)} 
                    icon={<DollarSign className="text-green-500" />} 
                    color="from-green-500/20 to-transparent"
                />
            </div>

            {/* Launchers Grid (Moved to top) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(requisitosOficiales).map(([tipo, items]) => (
                     <div 
                        key={tipo} 
                        onClick={() => handleLaunchTramite(tipo)}
                        className="glass p-6 rounded-[2.5rem] border border-military-100/10 hover:border-gold-500/50 hover:scale-[1.02] cursor-pointer transition-all group relative overflow-hidden shadow-lg hover:shadow-gold-500/10"
                    >
                          <img src="/dgg_logo.jpg" alt="DGG Mini" className="absolute -right-2 -top-2 w-16 h-16 opacity-5 group-hover:rotate-12 transition-transform" />
                          <div className="flex items-center gap-3 mb-4">
                             <div className="p-2 bg-gold-500/10 rounded-lg group-hover:bg-gold-500 group-hover:text-military-950 transition-colors">
                                 <Plus size={14} className="text-gold-500 group-hover:text-inherit" />
                             </div>
                             <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{tipo}</h4>
                          </div>
                         <ul className="space-y-2 mb-4">
                             {items.map((item, i) => (
                                 <li key={i} className="flex items-start gap-2 text-[10px] text-military-500 font-bold leading-tight group-hover:text-military-300 transition-colors">
                                     <div className="w-1 h-1 rounded-full bg-gold-500 mt-1 shrink-0" />
                                     <span>{item}</span>
                                 </li>
                             ))}
                         </ul>
                         <div className="pt-4 border-t border-military-800 flex items-center justify-between text-[10px] font-black text-gold-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                             <span>Iniciar ahora</span>
                             <ChevronRight size={14} />
                         </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                <div className="flex flex-wrap gap-2">
                    <TabButton active={filter === 'EN_PROCESO'} onClick={() => setFilter('EN_PROCESO')} label="En Proceso" count={tramites.filter(t => t.estado === 'EN_PROCESO').length} />
                    <TabButton active={filter === 'EN_ESPERA'} onClick={() => setFilter('EN_ESPERA')} label="En Espera" count={tramites.filter(t => t.estado === 'EN_ESPERA').length} />
                    <TabButton active={filter === 'COMPLETADO'} onClick={() => setFilter('COMPLETADO')} label="Finalizados" count={tramites.filter(t => t.estado === 'COMPLETADO').length} />
                    <TabButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="Todos" count={tramites.length} />
                </div>

                <div className="relative w-full md:w-80">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-military-500" />
                    <input 
                        type="text"
                        placeholder="Buscar por cliente o tipo..."
                        className="w-full pl-12 pr-4 py-3 bg-military-900/50 border border-military-800 rounded-2xl text-white focus:border-gold-500/50 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Modal Historial de Pagos Rápido */}
            {selectedTramite && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-military-950/80 backdrop-blur-md">
                    <div className="glass w-full max-w-2xl p-8 rounded-[3rem] border border-military-800 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setSelectedTramite(null)}
                            className="absolute top-6 right-6 p-2 text-military-500 hover:text-white transition-all bg-military-900 rounded-xl"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center text-military-950 shadow-lg shadow-gold-500/20">
                                <History size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Historial Financiero</h3>
                                <p className="text-[10px] text-military-500 font-black uppercase tracking-[0.2em] mt-2">
                                    Cliente: {selectedTramite.cliente?.nombres} {selectedTramite.cliente?.apellidos}
                                </p>
                            </div>
                        </div>

                        {loadingPagos ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                            </div>
                        ) : pagosTramite.length > 0 ? (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-military-800">
                                            <th className="pb-4 text-[10px] font-black text-military-500 uppercase tracking-widest">Fecha</th>
                                            <th className="pb-4 text-[10px] font-black text-military-500 uppercase tracking-widest">Concepto</th>
                                            <th className="pb-4 text-[10px] font-black text-military-500 uppercase tracking-widest text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-military-800/50">
                                        {pagosTramite.map((p) => (
                                            <tr key={p.id} className="group">
                                                <td className="py-4 text-xs font-bold text-military-300">
                                                    {new Date(p.fecha).toLocaleDateString('es-CO')}
                                                </td>
                                                <td className="py-4">
                                                    <p className="text-xs font-bold text-white leading-none mb-1">{p.metodoPago}</p>
                                                    <p className="text-[10px] text-military-600 truncate max-w-[200px]">{p.concepto}</p>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <p className="text-sm font-black text-green-500">{formatCurrency(p.valor)}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-military-800 rounded-3xl">
                                <DollarSign size={32} className="text-military-800 mx-auto mb-4" />
                                <p className="text-xs text-military-600 font-bold uppercase tracking-widest">Sin abonos registrados aún</p>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-military-800 grid grid-cols-2 gap-6">
                            <div className="p-4 bg-military-900 rounded-2xl border border-military-800">
                                <p className="text-[9px] font-black text-military-500 uppercase tracking-widest mb-1">Abono Total</p>
                                <p className="text-xl font-black text-green-500">{formatCurrency(selectedTramite.abonoTotal || 0)}</p>
                            </div>
                            <div className="p-4 bg-military-900 rounded-2xl border border-military-800 text-right">
                                <p className="text-[9px] font-black text-military-500 uppercase tracking-widest mb-1">Saldo a Favor/Deuda</p>
                                <p className={`text-xl font-black ${(selectedTramite.saldoPendiente || 0) > 0 ? 'text-red-500' : 'text-military-500'}`}>
                                    {formatCurrency(selectedTramite.saldoPendiente || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-military-400">Progreso</th>
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
                                                    <p className="font-bold text-white text-sm">{t.cliente?.nombres ? `${t.cliente.nombres} ${t.cliente.apellidos}` : 'Cliente'}</p>
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
                                                <span className="truncate max-w-[180px]">{t.ultimaAccion || t.observaciones || 'Sin acciones'}</span>
                                            </div>
                                            <p className="text-[9px] text-military-600 font-bold mt-1 uppercase tracking-widest">
                                                {new Date(t.updatedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2 min-w-[140px]">
                                                <div className="flex justify-between items-center text-[10px] font-black text-gold-500 uppercase">
                                                    <span>PASO: {t.roadmap?.[t.pasos?.length || 0] || 'Finalizado'}</span>
                                                    <span>{t.progreso || 0}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-military-900 rounded-full overflow-hidden border border-military-800 shadow-inner">
                                                    <div 
                                                        className="h-full bg-gold-gradient transition-all duration-700 shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                                                        style={{ width: `${t.progreso || 0}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div 
                                                className="space-y-1 cursor-pointer hover:bg-military-800/50 p-2 rounded-xl transition-all group/finance relative"
                                                onClick={() => handleVerHistorial(t)}
                                                title="Click para ver historial de pagos"
                                            >
                                                <div className="flex items-center justify-between text-[10px] text-military-400 uppercase font-black">
                                                    <span>Total</span>
                                                    <span className="text-military-100">{formatCurrency(t.valorAcuerdo || 0)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-military-400 uppercase font-black">
                                                    <span>Abono</span>
                                                    <span className="text-green-500">{formatCurrency(t.abonoTotal || 0)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-military-400 uppercase font-black">
                                                    <span>Saldo</span>
                                                    <span className={`${(t.saldoPendiente || 0) > 0 ? 'text-red-500' : 'text-military-600'}`}>{formatCurrency(t.saldoPendiente || 0)}</span>
                                                </div>
                                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/finance:opacity-100 transition-all">
                                                    <History size={12} className="text-gold-500" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                             <button 
                                                 onClick={() => navigate(`/tramites/${t.id}`)}
                                                 className="px-4 py-2 rounded-xl bg-military-900 border border-military-800 text-gold-500 hover:bg-gold-500 hover:text-military-950 transition-all shadow-lg hover:shadow-gold-500/20 font-bold text-xs uppercase"
                                             >
                                                 Gestionar
                                             </button>
                                         </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                                <div className="col-span-2 relative">
                                    <label className="text-[10px] text-military-400 font-black uppercase tracking-widest mb-2 block">Buscar y Seleccionar Cliente</label>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-military-500" />
                                        <input 
                                            type="text"
                                            className="w-full pl-12 pr-10 py-4 bg-military-950 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500/50 outline-none transition-all"
                                            placeholder="Escribe para buscar o clic para ver lista..."
                                            value={clienteSearch}
                                            onChange={(e) => handleClienteSearch(e.target.value)}
                                            onFocus={() => {
                                                setShowResults(true);
                                                if (!clienteSearch) setClienteResults(allClientes.slice(0, 15));
                                            }}
                                            required={!clienteSeleccionado}
                                        />
                                        {searchingCliente && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Loader2 size={16} className="text-gold-500 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Resultados de búsqueda o Lista Desplegable */}
                                    {showResults && clienteResults.length > 0 && (
                                        <div className="absolute z-[60] w-full mt-2 bg-military-900 border border-military-700 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                                            <div className="p-2 border-b border-military-800 bg-military-950/50 flex justify-between items-center">
                                                <p className="text-[10px] font-black text-military-500 uppercase px-2">
                                                    {clienteSearch ? 'Resultados de búsqueda' : 'Lista de clientes (Sugeridos)'}
                                                </p>
                                                <button type="button" onClick={() => setShowResults(false)} className="p-1 hover:bg-military-800 rounded text-military-500"><X size={10}/></button>
                                            </div>
                                            {clienteResults.map(c => (
                                                <button 
                                                    key={c.id} 
                                                    type="button" 
                                                    onClick={() => seleccionarCliente(c)}
                                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-military-800 transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-military-800 flex items-center justify-center text-gold-500">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{c.nombres} {c.apellidos}</p>
                                                        <p className="text-[10px] text-military-500 font-black">CC: {c.cedula}</p>
                                                    </div>
                                                </button>
                                            ))}
                                            {allClientes.length > 15 && !clienteSearch && (
                                                <div className="p-3 text-center bg-military-950/30 border-t border-military-800">
                                                    <p className="text-[9px] text-military-600 font-bold uppercase tracking-widest italic">Usa el buscador para filtrar entre {allClientes.length} clientes</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Cliente Seleccionado (Feedback) */}
                                    {clienteSeleccionado && (
                                        <div className="mt-2 flex items-center gap-3 px-4 py-3 bg-gold-500/10 border border-gold-500/30 rounded-xl animate-in zoom-in-95">
                                            <CheckCircle className="text-gold-500" size={14} />
                                            <span className="text-xs font-bold text-gold-400">Seleccionado: {clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setClienteSeleccionado(null);
                                                    setClienteSearch('');
                                                    setFormData({...formData, clienteId: ''});
                                                }}
                                                className="ml-auto p-1 hover:bg-red-500/20 rounded-md text-military-500 hover:text-red-400 transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
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
                                        type="text"
                                        placeholder="0"
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500/50 outline-none"
                                        value={formatInputValue(formData.valorAcuerdo)}
                                        onChange={(e) => setFormData({...formData, valorAcuerdo: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] text-military-400 font-black uppercase tracking-widest mb-2 block">Abono Inicial</label>
                                    <input 
                                        type="text"
                                        placeholder="0"
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500/50 outline-none"
                                        value={formatInputValue(formData.abono)}
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

const StatCard = ({ label, value, icon, color }) => (
    <div className={`glass p-6 rounded-[2.5rem] border border-military-100/10 bg-gradient-to-br ${color} relative overflow-hidden group`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
            </div>
            <div className="p-3 bg-military-950/50 rounded-2xl border border-military-800 group-hover:scale-110 transition-transform">
                {icon}
            </div>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label, count }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-2xl flex items-center gap-3 font-bold transition-all border ${
            active 
                ? 'bg-military-900 border-gold-500/50 text-white shadow-xl translate-y-[-2px]' 
                : 'bg-military-950 border-military-800 text-military-500 hover:border-military-600'
        }`}
    >
        <span className="text-xs uppercase tracking-widest">{label}</span>
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
            active ? 'bg-gold-500 text-military-950' : 'bg-military-900 text-military-500'
        }`}>{count}</span>
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
