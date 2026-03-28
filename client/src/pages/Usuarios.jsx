import React, { useState, useEffect } from 'react'
import { Plus, User, Shield, Key, Trash2, Mail, Edit2, Loader2, CheckCircle2, Clock, History } from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Usuarios = () => {
    const { user: currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        password: '',
        rol: 'GESTION'
    });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const data = await api.users.getAll();
            setUsuarios(data);
        } catch (error) {
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.users.update(selectedUser.id, formData);
                toast.success('Usuario actualizado');
            } else {
                await api.users.create(formData);
                toast.success('Acceso creado exitosamente');
            }
            setShowModal(false);
            fetchUsuarios();
        } catch (error) {
            toast.error(error.message || 'Error en la operación');
        }
    };

    const handleDelete = async (id) => {
        if (id === currentUser.id) return toast.error('No puedes eliminar tu propia cuenta');
        if (window.confirm('¿Eliminar este acceso administrativamente?')) {
            try {
                await api.users.delete(id);
                toast.success('Acceso revocado');
                fetchUsuarios();
            } catch (error) {
                toast.error('Error al borrar');
            }
        }
    };

    const filteredUsuarios = usuarios.filter(u => {
        if (activeTab === 'ALL') return true;
        return u.rol === activeTab;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Administración de Accesos</p>
                   <h1 className="text-4xl font-black text-white tracking-tight italic text-shadow-gold">EQUIPO & SEGURIDAD</h1>
                </div>
                
                <button 
                    onClick={() => {
                        setIsEdit(false);
                        setFormData({ nombre: '', apellido: '', password: '', rol: 'GESTION' });
                        setShowModal(true);
                    }}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-gold-gradient text-military-950 font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    <span>CREAR ACCESO</span>
                </button>
            </div>

            {/* Pestañas de Filtrado */}
            <div className="flex bg-military-900/40 p-1.5 rounded-2xl border border-military-800 w-fit">
                {['ALL', 'SUPER_ADMIN', 'GESTION', 'CLIENTE'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab 
                            ? 'bg-gold-gradient text-military-950 shadow-lg' 
                            : 'text-military-500 hover:text-white'
                        }`}
                    >
                        {tab === 'ALL' ? 'Todos' : tab === 'SUPER_ADMIN' ? 'Admins' : tab === 'GESTION' ? 'Gestores' : 'Clientes'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsuarios.map((u) => (
                        <div key={u.id} className="glass p-8 rounded-[2.5rem] border border-military-100/10 hover:border-gold-500/20 transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold bg-military-800 border-2 ${
                                        u.rol === 'SUPER_ADMIN' ? 'border-gold-500 text-gold-500 shadow-[0_0_15px_rgba(213,161,21,0.2)]' : 
                                        u.rol === 'CLIENTE' ? 'border-emerald-500 text-emerald-500' :
                                        'border-military-700 text-military-400'
                                    }`}>
                                        {u.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg lowercase">{u.nombre}</h4>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Shield size={12} className={
                                                u.rol === 'SUPER_ADMIN' ? 'text-gold-500' : 
                                                u.rol === 'CLIENTE' ? 'text-emerald-500' : 
                                                'text-military-500'
                                            } />
                                            <span className={`text-[10px] font-black tracking-widest uppercase ${
                                                u.rol === 'SUPER_ADMIN' ? 'text-gold-500' : 
                                                u.rol === 'CLIENTE' ? 'text-emerald-500' : 
                                                'text-military-500'
                                            }`}>{u.rol}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center space-x-3 text-sm text-military-300">
                                    <User size={14} className="text-gold-500" />
                                    <span className="font-mono">@{u.nombre}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-[10px] text-military-500 font-black uppercase tracking-widest">
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    <span>Acceso: {u.isActive ? 'Habilitado' : 'Suspendido'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-military-100/10">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setIsEdit(true);
                                            setSelectedUser(u);
                                            const parts = u.nombre.split('.');
                                            setFormData({ 
                                                nombre: parts[0] || u.nombre, 
                                                apellido: parts[1] || '', 
                                                rol: u.rol,
                                                password: '' 
                                            });
                                            setShowModal(true);
                                        }}
                                        className="p-3 bg-military-800 rounded-xl text-military-300 hover:text-gold-500 transition-all"
                                        title="Editar Usuario"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            toast.loading('Cargando historial de ' + u.nombre + '...', { duration: 2000 });
                                            // Redirigir a auditoría filtrada por este usuario en el futuro
                                            setTimeout(() => {
                                                window.location.href = '/auditoria';
                                            }, 1000);
                                        }}
                                        className="p-3 bg-military-800 rounded-xl text-military-300 hover:text-blue-500 transition-all"
                                        title="Ver Historial (Logs)"
                                    >
                                        <Clock size={18} />
                                    </button>

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`¿Seguro que deseas ELIMINAR el acceso para @${u.nombre}?`)) {
                                                handleDelete(u.id);
                                            }
                                        }}
                                        className="p-3 bg-military-800/50 rounded-xl text-military-500 hover:text-red-500 transition-all"
                                        title="Eliminar Acceso"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="text-[10px] text-military-600 font-bold uppercase">
                                    SISTEMA DGG
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Usuario */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-military-950/80 backdrop-blur-md p-4">
                    <div className="glass p-10 rounded-[3rem] w-full max-w-md border border-gold-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{isEdit ? 'Editar Acceso' : 'Nuevo Integrante'}</h3>
                            <p className="text-[10px] text-military-500 font-bold uppercase mt-2">Usuario se generará como nombre.apellido</p>
                        </div>
                        <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-military-400 tracking-[0.2em] ml-2">Nombre</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Ej: Diana"
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 placeholder:text-military-800"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-military-400 tracking-[0.2em] ml-2">Apellido</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Ej: Giraldo"
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 placeholder:text-military-800"
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-military-400 tracking-[0.2em] ml-2">{isEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
                                <input 
                                    type="password" 
                                    required={!isEdit}
                                    className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-military-400 tracking-[0.2em] ml-2">Rol de Seguridad</label>
                                <select 
                                    className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%23D5A115%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:24px] bg-[right_1.5rem_center] bg-no-repeat"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                >
                                    <option value="GESTION">Gestión (Estándar)</option>
                                    <option value="CLIENTE">Cliente (Portal Ciudadano)</option>
                                    <option value="SUPER_ADMIN">Super-Admin (Total)</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 border border-military-800 text-military-400 font-bold rounded-2xl hover:bg-military-800 transition-all uppercase text-xs"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 bg-gold-gradient text-military-950 font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all uppercase text-xs"
                                >
                                    {isEdit ? 'Actualizar' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Usuarios
