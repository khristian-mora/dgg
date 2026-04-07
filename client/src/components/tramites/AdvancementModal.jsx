import React, { useState } from 'react';
import { 
    X, 
    Send, 
    Bell, 
    Calendar, 
    Clock, 
    Info, 
    MessageSquare,
    CheckCircle2,
    AlertTriangle,
    MapPin
} from 'lucide-react';

const AdvancementModal = ({ isOpen, onClose, onConfirm, currentStep, tramiteTipo }) => {
    const [loading, setLoading] = useState(false);
    const [notificar, setNotificar] = useState(true);
    const [observaciones, setObservaciones] = useState('');
    
    // Reminder (Task) State
    const [hasReminder, setHasReminder] = useState(false);
    const [reminderData, setReminderData] = useState({
        titulo: '',
        fecha: new Date().toISOString().split('T')[0],
        prioridad: 'NORMAL',
        descripcion: ''
    });

    // Appointment (Cita) State
    const [hasAppointment, setHasAppointment] = useState(false);
    const [appointmentData, setAppointmentData] = useState({
        motivo: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '08:00',
        lugar: 'Oficina Central',
        descripcion: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm({
                observaciones,
                notificarCliente: notificar,
                reminder: hasReminder ? { ...reminderData, active: true } : null,
                appointment: hasAppointment ? { ...appointmentData, active: true } : null
            });
            onClose();
        } catch (error) {
            console.error('Error in advancement modal:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-military-950/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[3rem] border border-military-800 shadow-2xl p-8 relative">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-gold-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Misión de Trámite</p>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Completar: {currentStep?.label}</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-military-900 rounded-2xl text-military-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Observations */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-military-500 uppercase tracking-widest">
                            <MessageSquare size={14} className="text-gold-500" />
                            Observaciones de este Paso
                        </label>
                        <textarea 
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Escribe detalles sobre lo que se hizo en este paso..."
                            className="w-full bg-military-900/50 border border-military-800 rounded-3xl p-5 text-white focus:border-gold-500 outline-none font-bold text-sm min-h-[100px] transition-all"
                        />
                    </div>

                    {/* Notificar Switch */}
                    <div className="flex items-center justify-between p-5 bg-military-900/30 border border-military-800 rounded-3xl">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${notificar ? 'bg-gold-500 text-military-950' : 'bg-military-800 text-military-500'}`}>
                                <Bell size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Notificar al Cliente</p>
                                <p className="text-[10px] text-military-500 font-bold uppercase">Se enviará un correo automático sobre el avance</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setNotificar(!notificar)}
                            className={`w-12 h-6 rounded-full relative transition-all ${notificar ? 'bg-gold-500' : 'bg-military-800'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notificar ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* SECTION: REMINDERS (TASKS) */}
                    <div className={`p-6 rounded-[2.5rem] border-2 transition-all ${hasReminder ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-military-900/20 border-military-800'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${hasReminder ? 'bg-indigo-500 text-white' : 'bg-military-800 text-military-500'}`}>
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Crear Recordatorio</h4>
                                    <p className="text-[9px] text-military-500 font-bold uppercase italic">Aviso para Admin, Ayudante y Cliente</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setHasReminder(!hasReminder)}
                                className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${hasReminder ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-gold-500/10 text-gold-500 border border-gold-500/30'}`}
                            >
                                {hasReminder ? 'ELIMINAR' : 'PROGRAMAR'}
                            </button>
                        </div>

                        {hasReminder && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-military-500 uppercase px-1">Título del Recordatorio</label>
                                        <input 
                                            type="text"
                                            value={reminderData.titulo}
                                            onChange={(e) => setReminderData({...reminderData, titulo: e.target.value})}
                                            placeholder="Ej: Reclamar salvoconducto"
                                            className="w-full bg-military-950 border border-military-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none text-xs font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-military-500 uppercase px-1">Fecha Límite</label>
                                        <input 
                                            type="date"
                                            value={reminderData.fecha}
                                            onChange={(e) => setReminderData({...reminderData, fecha: e.target.value})}
                                            className="w-full bg-military-950 border border-military-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none text-xs font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-military-500 uppercase px-1">Nota Adicional</label>
                                    <input 
                                        type="text"
                                        value={reminderData.descripcion}
                                        onChange={(e) => setReminderData({...reminderData, descripcion: e.target.value})}
                                        placeholder="Algún detalle extra para el equipo..."
                                        className="w-full bg-military-950 border border-military-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none text-xs font-bold"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION: APPOINTMENTS (CITA) */}
                    <div className={`p-6 rounded-[2.5rem] border-2 transition-all ${hasAppointment ? 'bg-blue-500/5 border-blue-500/30' : 'bg-military-900/20 border-military-800'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${hasAppointment ? 'bg-blue-500 text-white' : 'bg-military-800 text-military-500'}`}>
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Agendar Cita</h4>
                                    <p className="text-[9px] text-military-500 font-bold uppercase italic">Sincronizado con la Agenda Central</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setHasAppointment(!hasAppointment)}
                                className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${hasAppointment ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-gold-500/10 text-gold-500 border border-gold-500/30'}`}
                            >
                                {hasAppointment ? 'ELIMINAR' : 'AGENDAR'}
                            </button>
                        </div>

                        {hasAppointment && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[9px] font-black text-military-500 uppercase px-1">Motivo de la Cita</label>
                                        <input 
                                            type="text"
                                            value={appointmentData.motivo}
                                            onChange={(e) => setAppointmentData({...appointmentData, motivo: e.target.value})}
                                            placeholder={`Ej: Cita para ${currentStep?.label}`}
                                            className="w-full bg-military-950 border border-military-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none text-xs font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-military-500 uppercase px-1">Hora</label>
                                        <input 
                                            type="time"
                                            value={appointmentData.hora}
                                            onChange={(e) => setAppointmentData({...appointmentData, hora: e.target.value})}
                                            className="w-full bg-military-950 border border-military-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none text-xs font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-military-500 uppercase px-1">Fecha de la Cita</label>
                                        <input 
                                            type="date"
                                            value={appointmentData.fecha}
                                            onChange={(e) => setAppointmentData({...appointmentData, fecha: e.target.value})}
                                            className="w-full bg-military-950 border border-military-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none text-xs font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-military-500 uppercase px-1">Lugar</label>
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                value={appointmentData.lugar}
                                                onChange={(e) => setAppointmentData({...appointmentData, lugar: e.target.value})}
                                                className="w-full bg-military-950 border border-military-800 rounded-2xl p-4 pl-10 text-white focus:border-blue-500 outline-none text-xs font-bold"
                                            />
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-military-600" size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-gold-gradient text-military-950 font-black uppercase text-sm tracking-[0.3em] rounded-[1.5rem] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-gold-500/20"
                    >
                        <Send size={20}/>
                        {loading ? 'Sincronizando...' : 'Confirmar Avance y Notificar'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AdvancementModal;
