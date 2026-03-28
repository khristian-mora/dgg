import React, { useState, useEffect } from 'react'
import { Plus, ListChecks, Calendar, Clock, AlertTriangle, CheckCircle, Trash2, ArrowRight, Loader2, User, Filter, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'
import toast from 'react-hot-toast'

const Tareas = () => {
    const { user, isSuperAdmin } = useAuth();
    const [period, setPeriod] = useState('day'); // day, week, month
    const [filter, setFilter] = useState('PENDIENTE');
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fechaLimite: new Date().toISOString().split('T')[0],
        prioridad: 'NORMAL',
        asignadoAId: user?.id || ''
    });

    useEffect(() => {
        fetchTareas();
    }, [period, filter]);

    const fetchTareas = async () => {
        try {
            setLoading(true);
            const params = { period, status: filter === 'ALL' ? '' : filter };
            // RBAC: Si no es admin, solo ve sus propias tareas
            if (!isSuperAdmin && user?.id) {
                params.userId = user.id;
            }
            const data = await api.tareas.getAll(params);
            setTareas(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Error al cargar tareas');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.tareas.create(formData);
            toast.success('Tarea asignada exitosamente');
            setShowModal(false);
            setFormData({
                titulo: '',
                descripcion: '',
                fechaLimite: new Date().toISOString().split('T')[0],
                prioridad: 'NORMAL',
                asignadoAId: user?.id || ''
            });
            fetchTareas();
        } catch (error) {
            toast.error('Error al asignar tarea');
        }
    };

    const toggleStatus = async (tarea) => {
        const newStatus = tarea.estado === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA';
        try {
            await api.tareas.update(tarea.id, { estado: newStatus });
            toast.success(newStatus === 'COMPLETADA' ? 'Tarea marcada como completada' : 'Tarea pendiente');
            fetchTareas();
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const priorityColors = {
        URGENTE: 'text-red-500 bg-red-500/10 border-red-500/20',
        ALTA: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        NORMAL: 'text-gold-500 bg-gold-500/10 border-gold-500/20',
        BAJA: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Flujo de Operaciones</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">Dashboard de Tareas</h1>
                </div>
                
                {isSuperAdmin && (
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center space-x-2 px-6 py-4 bg-gold-gradient text-military-950 font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
                    >
                        <Plus size={20} />
                        <span>ASIGNAR NUEVA TAREA</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-6 rounded-[2rem] border border-military-100/10">
                        <h4 className="text-xs font-black text-military-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Calendar size={14} className="text-gold-500" /> Horizonte Temporal
                        </h4>
                        <div className="space-y-2">
                            <PeriodBtn active={period === 'day'} onClick={() => setPeriod('day')} label="Hoy" sublabel="Tareas actuales" />
                            <PeriodBtn active={period === 'week'} onClick={() => setPeriod('week')} label="Esta Semana" sublabel="Próximos días" />
                            <PeriodBtn active={period === 'month'} onClick={() => setPeriod('month')} label="Este Mes" sublabel="Planificación" />
                        </div>
                    </div>

                    <div className="glass p-6 rounded-[2rem] border border-military-100/10">
                        <h4 className="text-xs font-black text-military-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Filter size={14} className="text-gold-500" /> Filtrar Estado
                        </h4>
                        <div className="space-y-2">
                            <FilterBtn active={filter === 'PENDIENTE'} onClick={() => setFilter('PENDIENTE')} label="Pendientes" />
                            <FilterBtn active={filter === 'COMPLETADA'} onClick={() => setFilter('COMPLETADA')} label="Completadas" />
                            <FilterBtn active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="Todas" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                        </div>
                    ) : tareas.length === 0 ? (
                        <div className="glass p-20 rounded-[3rem] text-center">
                            <div className="w-20 h-20 bg-military-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ListChecks size={40} className="text-military-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Todo bajo control</h3>
                            <p className="text-military-500">No hay tareas programadas para este periodo.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tareas.map((tarea) => (
                                <div 
                                    key={tarea.id} 
                                    className={`glass group p-6 rounded-[2.5rem] border border-military-100/10 hover:border-gold-500/30 transition-all ${tarea.estado === 'COMPLETADA' ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <button 
                                            onClick={() => toggleStatus(tarea)}
                                            className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${tarea.estado === 'COMPLETADA' ? 'bg-gold-500 border-gold-500 text-military-950' : 'border-military-700 text-transparent hover:border-gold-500/50'}`}
                                        >
                                            <CheckCircle size={18} fill="currentColor" />
                                        </button>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className={`text-lg font-bold leading-none truncate ${tarea.estado === 'COMPLETADA' ? 'text-military-500 line-through' : 'text-white'}`}>
                                                    {tarea.titulo}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${priorityColors[tarea.prioridad]}`}>
                                                    {tarea.prioridad}
                                                </span>
                                                {tarea.tipo === 'AUTOMATICA' && (
                                                     <span className="px-2 py-0.5 bg-military-800 text-military-500 border border-military-700 rounded text-[8px] font-black uppercase tracking-widest">
                                                        SISTEMA
                                                     </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-military-400 mb-4 line-clamp-2">{tarea.descripcion}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-military-100/5">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} className="text-gold-500" />
                                                    <span className="text-[10px] font-black text-military-500 uppercase tracking-widest">
                                                        Vence: {new Date(tarea.fechaLimite).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User size={12} className="text-military-500" />
                                                    <span className="text-[10px] font-black text-military-500 uppercase tracking-widest">
                                                        {tarea.asignadoA?.nombre || 'Sin asignar'}
                                                    </span>
                                                </div>
                                                {tarea.cliente && (
                                                     <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                                                         <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest">
                                                            {tarea.cliente.nombres} {tarea.cliente.apellidos}
                                                         </span>
                                                     </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="p-2 rounded-xl hover:bg-military-800 text-military-600 hover:text-military-100 transition-all opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Nueva Tarea */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="glass p-10 rounded-[3rem] w-full max-w-lg border border-gold-500/20 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center">
                                <Plus size={24} className="text-military-950" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white leading-none">Nueva Tarea</h3>
                                <p className="text-military-500 text-[10px] uppercase font-bold tracking-widest mt-1">Asignación Directa</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-military-400 uppercase tracking-widest ml-2">Título de la Tarea</label>
                                <input 
                                    type="text" 
                                    className="w-full p-4 bg-military-950/50 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500 outline-none transition-all"
                                    placeholder="Ej: Revisar permiso del Cliente X"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-military-400 uppercase tracking-widest ml-2">Fecha Límite</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-4 bg-military-950/50 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500 outline-none transition-all"
                                        value={formData.fechaLimite}
                                        onChange={(e) => setFormData({...formData, fechaLimite: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-military-400 uppercase tracking-widest ml-2">Prioridad</label>
                                    <select 
                                        className="w-full p-4 bg-military-950/50 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500 outline-none transition-all appearance-none"
                                        value={formData.prioridad}
                                        onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                                    >
                                        <option value="BAJA">Baja</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="ALTA">Alta</option>
                                        <option value="URGENTE">Urgente</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-military-400 uppercase tracking-widest ml-2">Instrucciones / Detalles</label>
                                <textarea 
                                    className="w-full p-4 bg-military-950/50 border border-military-800 rounded-2xl text-white font-bold focus:border-gold-500 outline-none transition-all resize-none"
                                    rows={3}
                                    placeholder="Describa los pasos a seguir..."
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-military-900 text-military-400 font-bold rounded-2xl border border-military-800 hover:text-white transition-all"
                                >
                                    DESCARTAR
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-2 py-4 gold-gradient text-military-950 font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    CONSIGNAR TAREA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

const PeriodBtn = ({ active, onClick, label, sublabel }) => (
    <button 
        onClick={onClick}
        className={`w-full p-4 rounded-2xl flex flex-col items-start transition-all border ${active ? 'bg-gold-500/10 border-gold-500/50' : 'bg-military-900/40 border-military-800 hover:border-military-600'}`}
    >
        <span className={`text-sm font-black uppercase tracking-widest ${active ? 'text-gold-500' : 'text-military-300'}`}>{label}</span>
        <span className="text-[10px] text-military-500 font-bold">{sublabel}</span>
    </button>
);

const FilterBtn = ({ active, onClick, label }) => (
    <button 
        onClick={onClick}
        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${active ? 'bg-military-800 text-white font-bold' : 'text-military-500 hover:text-military-300'}`}
    >
        <span className="text-xs uppercase tracking-widest">{label}</span>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />}
    </button>
);

export default Tareas
