import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, User, Plus, ChevronLeft, ChevronRight, MoreVertical, CheckCircle2, AlertCircle, Loader2, Trash2, XCircle } from 'lucide-react'
import { api } from '../api/api'
import toast from 'react-hot-toast'

const Agenda = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [citas, setCitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [formData, setFormData] = useState({
        clienteId: '',
        fecha: selectedDate.toISOString().split('T')[0],
        hora: '08:00',
        motivo: ''
    });

    useEffect(() => {
        fetchCitas();
        fetchClientes();
    }, [selectedDate]);

    const fetchClientes = async () => {
        try {
            const data = await api.users.getAll();
            setClientes(data.filter(u => u.rol === 'CLIENTE'));
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchCitas = async () => {
        try {
            setLoading(true);
            const data = await api.citas.getAll({
                fecha: selectedDate.toISOString().split('T')[0]
            });
            setCitas(data);
        } catch (error) {
            console.error('Error fetching citas:', error);
            toast.error('Error al cargar citas');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCita = async (e) => {
        e.preventDefault();
        try {
            await api.citas.create(formData);
            toast.success('Cita programada exitosamente');
            setShowModal(false);
            setFormData({ clienteId: '', fecha: '', hora: '', motivo: '' });
            fetchCitas();
        } catch (error) {
            toast.error('Error al crear cita');
        }
    };

    const changeMonth = (delta) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedDate(newDate);
    };

    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Cronograma de Operaciones</p>
                   <h1 className="text-4xl font-black text-white tracking-tight">Agenda & Citas</h1>
                </div>
                
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-gold-gradient text-military-950 font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
                >
                    <Plus size={20} />
                    <span>PROGRAMAR CITA</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass p-8 rounded-[2.5rem] h-fit">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-white uppercase tracking-widest text-sm">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h3>
                        <div className="flex gap-2">
                            <button onClick={() => changeMonth(-1)} className="p-2 bg-military-900 border border-military-800 rounded-xl text-military-400 hover:text-gold-500">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => changeMonth(1)} className="p-2 bg-military-900 border border-military-800 rounded-xl text-military-400 hover:text-gold-500">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 text-center mb-4">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, idx) => (
                            <span key={`${day}-${idx}`} className="text-[10px] font-black text-military-600 uppercase tracking-widest">{day}</span>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isToday = day === new Date().getDate() && 
                                selectedDate.getMonth() === new Date().getMonth() && 
                                selectedDate.getFullYear() === new Date().getFullYear();
                            return (
                                <button 
                                    key={day}
                                    onClick={() => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setDate(day);
                                        setSelectedDate(newDate);
                                    }}
                                    className={`w-full aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all ${isToday ? 'bg-gold-500 text-military-950 shadow-[0_0_15px_rgba(213,161,21,0.4)]' : 'text-military-400 hover:bg-military-800 hover:text-military-100'}`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-military-100/5">
                        <div className="flex items-center gap-3 p-4 bg-military-900/40 rounded-2xl border border-gold-500/20">
                            <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest italic">{selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                         <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                            <Clock className="text-gold-500" size={24} /> 
                            Citas del {selectedDate.toLocaleDateString('es-CO')}
                         </h3>
                         <span className="text-xs font-bold text-military-500">{citas.length} EVENTOS</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                        </div>
                    ) : citas.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-military-800 rounded-[2.5rem] text-center opacity-40">
                             <p className="text-xs font-bold text-military-600 uppercase tracking-widest">No hay citas programadas</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {citas.map((cita, index) => (
                                <div key={cita.id} className="relative group">
                                    <div className="absolute left-[2.25rem] top-12 bottom-0 w-0.5 bg-military-800 group-last:hidden" />
                                    
                                    <div className="glass p-6 rounded-[2rem] ml-4 flex items-center gap-6 border border-military-100/10 hover:border-gold-500/30 transition-all cursor-pointer">
                                        <div className="text-center min-w-[60px]">
                                            <p className="text-xs font-black text-white">{cita.hora}</p>
                                        </div>

                                        <div className="w-12 h-12 rounded-2xl bg-military-900 border border-military-800 flex items-center justify-center text-military-300 group-hover:border-gold-500/50 group-hover:text-gold-500 transition-all">
                                            <User size={20} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-white text-sm">
                                                    {cita.cliente ? `${cita.cliente.nombres} ${cita.cliente.apellidos}` : 'Cliente'}
                                                </h4>
                                                {cita.urgente && (
                                                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase rounded-md border border-red-500/20">Prioridad</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-military-400">{cita.motivo}</p>
                                        </div>

                                        <div className="hidden md:block text-right">
                                            <StatusTag status={cita.estado} />
                                        </div>

                                        <div className="relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === cita.id ? null : cita.id);
                                                }}
                                                className={`p-2 rounded-xl transition-all ${activeMenu === cita.id ? 'bg-gold-500 text-military-950' : 'text-military-600 hover:text-gold-500 hover:bg-military-800'}`}
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {activeMenu === cita.id && (
                                                <div className="absolute right-0 mt-2 w-48 glass rounded-[1.5rem] border border-military-100/10 shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                await api.citas.updateStatus(cita.id, 'COMPLETADO');
                                                                toast.success('Cita marcada como completada');
                                                                setActiveMenu(null);
                                                                fetchCitas();
                                                            } catch (err) {
                                                                toast.error('Error al actualizar');
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white hover:bg-green-500/10 hover:text-green-500 transition-all text-left"
                                                    >
                                                        <CheckCircle2 size={14} /> COMPLETAR
                                                    </button>
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                await api.citas.updateStatus(cita.id, 'CANCELADA');
                                                                toast.success('Cita cancelada');
                                                                setActiveMenu(null);
                                                                fetchCitas();
                                                            } catch (err) {
                                                                toast.error('Error al actualizar');
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white hover:bg-gold-500/10 hover:text-gold-500 transition-all text-left"
                                                    >
                                                        <XCircle size={14} /> CANCELAR
                                                    </button>
                                                    <div className="h-px bg-military-800 my-1 mx-4" />
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('¿Seguro que deseas eliminar esta cita?')) {
                                                                try {
                                                                    await api.citas.delete(cita.id);
                                                                    toast.success('Cita eliminada');
                                                                    setActiveMenu(null);
                                                                    fetchCitas();
                                                                } catch (err) {
                                                                    toast.error('Error al eliminar');
                                                                }
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all text-left"
                                                    >
                                                        <Trash2 size={14} /> ELIMINAR
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="glass p-8 rounded-[2rem] w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-6">Nueva Cita</h3>
                        <form onSubmit={handleCreateCita} className="space-y-4">
                            <div>
                                <label className="text-xs text-military-400 font-bold uppercase">Fecha</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-military-400 font-bold uppercase">Hora</label>
                                <input 
                                    type="time" 
                                    required
                                    className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                    value={formData.hora}
                                    onChange={(e) => setFormData({...formData, hora: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-military-400 font-bold uppercase">Motivo</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                    value={formData.motivo}
                                    onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-military-800 text-military-300 rounded-xl font-bold"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-gold-gradient text-military-950 font-bold rounded-xl"
                                >
                                    Crear Cita
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

const StatusTag = ({ status }) => {
    const configs = {
        PENDIENTE: { icon: <Clock size={12} />, class: 'bg-gold-500/10 text-gold-500 border-gold-500/20' },
        COMPLETADO: { icon: <CheckCircle2 size={12} />, class: 'bg-green-500/10 text-green-400 border-green-500/20' },
        CANCELADA: { icon: <AlertCircle size={12} />, class: 'bg-red-500/10 text-red-400 border-red-500/20' },
    };
    const config = configs[status] || configs.PENDIENTE;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.class}`}>
            {config.icon}
            {status}
        </span>
    )
}

export default Agenda
