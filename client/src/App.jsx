import React from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
const Login = React.lazy(() => import('./pages/Login'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
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
const HistorialGeneral = React.lazy(() => import('./pages/HistorialGeneral'));
import NinjaSearch from './components/common/NinjaSearch'
import CookiesConsent from './components/common/CookiesConsent'
import ProtectedRoute from './components/rbac/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { api } from './api/api'
import { useState, useEffect } from 'react'
import { Loader2, BookOpen, Wallet, FileCheck, ShieldCheck } from 'lucide-react'
import { LogOut, LayoutDashboard, Users, FileText, Calendar, DollarSign, Settings, Shield, FolderOpen, BarChart2, Search, Command, ListChecks, Plus, ChevronRight, Clock, Info } from 'lucide-react'

// Layout component to avoid repetition
// Layout component to avoid repetition
export const SidebarLayout = ({ children }) => {
    const { user, logout, isSuperAdmin } = useAuth();

    // Si el usuario es un cliente, no mostramos barra lateral (layout limpio para el portal)
    if (user?.rol === 'CLIENTE') return <div className="backoffice-light min-h-screen bg-slate-50 text-slate-800">{children}</div>;
    
    return (
        <div className="backoffice-light flex min-h-screen bg-slate-50 text-slate-800 overflow-hidden">
            {/* Light Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 z-20 shadow-xs">
                <div className="flex items-center space-x-3 mb-8">
                     <img src="/dgg_logo.png" alt="DGG Logo" className="w-10 h-10 rounded-xl object-contain shadow-xs border border-slate-100" />
                    <div>
                        <h2 className="text-xl font-black text-slate-900 leading-none">DGG</h2>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Gestión y Asesorías</span>
                    </div>
                </div>

                <div className="mb-6">
                    <button 
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 hover:border-gold-500/50 hover:bg-white transition-all shadow-2xs group"
                    >
                         <div className="flex items-center gap-3">
                            <Search size={18} className="text-slate-400 group-hover:text-gold-600 transition-colors" />
                            <span className="text-xs font-bold uppercase tracking-widest">Buscador</span>
                         </div>
                         <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[9px] font-black text-slate-600 shadow-2xs">
                            <Command size={9} />
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
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Recursos</p>
                    </div>

                    <NavItem icon={<FolderOpen size={18}/>} label="Archivo" to="/documentos" />
                    <NavItem icon={<BookOpen size={18}/>} label="Soporte" to="/soporte" />
                    
                    {isSuperAdmin && (
                        <>
                            <div className="pt-4 pb-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Administración</p>
                            </div>
                            <NavItem icon={<Wallet size={18}/>} label="Caja" to="/caja" />
                            <NavItem icon={<Clock size={18}/>} label="Historial" to="/historial" />
                            <NavItem icon={<Users size={18}/>} label="Usuarios" to="/usuarios" />
                            <NavItem icon={<ShieldCheck size={18}/>} label="Auditoría" to="/auditoria" />
                            <NavItem icon={<BarChart2 size={18}/>} label="Inteligencia" to="/reportes" />
                        </>
                    )}
                    <NavItem icon={<Settings size={18}/>} label="Ajustes" to="/config" />
                </nav>

                <div className="mt-auto pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-3 mb-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-gold-400 border border-slate-700 flex items-center justify-center font-bold text-xs shadow-xs">
                            {user?.nombre?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 truncate">{user?.nombre}</p>
                            <p className="text-[10px] text-slate-500 font-semibold truncate">{user?.rol}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="flex items-center space-x-3 w-full p-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors font-bold text-xs"
                    >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>

                    <div className="mt-3 text-center border-t border-slate-100 pt-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">Software de Gestión</p>
                        <p className="text-[9px] font-bold text-slate-500 mt-0.5">
                            Desarrollado por <span className="text-gold-600 font-extrabold">ProNext</span>
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto custom-scrollbar pt-6 bg-slate-50">
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
            className={`flex items-center space-x-3.5 px-3.5 py-2.5 rounded-2xl transition-all duration-200 group ${active ? 'bg-gold-gradient text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-medium'}`}
        >
            <span className={`${active ? 'text-slate-950' : 'text-slate-500 group-hover:text-slate-900 group-hover:scale-105'} transition-transform`}>{icon}</span>
            <span className="text-xs font-semibold">{label}</span>
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
    const [tareasPendientes, setTareasPendientes] = useState([]);
    const [lastBackup, setLastBackup] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, [location.pathname]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboardStats, tramites, citas, notifs, tasks, backupConfig] = await Promise.all([
                api.stats.getDashboard(),
                api.tramites.getAll({ limit: 5 }),
                api.citas.getAll({ fecha: new Date().toISOString().split('T')[0] }),
                api.notificaciones.getAll(5),
                api.tareas.getAll({ status: 'PENDIENTE', period: 'day' }),
                api.config.get('LAST_BACKUP_DATE').catch(() => ({ valor: null }))
            ]);
            
            setStats(dashboardStats);
            setTramitesRecientes(tramites.slice(0, 3));
            setCitasHoy(citas.slice(0, 4));
            setNotificaciones(notifs || []);
            setTareasPendientes(tasks); // Show all today's tasks (usually few)
            setLastBackup(backupConfig?.valor);
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
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-gold-600 text-xs font-bold uppercase tracking-[0.25em] mb-1">Bienvenido {user?.nombre}</p>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Centro de Operaciones</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatsCard 
                    label="Trámites Activos" 
                    value={stats?.tramitesActivos?.toString() || "0"} 
                    trend="En proceso" 
                    color="gold" 
                />
                <StatsCard 
                    label="Citas para Hoy" 
                    value={citasHoy.length.toString()} 
                    trend={citasHoy.length > 0 ? (citasHoy[0]?.hora || "Programadas") : "Al día"} 
                    color="blue" 
                />
                <StatsCard 
                    label={`Recaudo (${stats?.nombreMes ? stats.nombreMes.charAt(0).toUpperCase() + stats.nombreMes.slice(1) : 'Mes'})`} 
                    value={stats?.recaudoMes ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.recaudoMes) : "$0"} 
                    trend="Cobrado este mes" 
                    color="green" 
                />
                <StatsCard 
                    label="Cartera por Cobrar" 
                    value={stats?.carteraPendiente ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.carteraPendiente) : "$0"} 
                    trend="Saldos pendientes" 
                    color="red" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Centro - Trámites */}
               <div className="lg:col-span-2 space-y-8">
                    <div className="glass p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                            <FileText size={20} className="text-gold-600" /> Trámites Recientes
                        </h3>
                        {tramitesRecientes.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 font-bold uppercase py-10">Sin actividad reciente</p>
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

                    <div className="glass p-8 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <ListChecks size={20} className="text-gold-600" /> Tareas y Recordatorios Activos
                            </h3>
                            <Link to="/tareas" className="text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest">VER TODAS</Link>
                        </div>
                        <div className="space-y-4">
                            {tareasPendientes.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-4 italic">No hay tareas pendientes en el radar</p>
                            ) : (
                                tareasPendientes.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-gold-500/40 transition-all border-l-4 border-l-gold-500 shadow-2xs">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-amber-50 text-gold-600 border border-amber-200/60">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Límite: {new Date(task.fechaLimite).toLocaleDateString()}</p>
                                                <p className="text-sm font-bold text-slate-900 mt-1 leading-relaxed">{task.titulo}</p>
                                                <p className="text-xs text-slate-500 mt-1">{task.descripcion}</p>
                                            </div>
                                        </div>
                                        <Link 
                                            to={task.tramiteId ? `/tramites/${task.tramiteId}` : '/tareas'}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-gold-500 hover:text-slate-950 transition-all shadow-xs"
                                        >
                                            GESTIONAR
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
               </div>

               {/* Derecha - Agenda */}
               <div className="space-y-8">
                    {/* Resumen de Historial Card */}
                    <div className="glass p-6 rounded-3xl border border-slate-200 mb-6 bg-white shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} className="text-gold-600" /> Registro de Actividad
                            </h4>
                        </div>
                        <div className="space-y-4">
                            {notificaciones.slice(0, 3).map(n => (
                                <div key={n.id} className="border-l-2 border-slate-200 pl-4 py-1">
                                    <p className="text-[11px] font-bold text-slate-800 uppercase truncate">{n.asunto}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.fechaEnvio).toLocaleDateString()}</p>
                                </div>
                            ))}
                            <Link to="/historial" className="text-[10px] font-black text-gold-600 hover:underline uppercase block mt-4">IR AL HISTORIAL COMPLETO</Link>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                            <Calendar size={20} className="text-gold-600" /> Agenda Hoy
                        </h3>
                        {citasHoy.length === 0 ? (
                            <div className="flex flex-col items-center py-6">
                                <Search size={32} className="text-slate-300 mb-3" />
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sin citas programadas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {citasHoy.map((cita) => (
                                    <div key={cita.id} className="group flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200">
                                        <div className="text-center min-w-[50px] border-r border-slate-200 pr-3">
                                            <p className="text-xs font-black text-gold-600">{cita.hora}</p>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-bold text-slate-900 text-sm">{cita.cliente ? `${cita.cliente.nombres} ${cita.cliente.apellidos}` : 'Cliente'}</h4>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{cita.motivo}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-400 group-hover:text-gold-600 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link 
                            to="/agenda"
                            className="w-full mt-6 py-3 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-slate-900 transition-all text-center block shadow-2xs"
                        >
                            VER CALENDARIO COMPLETO
                        </Link>
                    </div>

                    <div className="glass p-8 rounded-3xl bg-amber-50/50 border border-amber-200/60 text-center shadow-xs">
                        <ShieldCheck className="mx-auto text-gold-600 mb-3" size={32} />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1.5">Backups Seguros</h4>
                        <p className="text-[11px] text-slate-500 font-medium tracking-tight">
                            {lastBackup ? `Última copia exitosa: ${new Date(lastBackup).toLocaleString()}` : 'Configurando sistema de backups...'}
                        </p>
                    </div>
               </div>
            </div>

        </SidebarLayout>
    );
};

const StatsCard = ({ label, value, trend, color }) => {
    const colorMap = {
        gold: 'border-gold-500 bg-amber-50/30',
        red: 'border-rose-500 bg-rose-50/30',
        blue: 'border-blue-500 bg-blue-50/30',
        green: 'border-emerald-500 bg-emerald-50/30'
    };
    return (
        <div className={`glass p-6 rounded-3xl border-b-4 ${colorMap[color]} shadow-xs hover:shadow-md hover:translate-y-[-2px] transition-all duration-300`}>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-slate-900">{value}</p>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">{trend}</span>
            </div>
        </div>
    );
};

const RecentItem = ({ name, type, status }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all cursor-pointer shadow-2xs">
        <div>
            <p className="font-bold text-sm text-slate-900">{name}</p>
            <p className="text-xs text-slate-500">{type}</p>
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${status === 'Completado' || status === 'Finalizado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
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
            '/forgot-password': 'Recuperar Contraseña | DGG',
            '/reset-password': 'Nueva Contraseña | DGG',
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
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
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
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
                                <SidebarLayout>
                                    <Clientes />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/clientes/:id" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
                                <SidebarLayout>
                                    <ClientePerfil />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/tramites" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
                                <SidebarLayout>
                                    <Tramites />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/tramites/:id" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION', 'CLIENTE']}>
                                <SidebarLayout>
                                    <TramiteDetalle />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/formatos" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
                                <SidebarLayout>
                                    <Formatos />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/soporte" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
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
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
                                <SidebarLayout>
                                    <Agenda />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/documentos" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
                                <SidebarLayout>
                                    <Documentos />
                                </SidebarLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/config" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN']}>
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
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
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
                    <Route 
                        path="/historial" 
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN', 'GESTION']}>
                                <SidebarLayout>
                                    <HistorialGeneral />
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
