import React from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
const Login = React.lazy(() => import('./pages/Login'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Register = React.lazy(() => import('./pages/Register'));
const ClienteDashboard = React.lazy(() => import('./pages/ClienteDashboard'));
const Clientes = React.lazy(() => import('./pages/Clientes'));
const Tramites = React.lazy(() => import('./pages/Tramites'));
const Documentos = React.lazy(() => import('./pages/Documentos'));
const Agenda = React.lazy(() => import('./pages/Agenda'));
const Reportes = React.lazy(() => import('./pages/Reportes'));
const Configuracion = React.lazy(() => import('./pages/Configuracion'));
const Tareas = React.lazy(() => import('./pages/Tareas'));
const Formatos = React.lazy(() => import('./pages/Formatos'));
const Soporte = React.lazy(() => import('./pages/Soporte'));
const Caja = React.lazy(() => import('./pages/Caja'));
const Auditoria = React.lazy(() => import('./pages/Auditoria'));
const ClientePerfil = React.lazy(() => import('./pages/ClientePerfil'));
const TramiteDetalle = React.lazy(() => import('./pages/TramiteDetalle'));
const Usuarios = React.lazy(() => import('./pages/Usuarios'));
import NinjaSearch from './components/common/NinjaSearch'
import CookiesConsent from './components/common/CookiesConsent'
import ProtectedRoute from './components/rbac/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { api } from './api/api'
import { useState, useEffect } from 'react'
import { Loader2, BookOpen, Wallet, FileCheck, ShieldCheck } from 'lucide-react'
import { LogOut, LayoutDashboard, Users, FileText, Calendar, DollarSign, Settings, Shield, FolderOpen, BarChart2, Search, Command, ListChecks, Plus, ChevronRight } from 'lucide-react'

// Layout component to avoid repetition
export const SidebarLayout = ({ children }) => {
    const { user, logout, isSuperAdmin } = useAuth();
    
    return (
        <div className="flex min-h-screen bg-military-950 text-military-100 overflow-hidden">
            {/* Dark Sidebar */}
            <aside className="w-64 glass border-r border-military-100/10 flex flex-col p-6 z-20">
                <div className="flex items-center space-x-3 mb-12">
                     <img src="/dgg_logo.png" alt="DGG Logo" className="w-10 h-10 rounded-lg object-contain shadow-lg" />
                    <div>
                        <h2 className="text-xl font-black text-white leading-none">DGG</h2>
                        <span className="text-[9px] text-military-500 uppercase tracking-widest font-bold">Gestión y Asesorías - AD DEFENSA PERSONAL</span>
                    </div>
                </div>

                <div className="mb-8">
                    <button 
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                        className="w-full flex items-center justify-between px-4 py-3 bg-military-900 border border-military-800 rounded-2xl text-military-400 hover:text-gold-500 hover:border-gold-500/30 transition-all group"
                    >
                         <div className="flex items-center gap-3">
                            <Search size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Buscador Ninja</span>
                         </div>
                         <div className="flex items-center gap-1 bg-military-950 px-1.5 py-0.5 rounded border border-military-800 text-[8px] font-black">
                            <Command size={8} />
                            <span>K</span>
                         </div>
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                    <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" to="/dashboard" />
                    <NavItem icon={<Users size={18}/>} label="Clientes" to="/clientes" />
                    <NavItem icon={<FileText size={18}/>} label="Trámites" to="/tramites" />
                    <NavItem icon={<FileCheck size={18}/>} label="Formatos" to="/formatos" />
                    <NavItem icon={<ListChecks size={18}/>} label="Tareas" to="/tareas" />
                    <NavItem icon={<Calendar size={18}/>} label="Agenda" to="/agenda" />
                    
                    <div className="pt-4 pb-2">
                        <p className="text-[9px] font-black text-military-600 uppercase tracking-[0.2em] px-3">Recursos</p>
                    </div>

                    <NavItem icon={<FolderOpen size={18}/>} label="Archivo" to="/documentos" />
                    <NavItem icon={<BookOpen size={18}/>} label="Soporte" to="/soporte" />
                    
                    {isSuperAdmin && (
                        <>
                            <div className="pt-4 pb-2">
                                <p className="text-[9px] font-black text-military-600 uppercase tracking-[0.2em] px-3">Administración</p>
                            </div>
                            <NavItem icon={<Wallet size={18}/>} label="Caja" to="/caja" />
                            <NavItem icon={<Users size={18}/>} label="Usuarios" to="/usuarios" />
                            <NavItem icon={<ShieldCheck size={18}/>} label="Auditoría" to="/auditoria" />
                            <NavItem icon={<BarChart2 size={18}/>} label="Inteligencia" to="/reportes" />
                        </>
                    )}
                    <NavItem icon={<Settings size={18}/>} label="Ajustes" to="/config" />
                </nav>

                <div className="mt-auto pt-6 border-t border-military-100/10">
                    <div className="flex items-center space-x-3 mb-6 p-2 rounded-2xl bg-military-900/50">
                        <div className="w-10 h-10 rounded-full bg-military-800 border border-gold-500/30 flex items-center justify-center text-gold-500 font-bold">
                            {user?.nombre?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{user?.nombre}</p>
                            <p className="text-[10px] text-military-500 truncate">{user?.rol}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="flex items-center space-x-3 w-full p-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors font-bold text-sm"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>

                    <div className="mt-8 text-center border-t border-military-100/5 pt-6">
                        <p className="text-[9px] font-black text-military-600 uppercase tracking-[0.3em]">Software de Inteligencia</p>
                        <p className="text-[10px] font-bold text-military-400 mt-1">
                            Desarrollado por <span className="text-gold-500/80 hover:text-gold-500 cursor-pointer transition-colors">ProNext</span>
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto custom-scrollbar pt-6">
                <div className="max-w-7xl mx-auto px-8 pb-12">
                     {children}
                </div>
            </main>
        </div>
    );
};

// Inside App.jsx components...
const NavItem = ({ icon, label, to }) => {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link 
            to={to} 
            className={`flex items-center space-x-4 p-3 rounded-2xl transition-all duration-300 group ${active ? 'bg-gold-gradient text-military-950 shadow-lg' : 'hover:bg-military-800 text-military-400 hover:text-military-100'}`}
        >
            <span className={`${active ? '' : 'group-hover:scale-110'} transition-transform`}>{icon}</span>
            <span className="font-bold text-sm">{label}</span>
        </Link>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [tramitesRecientes, setTramitesRecientes] = useState([]);
    const [citasHoy, setCitasHoy] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [waStatus, setWaStatus] = useState({ status: 'DISCONNECTED', qrImage: null });
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchWaStatus, 5000); // Check status every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchWaStatus = async () => {
        try {
            const status = await api.whatsapp.getStatus();
            setWaStatus(status);
        } catch (e) { /* ignore */ }
    }

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboardStats, tramites, citas, notifs] = await Promise.all([
                api.stats.getDashboard(),
                api.tramites.getAll({ limit: 5 }),
                api.citas.getAll({ fecha: new Date().toISOString().split('T')[0] }),
                api.notificaciones.getAll(5)
            ]);
            
            setStats(dashboardStats);
            setTramitesRecientes(tramites.slice(0, 3));
            setCitasHoy(citas.slice(0, 4));
            setNotificaciones(notifs || []);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = (notif) => {
        if (!notif.cliente?.telefono) {
            toast.error('Cliente no tiene teléfono registrado');
            return;
        }
        const message = encodeURIComponent(notif.mensaje);
        const url = `https://wa.me/57${notif.cliente.telefono}?text=${message}`;
        window.open(url, '_blank');
        api.notificaciones.markAsEnviado(notif.id);
    };

    if (loading) {
        return (
            <SidebarLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Bienvenido {user?.nombre}</p>
                <h1 className="text-4xl font-black text-white tracking-tight">Centro de Operaciones</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatsCard label="Trámites Activos" value={stats?.tramitesActivos || "0"} trend="+12%" color="gold" />
                <StatsCard label="Urgentes" value={stats?.urgentes || "0"} trend="DCCAE" color="red" />
                <StatsCard label="Citas Hoy" value={citasHoy.length.toString()} trend={citasHoy[0]?.hora || "--"} color="blue" />
                <StatsCard label="Ingresos" value={stats?.ingresos || "$0"} trend="+8.2%" color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Centro - Trámites */}
               <div className="lg:col-span-2 space-y-8">
                    <div className="glass p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <FileText size={20} className="text-gold-500" /> Trámites Recientes
                        </h3>
                        {tramitesRecientes.length === 0 ? (
                            <p className="text-center text-xs text-military-600 font-bold uppercase py-10">Sin actividad reciente</p>
                        ) : (
                            <div className="space-y-4">
                                {tramitesRecientes.map(t => (
                                    <RecentItem 
                                        key={t.id}
                                        name={t.tipo} 
                                        type={`Cliente: ${t.cliente?.nombres} ${t.cliente?.apellidos}`} 
                                        status={t.estado === 'INICIADO' ? 'Nuevo' : t.estado === 'EN_PROCESO' ? 'Procesando' : 'Finalizado'} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass p-8 rounded-[2.5rem]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Search size={20} className="text-gold-500" /> Notificaciones CRM (Recordatorios)
                            </h3>
                            <button className="text-[10px] font-black text-military-500 hover:text-white uppercase tracking-widest">VER TODAS</button>
                        </div>
                        <div className="space-y-4">
                            {notificaciones.length === 0 ? (
                                <p className="text-military-500 text-sm text-center py-4 italic">No hay recordatorios pendientes para hoy</p>
                            ) : (
                                notificaciones.map(n => (
                                    <div key={n.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-military-900/40 border border-military-800/50 hover:border-gold-500/30 transition-all gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${n.tipo === 'CUMPLEANIOS' ? 'bg-pink-500/10 text-pink-500' : 'bg-gold-500/10 text-gold-500'}`}>
                                                {n.tipo === 'CUMPLEANIOS' ? <Plus size={18} /> : <Calendar size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-military-500 tracking-widest">{n.asunto}</p>
                                                <p className="text-xs text-white mt-1 leading-relaxed">{n.mensaje}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleWhatsApp(n)}
                                            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all whitespace-nowrap"
                                        >
                                            ENVIAR WHATSAPP
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
               </div>

               {/* Derecha - Agenda */}
               <div className="space-y-8">
                    {/* Bot WhatsApp Status Card */}
                    <div className={`glass p-6 rounded-[2.5rem] border-2 transition-all ${waStatus.status === 'CONNECTED' ? 'border-green-500/30' : 'border-gold-500/30'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Bot de WhatsApp</h4>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${waStatus.status === 'CONNECTED' ? 'bg-green-500' : 'bg-gold-500'}`} />
                        </div>
                        
                        {waStatus.status === 'CONNECTED' ? (
                            <div className="text-center py-4">
                                <ShieldCheck className="mx-auto text-green-500 mb-2" size={32} />
                                <p className="text-[10px] text-green-400 font-bold uppercase">BOT ACTIVO Y VINCULADO</p>
                            </div>
                        ) : waStatus.qrImage ? (
                            <div className="text-center space-y-3">
                                <p className="text-[10px] text-military-400 font-bold uppercase mb-2 leading-tight">DOBLE CLIC PARA AMPLIAR</p>
                                <img 
                                    src={waStatus.qrImage} 
                                    alt="QR WhatsApp" 
                                    className="mx-auto w-32 h-32 rounded-xl bg-white p-1 cursor-pointer hover:scale-105 transition-transform" 
                                    onDoubleClick={() => setShowQRModal(true)}
                                />
                                <button className="text-[9px] font-black text-gold-500 hover:text-white transition-colors">¿CÓMO VINCULAR?</button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Loader2 className="mx-auto text-military-700 animate-spin" size={24} />
                                <p className="text-[9px] text-military-500 font-bold uppercase mt-2">Iniciando motor...</p>
                            </div>
                        )}
                    </div>

                    <div className="glass p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <Calendar size={20} className="text-gold-500" /> Agenda Hoy
                        </h3>
                        {citasHoy.length === 0 ? (
                            <div className="flex flex-col items-center py-6">
                                <Search size={32} className="text-military-700 mb-3" />
                                <p className="text-military-600 text-xs font-bold uppercase tracking-widest">Sin citas programadas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {citasHoy.map((cita) => (
                                    <div key={cita.id} className="group flex items-center gap-3 p-3 bg-military-900/40 rounded-xl hover:bg-military-800 transition-colors cursor-pointer border border-transparent hover:border-military-700">
                                        <div className="text-center min-w-[50px] border-r border-military-800 pr-3">
                                            <p className="text-xs font-black text-gold-500">{cita.hora}</p>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-bold text-white text-sm">{cita.cliente ? `${cita.cliente.nombres} ${cita.cliente.apellidos}` : 'Cliente'}</h4>
                                            <p className="text-[10px] text-military-500 uppercase font-bold tracking-wider">{cita.motivo}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-military-700 group-hover:text-gold-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link 
                            to="/agenda"
                            className="w-full mt-6 py-3 border border-military-800 rounded-2xl text-[10px] font-black text-military-400 uppercase tracking-[0.2em] hover:bg-military-900 hover:text-white transition-all text-center block"
                        >
                            VER CALENDARIO COMPLETO
                        </Link>
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] bg-gold-gradient/5 border-gold-500/20 text-center">
                        <ShieldCheck className="mx-auto text-gold-500 mb-4" size={32} />
                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Backups Seguros</h4>
                        <p className="text-[10px] text-military-500 font-bold uppercase tracking-tight">Copia de seguridad realizada hoy 04:00 AM</p>
                    </div>
               </div>
            </div>

            {/* Modal para Expandir QR */}
            {showQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 animate-in fade-in zoom-in duration-300 backdrop-blur-sm">
                    <div className="relative glass p-10 rounded-[3rem] border-2 border-gold-500/30 max-w-sm w-full text-center">
                        <button 
                            onClick={() => setShowQRModal(false)}
                            className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gold-gradient text-military-950 flex items-center justify-center font-black shadow-xl hover:scale-110 transition-transform"
                        >
                            X
                        </button>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">Escanea el Código</h3>
                        <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6">
                            <img src={waStatus.qrImage} alt="QR Full" className="w-full h-auto" />
                        </div>
                        <p className="text-xs text-military-300 font-bold leading-relaxed">
                            Abre WhatsApp {'>'} Dispositivos Vinculados {'>'} Vincular Dispositivo {'>'} Escanea este código.
                        </p>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
};

const StatsCard = ({ label, value, trend, color }) => {
    const colorMap = {
        gold: 'border-gold-500',
        red: 'border-red-500',
        blue: 'border-blue-500',
        green: 'border-green-500'
    };
    return (
        <div className={`glass p-6 rounded-[2rem] border-b-4 ${colorMap[color]} hover:translate-y-[-4px] transition-all duration-300`}>
            <p className="text-military-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-white">{value}</p>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg bg-military-800 text-military-300`}>{trend}</span>
            </div>
        </div>
    );
};

const RecentItem = ({ name, type, status }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-military-900/40 border border-military-800/50 hover:border-military-600 transition-all cursor-pointer">
        <div>
            <p className="font-bold text-sm text-white">{name}</p>
            <p className="text-xs text-military-500">{type}</p>
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${status === 'Completado' ? 'bg-green-500/10 text-green-400' : 'bg-gold-500/10 text-gold-400'}`}>
            {status}
        </span>
    </div>
);

const App = () => {
    const location = useLocation();

    useEffect(() => {
        const titleMap = {
            '/': 'DGG | GestorArmas Pro - Inicio',
            '/login': 'Iniciar Sesión | DGG',
            '/register': 'Registrarse | DGG',
            '/dashboard': 'Panel de Control | DGG',
            '/portal': 'Mi Portal del Ciudadano | DGG',
            '/clientes': 'Gestión de Clientes | DGG',
            '/tramites': 'Lista de Trámites | DGG',
            '/formatos': 'Formatos Oficiales | DGG',
            '/tareas': 'Mis Tareas | DGG',
            '/agenda': 'Mi Agenda | DGG',
            '/documentos': 'Archivo Digital | DGG',
            '/caja': 'Gestión de Caja | DGG',
            '/auditoria': 'Seguridad y Auditoría | DGG',
            '/reportes': 'Reportes de Inteligencia | DGG',
            '/config': 'Configuración del Sistema | DGG',
            '/usuarios': 'Gestión de Accesos | DGG',
            '/soporte': 'Centro de Soporte | DGG'
        };
        
        let title = titleMap[location.pathname] || 'DGG | GestorArmas Pro';
        if (location.pathname.startsWith('/clientes/')) title = 'Perfil del Ciudadano | DGG';
        
        document.title = title;
    }, [location]);

    return (
        <>
            <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-military-950">
                    <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
                </div>
            }>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<LandingPage />} />
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/portal" 
                        element={
                            <ProtectedRoute roles={['CLIENTE']}>
                                <ClienteDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/clientes" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <Clientes />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/clientes/:id" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <ClientePerfil />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/tramites" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <Tramites />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/tramites/:id" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <TramiteDetalle />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/formatos" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <Formatos />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/soporte" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <Soporte />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/caja" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN']}>
                                <SidebarLayout>
                                    <Caja />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/agenda" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <Agenda />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/documentos" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <Documentos />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/config" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <Configuracion />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/usuarios" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN']}>
                                <SidebarLayout>
                                    <Usuarios />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/tareas" 
                        element={
                            <ProtectedRoute>
                                <SidebarLayout>
                                    <Tareas />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    {/* Restrict to SUPER_ADMIN for Intelligence module */}
                    <Route 
                        path="/reportes" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN']}>
                                <SidebarLayout>
                                    <Reportes />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/auditoria" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN']}>
                                <SidebarLayout>
                                    <Auditoria />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </React.Suspense>
            <NinjaSearch />
            <CookiesConsent />
        </>
    )
}

export default App
