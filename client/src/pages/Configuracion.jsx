import React, { useState } from 'react';
import { Settings, Shield, DollarSign, Database, Save, User as UserIcon, Bell, Lock, Download, CloudLightning } from 'lucide-react';
import { api } from '../api/api';
import toast from 'react-hot-toast';

const Configuracion = () => {
    const [activeTab, setActiveTab] = useState('precios');
    const user = JSON.parse(localStorage.getItem('user'));
    const isSuperAdmin = user?.rol === 'SUPER_ADMIN';

    const [securitySettings, setSecuritySettings] = useState({
        twoFactor: true,
        ipBlock: false,
        auditLogs: true
    });

    const toggleSecurity = (key) => {
        setSecuritySettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        toast.success('Configuración de seguridad actualizada');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
               <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Comando de Control de Sistemas</p>
               <h1 className="text-4xl font-black text-white tracking-tight">Configuración General</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Tabs Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    <ConfigTab active={activeTab === 'precios'} onClick={() => setActiveTab('precios')} icon={<DollarSign size={18}/>} label="Tasas y Precios" />
                    <ConfigTab active={activeTab === 'catalogos'} onClick={() => setActiveTab('catalogos')} icon={<Database size={18}/>} label="Catálogos DCCAE" />
                    <ConfigTab active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} icon={<UserIcon size={18}/>} label="Mi Perfil" />
                    <ConfigTab active={activeTab === 'seguridad'} onClick={() => setActiveTab('seguridad')} icon={<Shield size={18}/>} label="Seguridad & RBAC" />
                    {isSuperAdmin && (
                        <ConfigTab active={activeTab === 'backup'} onClick={() => setActiveTab('backup')} icon={<CloudLightning size={18}/>} label="Copia de Seguridad" />
                    )}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="glass p-10 rounded-[2.5rem] border border-military-100/10 min-h-[500px]">
                        
                        {activeTab === 'precios' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter border-b border-military-800 pb-4">Gestión de Tasas Operativas (Indumil/DCCAE)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <PriceField label="Pistola Córdova Estándar" value="$5.471.400" />
                                    <PriceField label="Pistola Córdova Compacta" value="$5.525.520" />
                                    <PriceField label="Caja Munición 9mm (50)" value="$150.000" />
                                    <PriceField label="Evaluación ACE (Psicomédico)" value="$550.000" />
                                </div>
                                <div className="pt-6">
                                    <button 
                                        onClick={() => toast.success('Cambios guardados correctamente')}
                                        className="flex items-center gap-2 bg-gold-gradient text-military-950 px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all"
                                    >
                                        <Save size={18} />
                                        <span>GUARDAR CAMBIOS</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'catalogos' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter border-b border-military-800 pb-4">Inventario de Referencias Oficiales</h3>
                                <div className="space-y-6">
                                    <div className="p-6 bg-military-950/40 rounded-2xl border border-military-800">
                                        <p className="text-xs font-bold text-gold-500 uppercase mb-4 tracking-widest">Modelos Nacionales & Importados</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Córdova Estándar', 'Córdova Compacta', 'Scorpio .38', 'Glock 17', 'Beretta 92FS', 'CZ P-07', 'Jericho 941'].map(m => (
                                                <span key={m} className="px-3 py-1 bg-military-900 border border-military-800 text-military-200 text-xs font-bold rounded-lg">{m}</span>
                                            ))}
                                            <button 
                                                onClick={() => toast.success('Agregando nuevo modelo de arma...')}
                                                className="px-3 py-1 border border-dashed border-gold-500/50 text-gold-500 text-xs font-bold rounded-lg hover:bg-gold-500/10"
                                            >+ Añadir</button>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-military-950/40 rounded-2xl border border-military-800">
                                        <p className="text-xs font-bold text-gold-500 uppercase mb-4 tracking-widest">Calibres Autorizados</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['9mm', '.38 SPL', '.22 LR', '.45 ACP'].map(c => (
                                                <span key={c} className="px-3 py-1 bg-military-900 border border-military-800 text-military-200 text-xs font-bold rounded-lg">{c}</span>
                                            ))}
                                            <button 
                                                onClick={() => toast.success('Agregando nuevo calibre...')}
                                                className="px-3 py-1 border border-dashed border-gold-500/50 text-gold-500 text-xs font-bold rounded-lg hover:bg-gold-500/10"
                                            >+ Añadir</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'seguridad' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter border-b border-military-800 pb-4">Protocolos de Acceso</h3>
                                 <div className="space-y-4">
                                     <SecurityToggle label="Autenticación de Dos Factores (2FA)" active={securitySettings.twoFactor} onClick={() => toggleSecurity('twoFactor')} description="Requiere código vía email para el personal de GESTION." />
                                     <SecurityToggle label="Bloqueo por IP" active={securitySettings.ipBlock} onClick={() => toggleSecurity('ipBlock')} description="Restringe el acceso solo a la red de la oficina central." />
                                     <SecurityToggle label="Logs de Auditoría Estrictos" active={securitySettings.auditLogs} onClick={() => toggleSecurity('auditLogs')} description="Registra cada visualización de perfiles de clientes." />
                                 </div>
                            </div>
                        )}

                        {activeTab === 'perfil' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter border-b border-military-800 pb-4">Gestión de Credenciales de Acceso</h3>
                                
                                <form 
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const pass = e.target.newPass.value;
                                        const confirm = e.target.confirmPass.value;
                                        
                                        if (pass !== confirm) {
                                            return toast.error('Las contraseñas no coinciden');
                                        }

                                        try {
                                            toast.loading('Actualizando contraseña...', { id: 'pass' });
                                            // En el backend el usuario se identifica por el token
                                            await api.users.updatePassword({ password: pass });
                                            toast.success('Contraseña actualizada correctamente', { id: 'pass' });
                                            e.target.reset();
                                        } catch (err) {
                                            toast.error('No se pudo actualizar la contraseña', { id: 'pass' });
                                        }
                                    }}
                                    className="max-w-md space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-military-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/50 group-focus-within:text-gold-500 transition-colors" size={18} />
                                            <input 
                                                name="newPass"
                                                type="password" 
                                                placeholder="Mínimo 6 caracteres"
                                                className="w-full pl-12 pr-4 py-4 bg-military-950/40 border border-military-800 rounded-2xl focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 text-white font-bold transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-military-500 uppercase tracking-widest ml-1">Confirmar Nueva Contraseña</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/50 group-focus-within:text-gold-500 transition-colors" size={18} />
                                            <input 
                                                name="confirmPass"
                                                type="password" 
                                                placeholder="Repita la contraseña"
                                                className="w-full pl-12 pr-4 py-4 bg-military-950/40 border border-military-800 rounded-2xl focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 text-white font-bold transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            type="submit"
                                            className="w-full flex items-center justify-center gap-2 bg-gold-gradient text-military-950 px-6 py-4 rounded-2xl font-black text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <Save size={18} />
                                            <span>ACTUALIZAR CREDENCIALES</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'backup' && isSuperAdmin && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter border-b border-military-800 pb-4">Respaldo Integral del Sistema</h3>
                                
                                <div className="p-8 rounded-3xl bg-military-900/40 border border-military-800 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-gold-500/10 rounded-2xl text-gold-500">
                                            <CloudLightning size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Copia de Seguridad Manual</h4>
                                            <p className="text-sm text-military-400">Descarga una copia completa de la base de datos actual en formato comprimido (.db.gz).</p>
                                        </div>
                                    </div>

                                    <div className="bg-military-950/60 p-6 rounded-2xl border border-military-800/50">
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-3 text-xs text-military-300 font-bold">
                                                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                                                Incluye todos los clientes, trámites, pagos y auditorías.
                                            </li>
                                            <li className="flex items-center gap-3 text-xs text-military-300 font-bold">
                                                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                                                El archivo está comprimido y listo para restauración.
                                            </li>
                                            <li className="flex items-center gap-3 text-xs text-military-300 font-bold">
                                                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                                                Se recomienda realizar este proceso regularmente.
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    toast.loading('Generando backup y preparando descarga...', { id: 'backup' });
                                                    const blob = await api.backups.download();
                                                    
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    const timestamp = new Date().toISOString().split('T')[0];
                                                    a.download = `DGG_BACKUP_${timestamp}.db.gz`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                    document.body.removeChild(a);
                                                    
                                                    toast.success('Backup descargado correctamente', { id: 'backup' });
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error(err.message || 'Error al generar el backup', { id: 'backup' });
                                                }
                                            }}
                                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gold-gradient text-military-950 px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Download size={20} />
                                            <span>GENERAR Y DESCARGAR BACKUP AHORA</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl border border-dashed border-military-700 bg-military-950/20">
                                    <p className="text-[10px] text-military-500 font-bold uppercase tracking-widest text-center">
                                        Nota: El sistema realiza backups automáticos todos los días a las 3:00 AM.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

const ConfigTab = ({ active, icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-gold-gradient text-military-950 shadow-lg' : 'hover:bg-military-900 border border-transparent text-military-400 hover:text-military-100 font-bold'}`}
    >
        <span className={`${active ? '' : 'group-hover:scale-110'} transition-transform`}>{icon}</span>
        <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
);

const PriceField = ({ label, value }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-military-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500" size={16} />
            <input 
                type="text" 
                defaultValue={value}
                className="w-full pl-12 pr-4 py-3 bg-military-950/40 border border-military-800 rounded-2xl focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 text-white font-bold transition-all"
            />
        </div>
    </div>
);

const SecurityToggle = ({ label, active, description, onClick }) => (
    <div className="flex items-center justify-between p-6 rounded-2xl bg-military-900/40 border border-military-800">
        <div>
            <p className="font-bold text-white text-sm uppercase tracking-tight mb-1">{label}</p>
            <p className="text-[10px] text-military-500">{description}</p>
        </div>
        <button 
            onClick={onClick}
            className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${active ? 'bg-gold-500 shadow-[0_0_10px_rgba(213,161,21,0.3)]' : 'bg-military-800'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-military-950 rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
        </button>
    </div>
);

export default Configuracion;
