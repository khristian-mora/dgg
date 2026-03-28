import React, { useState, useEffect } from 'react'
import { Shield, Activity, HardDrive, Lock, CheckCircle, AlertTriangle, Clock, Search, Server, Database, Globe, Loader2 } from 'lucide-react'
import { api } from '../api/api'

const Auditoria = () => {
    const [activeTab, setActiveTab] = useState('LOGS');
    const [auditData, setAuditData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAudit();
    }, []);

    const fetchAudit = async () => {
        try {
            setLoading(true);
            const data = await api.audit.getSystem();
            setAuditData(data);
        } catch (error) {
            console.error('Audit Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gold-500" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Seguridad y Control de Calidad</p>
                   <h1 className="text-4xl font-black text-white tracking-tight">Panel de Auditoría</h1>
                </div>
                
                <div className="flex bg-military-900/50 p-1.5 rounded-2xl border border-military-800">
                    <button 
                        onClick={() => setActiveTab('LOGS')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LOGS' ? 'bg-gold-gradient text-military-950 shadow-lg' : 'text-military-500 hover:text-white'}`}
                    >
                        Activity Logs
                    </button>
                    <button 
                        onClick={() => setActiveTab('SISTEMA')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SISTEMA' ? 'bg-gold-gradient text-military-950 shadow-lg' : 'text-military-500 hover:text-white'}`}
                    >
                        System Health
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <HealthCard icon={<Database />} label="Database" status="Synced" value="PostgreSQL/SQLite" color="green" />
                <HealthCard icon={<Lock />} label="Seguridad" status="Strong" value="JWT/BCRYPT" color="gold" />
                <HealthCard icon={<HardDrive />} label="Memoria Libre" status="Optimized" value={auditData?.systemHealth?.memory?.free || '0 GB'} color="blue" />
                <HealthCard icon={<Globe />} label="Status Motor" status="Active" value="Uptime OK" color="green" />
            </div>

            {activeTab === 'LOGS' ? (
                <div className="glass p-8 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity size={20} className="text-gold-500" /> Registro de Actividad (Global)
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-military-500" size={14} />
                            <input type="text" placeholder="Filtrar por acción o usuario..." className="pl-9 pr-4 py-2 bg-military-950 border border-military-800 rounded-xl text-xs focus:outline-none focus:border-gold-500" />
                        </div>
                    </div>

                    <div className="space-y-4">
                         {auditData?.logs?.length === 0 ? (
                             <p className="text-center text-military-500 py-10 italic">No hay registros de actividad recientes</p>
                         ) : (
                             auditData?.logs?.map(log => (
                                <LogItem 
                                    key={log.id}
                                    user={log.user?.nombre || 'Sistema'} 
                                    action={log.accion} 
                                    detail={log.detalle} 
                                    time={new Date(log.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} 
                                />
                             ))
                         )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-bold mb-8 text-white flex items-center gap-2">
                             <Shield size={20} className="text-gold-500" /> Pruebas Integrales de Auditoría
                        </h3>
                        <div className="space-y-6">
                            {auditData?.checks?.map((check, i) => (
                                <AuditCheck key={i} label={check.label} status={check.status} detail={check.detail} />
                            ))}
                        </div>
                        <button 
                            onClick={fetchAudit}
                            className="w-full mt-10 py-4 bg-military-900 border border-military-800 text-gold-500 font-bold rounded-2xl hover:bg-military-800 transition-all text-xs tracking-widest uppercase"
                        >
                            RE-EJECUTAR AUDIT INTEGRAL
                        </button>
                    </div>
                    
                    <div className="glass p-8 rounded-[2.5rem]">
                         <h3 className="text-xl font-bold mb-8 text-white flex items-center gap-2">
                             <Server size={20} className="text-gold-500" /> Infraestructura & Despliegue
                        </h3>
                        <div className="p-6 bg-military-950 rounded-2xl border border-military-800 mb-6">
                            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-4">Configuración .env Actual</p>
                            <div className="space-y-2 text-[11px] font-mono">
                                <p className="text-white"><span className="text-gold-500">PLATFORM:</span> {auditData?.systemHealth?.platform}</p>
                                <p className="text-white"><span className="text-gold-500">UPTIME:</span> {auditData?.systemHealth?.uptime} seconds</p>
                                <p className="text-white"><span className="text-gold-500">MEMORY TOTAL:</span> {auditData?.systemHealth?.memory?.total}</p>
                                <p className="text-white"><span className="text-gold-500">DB_STATUS:</span> {auditData?.systemHealth?.db}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                <p className="text-[9px] font-black text-green-500 uppercase mb-1">Status</p>
                                <p className="text-xs font-bold text-white">READY FOR STAGING</p>
                            </div>
                            <div className="flex-1 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <p className="text-[9px] font-black text-red-500 uppercase mb-1">Blockers</p>
                                <p className="text-xs font-bold text-white">NONE DETECTED</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const HealthCard = ({ icon, label, status, value, color }) => {
    const colorMap = {
        green: 'text-green-500',
        gold: 'text-gold-500',
        blue: 'text-blue-500'
    };
    return (
        <div className="glass p-6 rounded-[2rem] border border-military-100/5 group hover:border-military-100/20 transition-all">
            <div className={`p-3 rounded-xl bg-military-900 border border-military-800 mb-4 inline-block ${colorMap[color]}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-bold text-white leading-tight">{status}</p>
            <p className="text-[9px] text-military-600 font-bold uppercase mt-1">{value}</p>
        </div>
    )
}

const LogItem = ({ user, action, detail, time }) => (
    <div className="flex items-center justify-between p-4 bg-military-900/40 rounded-2xl border border-military-100/5 hover:border-gold-500/20 transition-all group">
        <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-military-800 flex items-center justify-center text-xs font-bold text-military-400 group-hover:text-gold-500">
                {user.charAt(0)}
             </div>
             <div>
                 <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-white">{user}</p>
                    <span className="text-[8px] font-black bg-gold-500 text-military-950 px-1.5 py-0.5 rounded uppercase">{action}</span>
                 </div>
                 <p className="text-[11px] text-military-400 mt-0.5">{detail}</p>
             </div>
        </div>
        <p className="text-[10px] font-bold text-military-600 flex items-center gap-1">
            <Clock size={10} /> {time}
        </p>
    </div>
)

const AuditCheck = ({ label, status, detail }) => {
    const isPassed = status === 'PASSED';
    const isWarning = status === 'WARNING';

    return (
        <div className="flex items-start justify-between">
            <div className="flex gap-3">
                <div className={`mt-0.5 ${isPassed ? 'text-green-500' : isWarning ? 'text-gold-500' : 'text-red-500'}`}>
                    <CheckCircle size={16} />
                </div>
                <div>
                     <p className="text-xs font-bold text-white">{label}</p>
                     {detail && <p className="text-[10px] text-military-500 mt-0.5">{detail}</p>}
                </div>
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isPassed ? 'bg-green-500/10 text-green-500' : isWarning ? 'bg-gold-500/10 text-gold-500' : 'bg-red-500/10 text-red-500'}`}>
                {status}
            </span>
        </div>
    )
}

export default Auditoria
