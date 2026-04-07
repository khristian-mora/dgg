import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, User, Plus, ChevronLeft, ChevronRight, MoreVertical, CheckCircle2, AlertCircle, Loader2, Trash2, XCircle, DollarSign, FileText, ChevronRight as StepIcon } from 'lucide-react'
import { api } from '../api/api'
import toast from 'react-hot-toast'

const TIPO_CONFIG = {
    CITA: {
        label: 'Cita',
        color: 'border-l-blue-500',
        iconBg: 'bg-blue-500/10 text-blue-400',
        icon: <User size={16} />,
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    TRAMITE_CREADO: {
        label: 'Trámite Abierto',
        color: 'border-l-gold-500',
        iconBg: 'bg-gold-500/10 text-gold-500',
        icon: <FileText size={16} />,
        badge: 'bg-gold-500/10 text-gold-500 border-gold-500/20'
    },
    ABONO: {
        label: 'Abono / Pago',
        color: 'border-l-green-500',
        iconBg: 'bg-green-500/10 text-green-400',
        icon: <DollarSign size={16} />,
        badge: 'bg-green-500/10 text-green-400 border-green-500/20'
    },
    PASO_TRAMITE: {
        label: 'Avance Trámite',
        color: 'border-l-purple-500',
        iconBg: 'bg-purple-500/10 text-purple-400',
        icon: <StepIcon size={16} />,
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
};

const Agenda = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [eventos, setEventos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [monthEvents, setMonthEvents] = useState({});
    const [upcomingCitas, setUpcomingCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [filterTipo, setFilterTipo] = useState('ALL');
    const [formData, setFormData] = useState({
        clienteId: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '08:00',
        motivo: ''
    });

    useEffect(() => {
        fetchEventos();
        fetchClientes();
        fetchMonthMarkers();
        fetchUpcoming();
    }, [selectedDate.getMonth(), selectedDate.getFullYear()]);

    useEffect(() => {
        // Al cambiar de día específico, solo recargamos eventos de ese día
        fetchEventos();
    }, [selectedDate.getDate()]);

    const fetchClientes = async () => {
        try {
            const data = await api.clientes.getAll();
            setClientes(data.map(c => ({
                id: c.id,
                nombre: `${c.nombres} ${c.apellidos}`,
                cedula: c.cedula
            })));
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchMonthMarkers = async () => {
        try {
            const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            
            const days = await api.citas.getResumenMes({ 
                start: firstDay.toISOString(), 
                end: lastDay.toISOString() 
            });
            
            const markers = {};
            days.forEach(day => {
                markers[day] = 1;
            });
            setMonthEvents(markers);
        } catch (error) {
            console.error('Error fetching markers:', error);
        }
    };

    const fetchUpcoming = async () => {
        try {
            const data = await api.citas.getAll({ 
                start: new Date().toISOString()
            });
            setUpcomingCitas(data.slice(0, 3));
        } catch (error) {
            console.error('Error fetching upcoming:', error);
        }
    };

    const fetchEventos = async () => {
        try {
            setLoading(true);
            const fecha = selectedDate.toISOString().split('T')[0];
            const data = await api.citas.getEventosDia(fecha);
            setEventos(data);
        } catch (error) {
            console.error('Error fetching eventos:', error);
            toast.error('Error al cargar eventos del día');
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
            setFormData({ clienteId: '', fecha: new Date().toISOString().split('T')[0], hora: '08:00', motivo: '' });
            fetchEventos();
            fetchMonthMarkers(); // Refresh markers
            fetchUpcoming(); // Refresh upcoming
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
    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    // Días del calendario que tienen al menos 1 evento (solo CITA por ahora para marcar en el mini-cal)
    const eventosDelMes = {};

    const filteredEventos = filterTipo === 'ALL' ? eventos : eventos.filter(e => e.tipo === filterTipo);

    const conteo = {
        CITA: eventos.filter(e => e.tipo === 'CITA').length,
        TRAMITE_CREADO: eventos.filter(e => e.tipo === 'TRAMITE_CREADO').length,
        ABONO: eventos.filter(e => e.tipo === 'ABONO').length,
        PASO_TRAMITE: eventos.filter(e => e.tipo === 'PASO_TRAMITE').length,
    };

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
                {/* Mini Calendario */}
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
                            const isSelected = day === selectedDate.getDate();
                            return (
                                <button 
                                    key={day}
                                    onClick={() => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setDate(day);
                                        setSelectedDate(newDate);
                                    }}
                                    className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all ${
                                        isToday ? 'bg-gold-500 text-military-950 shadow-[0_0_15px_rgba(213,161,21,0.4)]' : 
                                        isSelected ? 'bg-military-700 text-white ring-1 ring-gold-500/40' :
                                        'text-military-400 hover:bg-military-800 hover:text-military-100'
                                    }`}
                                >
                                    {day}
                                    {monthEvents[day] > 0 && !isToday && (
                                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-gold-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Leyenda de colores */}
                    <div className="mt-8 pt-6 border-t border-military-100/5 space-y-3">
                        <p className="text-[9px] font-black text-military-600 uppercase tracking-widest mb-4">Tipos de evento</p>
                        {Object.entries(TIPO_CONFIG).map(([tipo, cfg]) => (
                            <button
                                key={tipo}
                                onClick={() => setFilterTipo(filterTipo === tipo ? 'ALL' : tipo)}
                                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left ${
                                    filterTipo === tipo ? 'bg-military-800 ring-1 ring-gold-500/30' : 'hover:bg-military-900'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${cfg.iconBg}`}>
                                    {cfg.icon}
                                </div>
                                <span className="text-[10px] font-bold text-military-300 uppercase tracking-widest flex-1">{cfg.label}</span>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${cfg.badge}`}>{conteo[tipo] || 0}</span>
                            </button>
                        ))}
                    </div>

                    {/* Próximas Citas */}
                    <div className="mt-8 pt-6 border-t border-military-100/5">
                        <h4 className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-4">Próximas Citas Activas</h4>
                        <div className="space-y-3">
                            {upcomingCitas.length === 0 ? (
                                <p className="text-[9px] text-military-600 italic px-2">No hay citas próximas en el radar</p>
                            ) : (
                                upcomingCitas.map(cita => (
                                    <div key={`up-${cita.id}`} className="p-3 bg-military-900/50 rounded-xl border border-military-800/50 hover:border-gold-500/20 transition-all cursor-pointer" onClick={() => setSelectedDate(new Date(cita.fecha))}>
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-[9px] font-black text-gold-500 uppercase">{new Date(cita.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} • {cita.hora}</p>
                                        </div>
                                        <p className="text-[11px] font-bold text-white truncate mt-1">{cita.motivo}</p>
                                        <p className="text-[9px] text-military-500 truncate">{cita.cliente ? `${cita.cliente.nombres} ${cita.cliente.apellidos}` : 'Sin cliente'}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel de Eventos del Día */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                         <div>
                             <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                                <Clock className="text-gold-500" size={24} /> 
                                {selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                             </h3>
                             <p className="text-[10px] text-military-500 font-bold uppercase tracking-widest mt-1">{filteredEventos.length} evento{filteredEventos.length !== 1 ? 's' : ''} registrado{filteredEventos.length !== 1 ? 's' : ''}</p>
                         </div>
                         {filterTipo !== 'ALL' && (
                             <button onClick={() => setFilterTipo('ALL')} className="text-[10px] font-black text-gold-500 hover:text-white transition-colors uppercase tracking-widest">
                                 Ver todos
                             </button>
                         )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                        </div>
                    ) : filteredEventos.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-military-800 rounded-[2.5rem] text-center">
                             <CalendarIcon className="mx-auto text-military-700 mb-4" size={40} />
                             <p className="text-xs font-bold text-military-600 uppercase tracking-widest">No hay eventos registrados para este día</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredEventos.map((evento) => {
                                const cfg = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.CITA;
                                return (
                                    <div key={`${evento.tipo}-${evento.id}`} className={`glass rounded-[2rem] border-l-4 ${cfg.color} border border-military-100/10 hover:border-military-100/20 transition-all`}>
                                        <div className="p-5 flex items-center gap-5">
                                            {/* Hora */}
                                            <div className="text-center min-w-[52px]">
                                                <p className="text-xs font-black text-white">{evento.hora}</p>
                                            </div>

                                            {/* Icono tipo */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                                                {cfg.icon}
                                            </div>

                                            {/* Info principal */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${cfg.badge}`}>
                                                        {cfg.label}
                                                    </span>
                                                    {evento.tipo === 'CITA' && evento.meta?.esUrgente && (
                                                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase">Urgente</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-white leading-tight truncate">{evento.titulo}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <User size={10} className="text-military-500 shrink-0" />
                                                    <p className="text-[10px] text-military-400 font-bold truncate">{evento.subtitulo}</p>
                                                </div>
                                            </div>

                                            {/* Actions para CITAs */}
                                            {evento.tipo === 'CITA' && (
                                                <div className="relative shrink-0">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === evento.id ? null : evento.id);
                                                        }}
                                                        className={`p-2 rounded-xl transition-all ${activeMenu === evento.id ? 'bg-gold-500 text-military-950' : 'text-military-600 hover:text-gold-500 hover:bg-military-800'}`}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeMenu === evento.id && (
                                                        <div className="absolute right-0 mt-2 w-48 glass rounded-[1.5rem] border border-military-100/10 shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                            <button 
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    try {
                                                                        await api.citas.updateStatus(evento.id, 'COMPLETADO');
                                                                        toast.success('Cita completada');
                                                                        setActiveMenu(null);
                                                                        fetchEventos();
                                                                    } catch { toast.error('Error al actualizar'); }
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white hover:bg-green-500/10 hover:text-green-500 transition-all text-left"
                                                            >
                                                                <CheckCircle2 size={14} /> COMPLETAR
                                                            </button>
                                                            <button 
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    try {
                                                                        await api.citas.updateStatus(evento.id, 'CANCELADA');
                                                                        toast.success('Cita cancelada');
                                                                        setActiveMenu(null);
                                                                        fetchEventos();
                                                                    } catch { toast.error('Error al actualizar'); }
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
                                                                            await api.citas.delete(evento.id);
                                                                            toast.success('Cita eliminada');
                                                                            setActiveMenu(null);
                                                                            fetchEventos();
                                                                        } catch { toast.error('Error al eliminar'); }
                                                                    }
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all text-left"
                                                            >
                                                                <Trash2 size={14} /> ELIMINAR
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
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
                            <div>
                                <label className="text-xs text-military-400 font-bold uppercase">Cliente (opcional)</label>
                                <select
                                    className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                    value={formData.clienteId}
                                    onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                                >
                                    <option value="">-- Sin cliente específico --</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
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

export default Agenda
