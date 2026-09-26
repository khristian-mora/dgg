import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Phone, Mail, Award, ArrowUpRight, Loader2, Trash2, LayoutGrid, List, UserCheck, Users, UserX, Target, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'
import toast from 'react-hot-toast'

const Clientes = () => {
    const { user, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
    const [statusFilter, setStatusFilter] = useState('activos'); // 'activos' | 'todos' | 'prospectos' | 'inactivos'
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        cedula: '',
        fechaExpedicionCC: '',
        lugarExpedicionCC: '',
        nacionalidad: 'COLOMBIANA',
        telefono: '',
        email: '',
        direccion: '',
        barrio: '',
        ciudad: '',
        departamento: '',
        fechaNacimiento: '',
        sexo: 'MASCULINO',
        estadoCivil: '',
        nivelAcademico: '',
        tipo: 'CLIENTE'
    });

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const data = await api.clientes.getAll();
            setClientes(data);
        } catch (error) {
            console.error('Error fetching clientes:', error);
            toast.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCliente = async (e) => {
        e.preventDefault();
        try {
            await api.clientes.create(formData);
            toast.success('Cliente creado exitosamente');
            setShowModal(false);
            setFormData({ 
                nombres: '', apellidos: '', cedula: '', 
                fechaExpedicionCC: '', lugarExpedicionCC: '',
                nacionalidad: 'COLOMBIANA',
                telefono: '', email: '', direccion: '', 
                barrio: '', ciudad: '', departamento: '',
                fechaNacimiento: '', sexo: 'MASCULINO',
                estadoCivil: '', nivelAcademico: '',
                tipo: 'CLIENTE' 
            });
            fetchClientes();
        } catch (error) {
            toast.error(error.message || 'Error al crear cliente');
        }
    };

    const handleToggleEstado = async (cliente, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const isCurrentlyActivo = cliente.estado === 'ACTIVO';
        const nuevoEstado = isCurrentlyActivo ? 'INACTIVO' : 'ACTIVO';
        
        try {
            await api.clientes.setEstado(cliente.id, nuevoEstado);
            toast.success(nuevoEstado === 'ACTIVO' ? `¡Cliente ${cliente.nombres} activado!` : `Cliente ${cliente.nombres} movido a inactivos`);
            setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, estado: nuevoEstado } : c));
            if (activeMenu) setActiveMenu(null);
        } catch (err) {
            toast.error('Error al actualizar estado del cliente');
        }
    };

    const handleMarcarTodosInactivos = async () => {
        const confirmed = window.confirm('¿Deseas mover TODOS los clientes activos a estado INACTIVO para hacer una revisión y activarlos uno por uno?');
        if (!confirmed) return;
        try {
            toast.loading('Moviendo clientes a Inactivos...', { id: 'depurar' });
            const res = await api.clientes.marcarTodosInactivos();
            toast.success(res.message || 'Clientes actualizados', { id: 'depurar' });
            fetchClientes();
            setStatusFilter('inactivos');
        } catch (err) {
            toast.error('Error al actualizar clientes', { id: 'depurar' });
        }
    };

    // Conteos rápidos para las pestañas
    const countActivos = clientes.filter(c => (c.estado === 'ACTIVO' || !c.estado) && c.tipoCliente !== 'PROSPECTO' && c.tipo !== 'PROSPECTO').length;
    const countTodos = clientes.length;
    const countProspectos = clientes.filter(c => c.tipoCliente === 'PROSPECTO' || c.tipo === 'PROSPECTO').length;
    const countInactivos = clientes.filter(c => c.estado === 'INACTIVO').length;

    const filteredClientes = clientes.filter(c => {
        const matchesSearch = 
            c.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.cedula?.includes(searchTerm) ||
            c.telefono?.includes(searchTerm) ||
            c.ciudad?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        const isProspecto = c.tipoCliente === 'PROSPECTO' || c.tipo === 'PROSPECTO';
        const isActivo = (c.estado === 'ACTIVO' || !c.estado) && !isProspecto;
        const isInactivo = c.estado === 'INACTIVO';

        if (statusFilter === 'activos') return isActivo;
        if (statusFilter === 'prospectos') return isProspecto;
        if (statusFilter === 'inactivos') return isInactivo;
        return true; // 'todos'
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Directorio de Confianza</p>
                   <h1 className="text-4xl font-black text-white tracking-tight">Gestión de Clientes</h1>
                </div>
                
                <div className="flex items-center gap-3">
                    {isSuperAdmin && (
                        <button 
                            onClick={handleMarcarTodosInactivos}
                            className="flex items-center justify-center space-x-2 px-4 py-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-bold text-xs rounded-2xl shadow-xs transition-all"
                            title="Mover todos los clientes a Inactivos para depuración manual"
                        >
                            <UserX size={16} />
                            <span>DEJAR TODOS EN INACTIVOS</span>
                        </button>
                    )}
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center space-x-2 px-6 py-4 bg-gold-gradient text-military-950 font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                        <span>NUEVO CLIENTE</span>
                    </button>
                </div>
            </div>

            {/* Pestañas de Segmentación de Clientes */}
            <div className="flex flex-wrap gap-3 p-1.5 glass rounded-2xl border border-military-100/10">
                <button
                    onClick={() => setStatusFilter('activos')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
                        statusFilter === 'activos'
                            ? 'bg-gold-gradient text-military-950 shadow-md font-black'
                            : 'text-military-400 hover:text-military-100 hover:bg-military-900/50'
                    }`}
                >
                    <UserCheck size={16} />
                    <span>CLIENTES ACTIVOS</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        statusFilter === 'activos' ? 'bg-military-950/20 text-military-950' : 'bg-military-800 text-military-300'
                    }`}>
                        {countActivos}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter('todos')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
                        statusFilter === 'todos'
                            ? 'bg-gold-gradient text-military-950 shadow-md font-black'
                            : 'text-military-400 hover:text-military-100 hover:bg-military-900/50'
                    }`}
                >
                    <Users size={16} />
                    <span>TODOS LOS REGISTROS</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        statusFilter === 'todos' ? 'bg-military-950/20 text-military-950' : 'bg-military-800 text-military-300'
                    }`}>
                        {countTodos}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter('prospectos')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
                        statusFilter === 'prospectos'
                            ? 'bg-gold-gradient text-military-950 shadow-md font-black'
                            : 'text-military-400 hover:text-military-100 hover:bg-military-900/50'
                    }`}
                >
                    <Target size={16} />
                    <span>PROSPECTOS WEB</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        statusFilter === 'prospectos' ? 'bg-military-950/20 text-military-950' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                        {countProspectos}
                    </span>
                </button>

                <button
                    onClick={() => setStatusFilter('inactivos')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
                        statusFilter === 'inactivos'
                            ? 'bg-gold-gradient text-military-950 shadow-md font-black'
                            : 'text-military-400 hover:text-military-100 hover:bg-military-900/50'
                    }`}
                >
                    <UserX size={16} />
                    <span>INACTIVOS / ARCHIVADOS</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        statusFilter === 'inactivos' ? 'bg-military-950/20 text-military-950' : 'bg-military-800 text-military-300'
                    }`}>
                        {countInactivos}
                    </span>
                </button>
            </div>

            {/* Barra de Búsqueda y Switch de Vista */}
            <div className="glass p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-military-500 group-focus-within:text-gold-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder={`Buscar en ${statusFilter === 'activos' ? 'clientes activos' : statusFilter === 'prospectos' ? 'prospectos' : statusFilter === 'inactivos' ? 'inactivos' : 'todos'} por nombre, cédula o teléfono...`} 
                        className="w-full pl-12 pr-4 py-3 bg-military-950/40 border border-military-800 rounded-2xl focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex bg-military-950/50 p-1 rounded-2xl border border-military-800">
                        <button 
                            onClick={() => setViewType('grid')}
                            className={`p-2 rounded-xl transition-all ${viewType === 'grid' ? 'bg-gold-500 text-military-950 shadow-lg' : 'text-military-500 hover:text-military-300'}`}
                            title="Vista Cuadrícula"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button 
                            onClick={() => setViewType('list')}
                            className={`p-2 rounded-xl transition-all ${viewType === 'list' ? 'bg-gold-500 text-military-950 shadow-lg' : 'text-military-500 hover:text-military-300'}`}
                            title="Vista Lista"
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
            ) : filteredClientes.length === 0 ? (
                <div className="text-center py-20 glass rounded-3xl p-10">
                    <p className="text-military-500 font-bold text-sm">
                        {statusFilter === 'activos' && 'No hay clientes activos registrados'}
                        {statusFilter === 'prospectos' && 'No hay prospectos web pendientes'}
                        {statusFilter === 'inactivos' && 'No hay clientes inactivos o archivados'}
                        {statusFilter === 'todos' && 'No hay registros en el directorio'}
                    </p>
                </div>
            ) : viewType === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClientes.map((c) => (
                        <div key={c.id} className="glass p-6 rounded-[2.5rem] border border-military-100/10 hover:border-gold-500/20 transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 rounded-2xl bg-military-800 border-2 border-military-700 flex items-center justify-center text-xl font-bold text-white group-hover:border-gold-500/50 transition-colors">
                                        {c.nombres?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white leading-tight">{c.nombres} {c.apellidos}</h4>
                                            {c.user ? (
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Portal Activo" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-military-700" title="Sin Acceso al Portal" />
                                            )}
                                        </div>
                                        <p className="text-xs text-military-500 mt-1 uppercase tracking-wider">{c.cedula}</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenu(activeMenu === c.id ? null : c.id);
                                        }}
                                        className={`p-2 rounded-xl transition-all ${activeMenu === c.id ? 'bg-gold-500 text-military-950' : 'text-military-500 hover:text-gold-500 hover:bg-military-800'}`}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {activeMenu === c.id && (
                                        <div className="absolute right-0 mt-2 w-48 glass rounded-[1.5rem] border border-military-100/10 shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button 
                                                onClick={() => navigate(`/clientes/${c.id}`)}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white hover:bg-gold-500/10 hover:text-gold-500 transition-all text-left"
                                            >
                                                <ArrowUpRight size={14} /> VER EXPEDIENTE
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const phone = c.telefono?.replace(/\D/g, '');
                                                    window.open(`https://wa.me/57${phone}`, '_blank');
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white hover:bg-green-500/10 hover:text-green-500 transition-all text-left"
                                            >
                                                <Phone size={14} /> ENVIAR WHATSAPP
                                            </button>
                                            <div className="h-px bg-military-800 my-1 mx-4" />
                                            {isSuperAdmin && (
                                                <>
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const isActivo = c.estado === 'ACTIVO';
                                                            const confirmed = window.confirm(`¿Deseas ${isActivo ? 'DESACTIVAR' : 'ACTIVAR'} a ${c.nombres} ${c.apellidos}?`);
                                                            if (confirmed) {
                                                                try {
                                                                    await api.clientes.delete(c.id);
                                                                    toast.success(isActivo ? 'Cliente desactivado' : 'Cliente activado');
                                                                    fetchClientes();
                                                                    setActiveMenu(null);
                                                                } catch (err) {
                                                                    toast.error('Error al cambiar estado');
                                                                }
                                                            }
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold ${c.estado === 'ACTIVO' ? 'text-military-400 hover:text-military-100' : 'text-green-500 hover:bg-green-500/10'} hover:bg-military-800 transition-all text-left`}
                                                    >
                                                        {c.estado === 'ACTIVO' ? <Trash2 size={14} /> : <ArrowUpRight size={14} />} 
                                                        {c.estado === 'ACTIVO' ? 'DESACTIVAR CLIENTE' : 'ACTIVAR CLIENTE'}
                                                    </button>

                                                    <button 
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const confirmed = window.confirm(`¡ATENCIÓN! ¿Seguro que deseas ELIMINAR PERMANENTEMENTE a ${c.nombres} ${c.apellidos}? Esta acción borrará todas sus armas, trámites, documentos y fotos para siempre.`);
                                                            if (confirmed) {
                                                                const secondConfirmed = window.confirm('¿ESTÁS TOTALMENTE SEGURO? Esta acción es irreversible.');
                                                                if (secondConfirmed) {
                                                                    try {
                                                                        await api.clientes.hardDelete(c.id);
                                                                        toast.success('Cliente eliminado permanentemente');
                                                                        fetchClientes();
                                                                        setActiveMenu(null);
                                                                    } catch (err) {
                                                                        toast.error('Error en eliminación permanente');
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all text-left"
                                                    >
                                                        <Trash2 size={14} className="animate-pulse" /> ¡ELIMINAR PERMANENTE!
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center space-x-3 text-sm text-military-300">
                                    <Phone size={14} className="text-gold-500" />
                                    <span>{c.telefono}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-military-300">
                                    <Award size={14} className="text-gold-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{c.tipoCliente || c.tipo}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-military-100/10">
                                <div className="flex items-center gap-2">
                                    <div className={`flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider ${c.estado === 'ACTIVO' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        <div className={`w-2 h-2 rounded-full ${c.estado === 'ACTIVO' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                        <span>{c.estado || 'ACTIVO'}</span>
                                    </div>
                                    {c.estado === 'INACTIVO' ? (
                                        <button 
                                            onClick={(e) => handleToggleEstado(c, e)}
                                            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs hover:scale-105 cursor-pointer"
                                            title="Pasar a Cliente Activo"
                                        >
                                            <CheckCircle2 size={12} />
                                            <span>ACTIVAR</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={(e) => handleToggleEstado(c, e)}
                                            className="px-2 py-0.5 rounded text-[9px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                            title="Mover a Inactivos"
                                        >
                                            Desactivar
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    {c.tipo === 'PROSPECTO' && (
                                        <button 
                                            onClick={() => navigate('/tramites')}
                                            className="flex items-center space-x-1 bg-gold-500/10 hover:bg-gold-500/20 text-gold-500 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border border-gold-500/20"
                                        >
                                            <Plus size={12} />
                                            <span>INICIAR TRÁMITE</span>
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => navigate(`/clientes/${c.id}`)}
                                        className="flex items-center space-x-1 text-military-100 hover:text-gold-500 text-xs font-bold transition-colors"
                                    >
                                        <span>VER PERFIL</span>
                                        <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass overflow-hidden rounded-[2rem] border border-military-100/10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-military-900/50 border-b border-military-800">
                                    <th className="px-6 py-4 text-xs font-black text-gold-500 uppercase tracking-widest">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-black text-gold-500 uppercase tracking-widest">Cédula</th>
                                    <th className="px-6 py-4 text-xs font-black text-gold-500 uppercase tracking-widest">Teléfono</th>
                                    <th className="px-6 py-4 text-xs font-black text-gold-500 uppercase tracking-widest">Categoría</th>
                                    <th className="px-6 py-4 text-xs font-black text-gold-500 uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-4 text-xs font-black text-gold-500 uppercase tracking-widest text-center">Portal</th>
                                    <th className="px-6 py-4 text-xs font-black text-gold-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-military-800/50">
                                {filteredClientes.map((c) => (
                                    <tr key={c.id} className="hover:bg-military-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-military-800 border border-military-700 flex items-center justify-center font-bold text-white group-hover:border-gold-500/50 transition-all">
                                                    {c.nombres?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white leading-none whitespace-nowrap">{c.nombres} {c.apellidos}</p>
                                                    {c.email && <p className="text-[10px] text-military-500 mt-1">{c.email}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-military-300 font-mono tracking-wider">{c.cedula}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-military-300">
                                                <Phone size={12} className="text-gold-500" />
                                                <span className="text-sm">{c.telefono}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-military-800 border border-military-700 rounded-lg text-[10px] font-black text-military-100 uppercase tracking-widest">
                                                {c.tipoCliente || c.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider ${c.estado === 'ACTIVO' ? 'text-green-500' : 'text-military-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${c.estado === 'ACTIVO' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-military-500'}`} />
                                                <span>{c.estado || 'ACTIVO'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {c.user ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-tighter">Activo</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-military-800 text-military-500 border border-military-700 uppercase tracking-tighter">Inactivo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {c.estado === 'INACTIVO' ? (
                                                    <button 
                                                        onClick={(e) => handleToggleEstado(c, e)}
                                                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs hover:scale-105 cursor-pointer"
                                                        title="Pasar a Cliente Activo"
                                                    >
                                                        <CheckCircle2 size={13} />
                                                        <span>ACTIVAR</span>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={(e) => handleToggleEstado(c, e)}
                                                        className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-all cursor-pointer"
                                                        title="Mover a Inactivos"
                                                    >
                                                        Desactivar
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => navigate(`/clientes/${c.id}`)}
                                                    className="p-2 text-military-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-all"
                                                    title="Ver Perfil"
                                                >
                                                    <ArrowUpRight size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const phone = c.telefono?.replace(/\D/g, '');
                                                        window.open(`https://wa.me/57${phone}`, '_blank');
                                                    }}
                                                    className="p-2 text-military-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-all"
                                                    title="WhatsApp"
                                                >
                                                    <Phone size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="glass p-8 rounded-[2rem] w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-6">Nuevo Cliente</h3>
                        <form onSubmit={handleCreateCliente} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Nombres</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Apellidos</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Cédula</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.cedula}
                                        onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Nacionalidad</label>
                                    <select 
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white outline-none focus:border-gold-500 appearance-none scrollbar-thin scrollbar-thumb-gold-500"
                                        value={formData.nacionalidad}
                                        onChange={(e) => setFormData({...formData, nacionalidad: e.target.value})}
                                    >
                                        <option value="COLOMBIANA">COLOMBIANA</option>
                                        <option value="AFGANA">AFGANA</option>
                                        <option value="ALBANESA">ALBANESA</option>
                                        <option value="ALEMANA">ALEMANA</option>
                                        <option value="ANDORRANA">ANDORRANA</option>
                                        <option value="ANGOLEÑA">ANGOLEÑA</option>
                                        <option value="ARGELINA">ARGELINA</option>
                                        <option value="ARGENTINA">ARGENTINA</option>
                                        <option value="ARMENIA">ARMENIA</option>
                                        <option value="AUSTRALIANA">AUSTRALIANA</option>
                                        <option value="AUSTRIACA">AUSTRIACA</option>
                                        <option value="AZERBAIYANA">AZERBAIYANA</option>
                                        <option value="BAHAMENSE">BAHAMENSE</option>
                                        <option value="BAREINÍ">BAREINÍ</option>
                                        <option value="BANGLADESÍ">BANGLADESÍ</option>
                                        <option value="BARBADENSE">BARBADENSE</option>
                                        <option value="BELGA">BELGA</option>
                                        <option value="BELICEÑA">BELICEÑA</option>
                                        <option value="BENINÉSA">BENINÉSA</option>
                                        <option value="BIELORRUSA">BIELORRUSA</option>
                                        <option value="BOLIVIANA">BOLIVIANA</option>
                                        <option value="BOSNIA">BOSNIA</option>
                                        <option value="BOTSUANA">BOTSUANA</option>
                                        <option value="BRASILEÑA">BRASILEÑA</option>
                                        <option value="BRUNEANA">BRUNEANA</option>
                                        <option value="BÚLGARA">BÚLGARA</option>
                                        <option value="BURKINABÉ">BURKINABÉ</option>
                                        <option value="BURUNDÉSA">BURUNDÉSA</option>
                                        <option value="BUTANÉSA">BUTANÉSA</option>
                                        <option value="CABOVERDIANA">CABOVERDIANA</option>
                                        <option value="CAMBOYANA">CAMBOYANA</option>
                                        <option value="CAMERUNÉSA">CAMERUNÉSA</option>
                                        <option value="CANADIENSE">CANADIENSE</option>
                                        <option value="CATARÍ">CATARÍ</option>
                                        <option value="CHADIANA">CHADIANA</option>
                                        <option value="CHILENA">CHILENA</option>
                                        <option value="CHINA">CHINA</option>
                                        <option value="CHIPRIOTA">CHIPRIOTA</option>
                                        <option value="COMORENSE">COMORENSE</option>
                                        <option value="CONGOLEÑA">CONGOLEÑA</option>
                                        <option value="COSTARRICENSE">COSTARRICENSE</option>
                                        <option value="CROATA">CROATA</option>
                                        <option value="CUBANA">CUBANA</option>
                                        <option value="DANÉSA">DANÉSA</option>
                                        <option value="DOMINICANA">DOMINICANA</option>
                                        <option value="ECUATORIANA">ECUATORIANA</option>
                                        <option value="EGIPCIA">EGIPCIA</option>
                                        <option value="EMIRATÍ">EMIRATÍ</option>
                                        <option value="ESLOVACA">ESLOVACA</option>
                                        <option value="ESLOVENA">ESLOVENA</option>
                                        <option value="ESPAÑOLA">ESPAÑOLA</option>
                                        <option value="ESTADOUNIDENSE">ESTADOUNIDENSE</option>
                                        <option value="ESTONIA">ESTONIA</option>
                                        <option value="ETÍOPE">ETÍOPE</option>
                                        <option value="FILIPINA">FILIPINA</option>
                                        <option value="FINLANDÉSA">FINLANDÉSA</option>
                                        <option value="FRANCÉSA">FRANCÉSA</option>
                                        <option value="GABONÉSA">GABONÉSA</option>
                                        <option value="GAMBIANA">GAMBIANA</option>
                                        <option value="GEORGIANA">GEORGIANA</option>
                                        <option value="GHANÉSA">GHANÉSA</option>
                                        <option value="GRANADINA">GRANADINA</option>
                                        <option value="GRIEGA">GRIEGA</option>
                                        <option value="GUATEMALTECA">GUATEMALTECA</option>
                                        <option value="GUINEANA">GUINEANA</option>
                                        <option value="GUYANÉSA">GUYANÉSA</option>
                                        <option value="HAITIANA">HAITIANA</option>
                                        <option value="HONDUREÑA">HONDUREÑA</option>
                                        <option value="HÚNGARA">HÚNGARA</option>
                                        <option value="INDIA">INDIA</option>
                                        <option value="INDONESIA">INDONESIA</option>
                                        <option value="IRAQUÍ">IRAQUÍ</option>
                                        <option value="IRANÍ">IRANÍ</option>
                                        <option value="IRLANDÉSA">IRLANDÉSA</option>
                                        <option value="ISLANDÉSA">ISLANDÉSA</option>
                                        <option value="ISRAELÍ">ISRAELÍ</option>
                                        <option value="ITALIANA">ITALIANA</option>
                                        <option value="JAMAIQUINA">JAMAIQUINA</option>
                                        <option value="JAPONÉSA">JAPONÉSA</option>
                                        <option value="JORDANA">JORDANA</option>
                                        <option value="KAZAJA">KAZAJA</option>
                                        <option value="KENIANA">KENIANA</option>
                                        <option value="KIRGUISA">KIRGUISA</option>
                                        <option value="KUWAITÍ">KUWAITÍ</option>
                                        <option value="LAOSIANA">LAOSIANA</option>
                                        <option value="LESOTENSE">LESOTENSE</option>
                                        <option value="LETONA">LETONA</option>
                                        <option value="LIBANÉSA">LIBANÉSA</option>
                                        <option value="LIBERIANA">LIBERIANA</option>
                                        <option value="LIBIA">LIBIA</option>
                                        <option value="LITUANA">LITUANA</option>
                                        <option value="LUXEMBURGUESA">LUXEMBURGUESA</option>
                                        <option value="MACEDONIA">MACEDONIA</option>
                                        <option value="MADAGASCO">MADAGASCO</option>
                                        <option value="MALASIA">MALASIA</option>
                                        <option value="MALAUI">MALAUI</option>
                                        <option value="MALDIVA">MALDIVA</option>
                                        <option value="MALIENSE">MALIENSE</option>
                                        <option value="MALTÉSA">MALTÉSA</option>
                                        <option value="MARROQUÍ">MARROQUÍ</option>
                                        <option value="MAURICIANA">MAURICIANA</option>
                                        <option value="MAURITANA">MAURITANA</option>
                                        <option value="MEXICANA">MEXICANA</option>
                                        <option value="MICRONESIA">MICRONESIA</option>
                                        <option value="MOLDAVA">MOLDAVA</option>
                                        <option value="MONEGASCA">MONEGASCA</option>
                                        <option value="MONGOLA">MONGOLA</option>
                                        <option value="MONTENEGRINA">MONTENEGRINA</option>
                                        <option value="MOZAMBIQUEÑA">MOZAMBIQUEÑA</option>
                                        <option value="NAMIBIA">NAMIBIA</option>
                                        <option value="NAURUANA">NAURUANA</option>
                                        <option value="NEPALÍ">NEPALÍ</option>
                                        <option value="NICARAGÜENSE">NICARAGÜENSE</option>
                                        <option value="NIGERIANA">NIGERIANA</option>
                                        <option value="NORCOREANA">NORCOREANA</option>
                                        <option value="NORUEGA">NORUEGA</option>
                                        <option value="NEOZELANDÉSA">NEOZELANDÉSA</option>
                                        <option value="OMANÍ">OMANÍ</option>
                                        <option value="PAQUISTANÍ">PAQUISTANÍ</option>
                                        <option value="PALAUANA">PALAUANA</option>
                                        <option value="PANAMEÑA">PANAMEÑA</option>
                                        <option value="PARAGUAYA">PARAGUAYA</option>
                                        <option value="PERUANA">PERUANA</option>
                                        <option value="POLACA">POLACA</option>
                                        <option value="PORTUGUÉSA">PORTUGUÉSA</option>
                                        <option value="REINO UNIDO">REINO UNIDO</option>
                                        <option value="RUSA">RUSA</option>
                                        <option value="SALVADOREÑA">SALVADOREÑA</option>
                                        <option value="SENEGALÉSA">SENEGALÉSA</option>
                                        <option value="SERBIA">SERBIA</option>
                                        <option value="SIRIA">SIRIA</option>
                                        <option value="SOMALÍ">SOMALÍ</option>
                                        <option value="SUDANÉSA">SUDANÉSA</option>
                                        <option value="SUECA">SUECA</option>
                                        <option value="SUIZA">SUIZA</option>
                                        <option value="SURCOREANA">SURCOREANA</option>
                                        <option value="TAILANDÉSA">TAILANDÉSA</option>
                                        <option value="TAIWANÉSA">TAIWANÉSA</option>
                                        <option value="TANZANA">TANZANA</option>
                                        <option value="TUNECINA">TUNECINA</option>
                                        <option value="TURCA">TURCA</option>
                                        <option value="UCRANIANA">UCRANIANA</option>
                                        <option value="UGANDÉSA">UGANDÉSA</option>
                                        <option value="URUGUAYA">URUGUAYA</option>
                                        <option value="UZBEKA">UZBEKA</option>
                                        <option value="VANUATUENSE">VANUATUENSE</option>
                                        <option value="VENEZOLANA">VENEZOLANA</option>
                                        <option value="VIETNAMITA">VIETNAMITA</option>
                                        <option value="YEMENÍ">YEMENÍ</option>
                                        <option value="ZAMBIANA">ZAMBIANA</option>
                                        <option value="ZIMBABUENSE">ZIMBABUENSE</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Expedición Cédula</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.fechaExpedicionCC}
                                        onChange={(e) => setFormData({...formData, fechaExpedicionCC: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Lugar Expedición</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.lugarExpedicionCC}
                                        placeholder="Ej: Barrancabermeja"
                                        onChange={(e) => setFormData({...formData, lugarExpedicionCC: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Teléfono</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Fecha Nacimiento</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.fechaNacimiento}
                                        onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Género</label>
                                    <select 
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.sexo}
                                        onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                                    >
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMENINO">Femenino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Dirección</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Barrio</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                        value={formData.barrio}
                                        onChange={(e) => setFormData({...formData, barrio: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-military-400 font-bold uppercase">Ciudad / Dpto</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="w-1/2 p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                            value={formData.ciudad}
                                            placeholder="Cdad"
                                            onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                                        />
                                        <input 
                                            type="text" 
                                            className="w-1/2 p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                            value={formData.departamento}
                                            placeholder="Dpto"
                                            onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-military-400 font-bold uppercase">Tipo</label>
                                <select 
                                    className="w-full p-3 bg-military-950 border border-military-800 rounded-xl text-white"
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                                >
                                    <option value="CLIENTE">Cliente</option>
                                    <option value="PROSPECTO">Prospecto</option>
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
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Clientes
