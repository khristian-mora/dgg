import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
    User, Mail, Phone, MapPin, Award, 
    Calendar, FileText, CheckCircle2, Circle, 
    Upload, Download, Trash2, Edit, ChevronLeft,
    Loader2, Plus, ArrowRight, ShieldCheck, X, Shield,
    Settings, History, Info, ClipboardCheck, Globe, Lock, Eye, Camera
} from 'lucide-react'
import { api, getResourceUrl } from '../api/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ClientePerfil = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isSuperAdmin } = useAuth();
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('DOCUMENTOS'); // DOCUMENTOS, ARMAS, TRAMITES, INFO
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [formatos, setFormatos] = useState([]);
    const [showTramiteModal, setShowTramiteModal] = useState(false);
    const [tramiteData, setTramiteData] = useState({ tipo: 'Permiso para Porte', observaciones: '' });
    const [showArmaModal, setShowArmaModal] = useState(false);
    const [armaData, setArmaData] = useState({ claseArma: 'Pistola', marca: '', modelo: '', calibre: '9mm', numeroSerie: '', capacidad: '', longitudCanon: '', paisOrigen: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [pagos, setPagos] = useState([]);
    const [loadingPagos, setLoadingPagos] = useState(false);
    const [totalPagado, setTotalPagado] = useState(0);
    const [armaExpanded, setArmaExpanded] = useState(null);
    const [uploadingArmaFoto, setUploadingArmaFoto] = useState(false);

    // List of requirements (could be dynamic based on procedure)
    const [checklist, setChecklist] = useState([
        { id: 'CEDULA', label: 'Cédula de Ciudadanía (Cargar Escaneo)', status: 'PENDIENTE', file: null },
        { id: 'ACE', label: 'Certificado Psicomédico ACE (Vigente)', status: 'PENDIENTE', file: null },
        { id: 'TIRO', label: 'Curso de Manejo de Armas (Diploma)', status: 'PENDIENTE', file: null },
        { id: 'LABORAL', label: 'Certificado Laboral o Rut', status: 'PENDIENTE', file: null },
        { id: 'JUDICIAL', label: 'Antecedentes Judiciales (SICO)', status: 'PENDIENTE', file: null }
    ]);

    useEffect(() => {
        fetchClienteData();
    }, [id]);

    const fetchClienteData = async () => {
        try {
            setLoading(true);
            const [data, formats] = await Promise.all([
                api.clientes.getById(id),
                api.formatos.getAll()
            ]);
            setCliente(data);
            setFormatos(formats || []);
            
            // Map uploaded documents to checklist
            if (data.documentos) {
                const updatedChecklist = checklist.map(req => {
                    const doc = data.documentos.find(d => d.tipo === req.id);
                    if (doc) {
                        return { ...req, status: doc.verificado ? 'VERIFICADO' : 'CARGADO', file: doc };
                    }
                    return req;
                });
                setChecklist(updatedChecklist);
            }
        } catch (error) {
            console.error('Error fetching client info:', error);
            toast.error('No se pudo cargar la información del cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = (reqId) => {
        setSelectedRequirement(reqId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedRequirement) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('archivo', file);
            formData.append('clienteId', id);
            formData.append('tipo', selectedRequirement);
            formData.append('titulo', `${selectedRequirement}_${cliente.nombres}_${Date.now()}`);

            await api.documentos.upload(formData);
            toast.success('Documento cargado correctamente');
            fetchClienteData();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error al subir el archivo');
        } finally {
            setUploading(false);
            setSelectedRequirement(null);
        }
    };

    const handleFotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('foto', file);

            await api.clientes.uploadFoto(id, formData);
            toast.success('Foto de perfil actualizada');
            fetchClienteData();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error al subir la foto');
        } finally {
            setUploading(false);
        }
    };

    const sendWhatsAppNotification = (reqName, status) => {
        const phone = cliente.telefono?.replace(/\+/g, '').replace(/ /g, '');
        if (!phone) {
            toast.error('El cliente no tiene un teléfono válido registrado');
            return;
        }

        let message = '';
        if (status === 'VERIFICADO') {
            message = `🛡️ *DEPOSITO GLOBAL GESTIÓN*\n\nHola *${cliente.nombres}*,\n\nTe confirmamos que hemos verificado tu documento: *${reqName}* ✅ correctamente.\n\nSeguimos avanzando en tu trámite DCCAE. Te avisaremos el próximo paso.`;
        } else if (status === 'COMPLETO') {
             message = `🛡️ *DEPOSITO GLOBAL GESTIÓN*\n\n¡Excelentes noticias *${cliente.nombres}*! 🌟\n\nYa tenemos todos tus documentos verificados en el sistema (100% completado). ✅\n\nHemos procedido a la radicación oficial de tu trámite ante el DCCAE.\n\n_GestorArmas Pro_`;
        }

        const url = `https://wa.me/${phone.startsWith('57') ? '' : '57'}${phone}?text=${encodeURIComponent(message)}`;
        // Removido window.open automático para evitar molestias al usuario
        // window.open(url, '_blank');
        toast.success('Notificación lista (Opcional)', { icon: '📱' });
    };

    const handleToggleVerification = async (docId, currentStatus, reqName) => {
        try {
            await api.documentos.update(docId, { verificado: !currentStatus });
            toast.success('Estado actualizado');
            
            if (!currentStatus) { // Si acabamos de verificar
                sendWhatsAppNotification(reqName, 'VERIFICADO');
            }
            
            fetchClienteData();
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const handleDeleteDocumento = async (docId, reqName) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el documento: ${reqName}?`)) return;
        
        try {
            toast.loading('Eliminando documento...', { id: 'delete' });
            await api.documentos.delete(docId);
            toast.success('Documento eliminado correctamente', { id: 'delete' });
            fetchClienteData();
        } catch (error) {
            toast.error('Error al eliminar documento', { id: 'delete' });
        }
    };

    const handleSaveClient = async () => {
        try {
            await api.clientes.update(id, editData);
            toast.success('Información del cliente actualizada');
            fetchClienteData();
            setIsEditing(false);
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Error al actualizar información');
        }
    };

    const handleArmaFotoUpload = async (armaId, fieldName, file) => {
        if (!file) return;
        try {
            setUploadingArmaFoto(true);
            const formData = new FormData();
            formData.append(fieldName, file);
            await api.armas.uploadFotos(armaId, formData);
            toast.success('Foto subida correctamente');
            fetchClienteData();
        } catch (error) {
            console.error('Error uploading arma foto:', error);
            toast.error('Error al subir la foto');
        } finally {
            setUploadingArmaFoto(false);
        }
    };

    const handleActivarPortal = async () => {
        try {
            toast.loading('Activando portal y enviando credenciales...', { id: 'portal' });
            await api.clientes.activarPortal(id);
            toast.success('Portal activado / Credenciales enviadas', { id: 'portal' });
            fetchClienteData();
        } catch (error) {
            console.error('Error activating portal:', error);
            const msg = error.response?.data?.message || 'Error al activar acceso';
            toast.error(msg, { id: 'portal' });
        }
    };

    const ArmaFotosSection = ({ arma }) => {
        const fotoFields = [
            { name: 'foto1', label: 'Foto 1' },
            { name: 'foto2', label: 'Foto 2' },
            { name: 'foto3', label: 'Foto 3' },
            { name: 'foto4', label: 'Foto 4' },
            { name: 'fotoImprontas', label: 'Foto Improntas' }
        ];

        return (
            <div className="mt-6 pt-6 border-t border-military-800">
                <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-4">Documentación Fotográfica del Arma</p>
                <div className="grid grid-cols-5 gap-3">
                    {fotoFields.map((field) => (
                        <div key={field.name} className="relative">
                            <div className="aspect-square rounded-2xl border-2 border-dashed border-military-700 bg-military-900/50 overflow-hidden flex items-center justify-center">
                                {arma[field.name] ? (
                                    <img 
                                        src={getResourceUrl(arma[field.name])} 
                                        alt={field.label}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => window.open(getResourceUrl(arma[field.name]), '_blank')}
                                    />
                                ) : (
                                    <Camera size={24} className="text-military-600" />
                                )}
                            </div>
                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 bg-black/60 transition-opacity">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            handleArmaFotoUpload(arma.id, field.name, e.target.files[0]);
                                        }
                                    }}
                                    disabled={uploadingArmaFoto}
                                />
                                <Upload size={20} className="text-white" />
                            </label>
                            <p className="text-[8px] text-center text-military-500 mt-1 truncate">{field.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
            <p className="text-military-400 font-bold uppercase tracking-widest text-xs">Cargando Expediente...</p>
        </div>
    );

    if (!cliente) return <div className="p-10 text-center text-white">Cliente no encontrado</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Profile Info */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-military-900 border-2 border-military-800 flex items-center justify-center text-5xl font-black text-white shadow-2xl group-hover:border-gold-500/50 transition-all overflow-hidden relative">
                        {cliente.foto ? <img src={getResourceUrl(cliente.foto)} className="w-full h-full object-cover" /> : cliente.nombres.charAt(0)}
                        
                        {isSuperAdmin && (
                             <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                 <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                                 <Camera size={32} className="text-white" />
                             </label>
                        )}
                    </div>
                    {isSuperAdmin && !isEditing && (
                        <button 
                            onClick={() => {
                                setEditData(cliente);
                                setIsEditing(true);
                                setActiveTab('INFO');
                            }}
                            className="absolute -bottom-2 -right-2 p-3 bg-gold-gradient rounded-full text-military-950 shadow-xl hover:scale-110 transition-all border-4 border-military-950"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={() => navigate('/clientes')} className="p-2 bg-military-900 rounded-xl text-military-500 hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-4xl font-black text-white tracking-tighter">{cliente.nombres} {cliente.apellidos}</h1>
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${cliente.tipoCliente === 'CLIENTE' ? 'bg-gold-500/10 text-gold-500 border-gold-500/30' : 'bg-blue-500/10 text-blue-500 border-blue-500/30'}`}>
                            {cliente.tipoCliente}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                        <InfoItem icon={<FileText size={16}/>} label="Cédula" value={cliente.cedula} />
                        <InfoItem icon={<Phone size={16}/>} label="Teléfono" value={cliente.telefono} />
                        <InfoItem icon={<Mail size={16}/>} label="Correo" value={cliente.correoElectronico || cliente.email || 'No registrado'} />
                        <InfoItem icon={<MapPin size={16} />} label="Dirección / Barrio" value={`${cliente.direccion} / ${cliente.barrio || 'N/A'}`} />
                        <InfoItem icon={<Globe size={16} />} label="Nacionalidad" value={cliente.nacionalidad || 'COLOMBIANA'} />
                        <InfoItem icon={<MapPin size={16}/>} label="Ciudad / Depto" value={`${cliente.ciudad || 'No registrada'}, ${cliente.departamento || 'Colombia'}`} />
                        <InfoItem icon={<Calendar size={16}/>} label="Nacimiento" value={new Date(cliente.fechaNacimiento).toLocaleDateString()} />
                        <InfoItem icon={<ShieldCheck size={16}/>} label="Expedición CC" value={`${cliente.fechaExpedicionCC ? new Date(cliente.fechaExpedicionCC).toLocaleDateString() : 'N/A'} - ${cliente.lugarExpedicionCC || ''}`} />
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-3">
                   <button 
                       onClick={() => setShowTramiteModal(true)}
                       className="gold-gradient flex items-center justify-center gap-2 py-4 px-8 rounded-2xl font-black text-xs text-military-950 uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all w-full"
                    >
                       <Plus size={18} />
                       Iniciar Trámite
                   </button>
                   <button className="glass border border-military-800 flex items-center justify-center gap-2 py-4 px-8 rounded-2xl font-bold text-xs text-military-300 uppercase tracking-widest hover:bg-military-800 transition-all">
                       <History size={18} />
                       Historial
                   </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-military-800 flex gap-8">
                <TabButton label="Expediente Digital" active={activeTab === 'DOCUMENTOS'} onClick={() => setActiveTab('DOCUMENTOS')} />
                <TabButton label="Armas Vinculadas" active={activeTab === 'ARMAS'} onClick={() => setActiveTab('ARMAS')} />
                <TabButton label="Trámites Activos" active={activeTab === 'TRAMITES'} onClick={() => setActiveTab('TRAMITES')} />
                <TabButton label="Información General" active={activeTab === 'INFO'} onClick={() => setActiveTab('INFO')} />
                <TabButton 
                    label="Historial de Pagos" 
                    active={activeTab === 'PAGOS'} 
                    onClick={async () => { 
                        setActiveTab('PAGOS');
                        if (pagos.length === 0) {
                            setLoadingPagos(true);
                            try {
                                const data = await api.caja.getByCliente(id);
                                setPagos(data.movimientos || []);
                                setTotalPagado(data.totalPagado || 0);
                            } catch { toast.error('Error al cargar pagos'); }
                            finally { setLoadingPagos(false); }
                        }
                    }} 
                />
            </div>

            {/* Tab: Documentos Checklist */}
            {activeTab === 'DOCUMENTOS' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                <ClipboardCheck className="text-gold-500" />
                                Lista de Requisitos Oficiales
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="text-[10px] font-black text-military-500 uppercase tracking-widest">
                                    AVANCE: {checklist.filter(r => r.status === 'VERIFICADO').length} / {checklist.length}
                                </div>
                                {checklist.every(r => r.status === 'VERIFICADO') && (
                                    <button 
                                        onClick={() => sendWhatsAppNotification('', 'COMPLETO')}
                                        className="p-2 bg-green-500/10 text-green-500 border border-green-500/30 rounded-xl hover:bg-green-500 hover:text-military-950 transition-all"
                                        title="Notificar Expediente Completo"
                                    >
                                        <ShieldCheck size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {checklist.map((req) => (
                                <div key={req.id} className="glass p-5 rounded-3xl border border-military-100/10 flex items-center justify-between group hover:border-gold-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${
                                            req.status === 'VERIFICADO' ? 'bg-green-500/10 text-green-500' :
                                            req.status === 'CARGADO' ? 'bg-orange-500/10 text-orange-500' :
                                            'bg-military-800 text-military-500'
                                        }`}>
                                            {req.status === 'VERIFICADO' ? <CheckCircle2 size={24} /> :
                                             req.status === 'CARGADO' ? <Info size={24} /> :
                                             <Circle size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white">{req.label}</p>
                                            <p className={`text-[10px] uppercase font-black tracking-widest ${
                                                req.status === 'VERIFICADO' ? 'text-green-500' :
                                                req.status === 'CARGADO' ? 'text-orange-500' :
                                                'text-military-600'
                                            }`}>
                                                {req.status}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {req.file && (
                                            <button 
                                                onClick={() => window.open(getResourceUrl(req.file.url), '_blank')}
                                                className="p-3 bg-military-900 rounded-xl text-military-400 hover:text-gold-500 transition-colors"
                                                title="Visualizar Documento"
                                            >
                                                <EyeIcon size={18} />
                                            </button>
                                        )}
                                        
                                        {/* Botón de Carga */}
                                        <button 
                                            onClick={() => handleUploadClick(req.id)}
                                            disabled={uploading}
                                            className="p-3 bg-military-900 rounded-xl text-military-400 hover:text-gold-500 transition-colors"
                                            title="Subir Archivo"
                                        >
                                            {uploading && selectedRequirement === req.id ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                        </button>

                                        {/* Botón de Descargar */}
                                        {req.status !== 'PENDIENTE' && (
                                            <button 
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = getResourceUrl(req.file.url);
                                                    link.setAttribute('download', `${req.label}_${cliente.nombres}.pdf`);
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    link.remove();
                                                }}
                                                className="p-3 bg-military-900 rounded-xl text-military-400 hover:text-blue-500 transition-colors"
                                                title="Descargar Archivo"
                                            >
                                                <Download size={18} />
                                            </button>
                                        )}

                                        {/* Botón de Check (Admin/Empleado solo) */}
                                        {(req.status === 'CARGADO' || req.status === 'VERIFICADO') && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleToggleVerification(req.file.id, req.status === 'VERIFICADO', req.label)}
                                                    className={`p-3 rounded-xl transition-all ${
                                                        req.status === 'VERIFICADO' ? 'bg-green-500 text-military-950' : 'bg-military-900 text-military-500 hover:text-green-500'
                                                    }`}
                                                    title={req.status === 'VERIFICADO' ? 'Quitar Verificación' : 'Verificar Documento'}
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDeleteDocumento(req.file.id, req.label)}
                                                    className="p-3 bg-military-900 text-military-500 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                                                    title="Eliminar Documento"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Digital Factory */}
                    <div className="space-y-6">
                        <div className="glass p-8 rounded-[2.5rem] bg-gold-gradient text-military-950">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-black uppercase tracking-tighter">Portal de Cliente</h3>
                                {cliente.user ? (
                                    <div className="w-3 h-3 rounded-full bg-military-950 flex shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-pulse" title="Acceso Activo" />
                                ) : (
                                    <Shield size={20} className="opacity-50" />
                                )}
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-widest mb-6 opacity-70">
                                {cliente.user ? 'El cliente ya tiene acceso al portal digital.' : 'Habilita el acceso para que el cliente consulte su trámite.'}
                            </p>
                            
                            <div className="space-y-3">
                                {!cliente.user && (
                                    <button 
                                        onClick={handleActivarPortal}
                                        className="w-full py-4 bg-military-950/20 border border-military-950/30 text-military-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-military-950 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Lock size={14} /> Activar Portal
                                    </button>
                                )}
                                {cliente.user && (
                                    <button 
                                        onClick={handleActivarPortal}
                                        className="w-full py-4 bg-military-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Mail size={14} /> Re-enviar Credenciales
                                    </button>
                                )}
                            </div>
                            <div className="h-px bg-military-950/10 my-3" />
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Digital Factory</h3>
                            <p className="text-[11px] font-bold uppercase tracking-widest mb-6 opacity-70">Generación Automática de Documentos</p>
                            
                            <div className="space-y-3">
                                {formatos.length === 0 ? (
                                    <p className="text-[10px] font-bold uppercase opacity-50">No hay formatos disponibles</p>
                                ) : (
                                    formatos.map(f => (
                                        <DocAction 
                                            key={f.id} 
                                            label={f.nombre} 
                                            onClick={async () => {
                                                try {
                                                    toast.loading('Generando documento...', { id: 'gen' });
                                                    const blob = await api.formatos.generar(f.id, id);
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `${f.nombre}_${cliente.nombres}.docx`;
                                                    a.click();
                                                    toast.success('Documento generado', { id: 'gen' });
                                                } catch (e) {
                                                    const errorMsg = e.message || 'Error al generar';
                                                    toast.error(errorMsg, { id: 'gen' });
                                                }
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="glass p-8 rounded-[2.5rem] border border-military-800">
                             <h4 className="text-xs font-black text-gold-500 uppercase tracking-widest mb-4">Ayuda para el Cliente</h4>
                             <p className="text-xs text-military-400 mb-6">Envíe este link al cliente para que cargue sus documentos directamente:</p>
                             <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/direct-upload/${cliente.id}`);
                                    toast.success('Enlace copiado al portapapeles');
                                }}
                                className="w-full py-4 bg-military-950 border border-military-800 text-military-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                             >
                                 Copiar Enlace Directo
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Historial de Pagos */}
            {activeTab === 'PAGOS' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Resumen */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass p-6 rounded-[2rem] border border-green-500/20 bg-green-500/5 text-center">
                            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Total Pagado</p>
                            <p className="text-3xl font-black text-green-400">
                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalPagado)}
                            </p>
                        </div>
                        <div className="glass p-6 rounded-[2rem] border border-military-800 text-center">
                            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Movimientos</p>
                            <p className="text-3xl font-black text-white">{pagos.length}</p>
                        </div>
                        <div className="glass p-6 rounded-[2rem] border border-gold-500/20 bg-gold-500/5 text-center">
                            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Último Pago</p>
                            <p className="text-sm font-black text-gold-400">
                                {pagos.length > 0 ? new Date(pagos[0].fecha).toLocaleDateString('es-CO') : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Tabla de movimientos */}
                    <div className="glass overflow-hidden rounded-[2rem] border border-military-100/10">
                        {loadingPagos ? (
                            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-500" /></div>
                        ) : pagos.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-military-600 font-bold uppercase text-xs tracking-widest">Sin pagos registrados para este cliente</p>
                                <p className="text-military-700 text-xs mt-2">Asocia movimientos desde el módulo de Caja</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-military-900/60">
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400">Fecha</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400">Concepto</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400">Método</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400 text-right">Valor</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400 text-center">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-military-100/5">
                                        {pagos.map(p => (
                                            <tr key={p.id} className="hover:bg-military-800/30 transition-colors">
                                                <td className="p-4 text-xs text-military-300">{new Date(p.fecha).toLocaleDateString('es-CO')}</td>
                                                <td className="p-4">
                                                    <p className="text-xs font-bold text-white">{p.concepto}</p>
                                                    <p className="text-[10px] text-military-500 uppercase">{p.categoria || '—'}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-military-800 text-military-300">{p.metodoPago || 'EFECTIVO'}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={`text-sm font-black ${p.tipo === 'INGRESO' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {p.tipo === 'INGRESO' ? '+' : '-'}{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.valor)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase ${p.tipo === 'INGRESO' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{p.tipo}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Iniciar Trámite */}
            {showTramiteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-military-100/10 scale-in-center shadow-2xl">
                        <div className="p-8 border-b border-military-100/10 flex justify-between items-center bg-gold-gradient/5">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Iniciar Nuevo Trámite</h2>
                            <button onClick={() => setShowTramiteModal(false)} className="text-military-400 hover:text-white"><X /></button>
                        </div>
                        <form className="p-8 space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await api.tramites.create({ ...tramiteData, clienteId: id });
                                toast.success('Trámite iniciado correctamente');
                                setShowTramiteModal(false);
                                fetchClienteData();
                            } catch (err) {
                                toast.error('Error al iniciar trámite');
                            }
                        }}>
                             <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Tipo de Servicio</label>
                                    <select 
                                        value={tramiteData.tipo} 
                                        onChange={e => setTramiteData({...tramiteData, tipo: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none appearance-none"
                                    >
                                        <option value="Permiso para Porte">Permiso para Porte</option>
                                        <option value="Permiso para Tenencia">Permiso para Tenencia</option>
                                        <option value="Adquisición de Armas">Adquisición de Armas</option>
                                        <option value="Revalidación de Salvoconducto">Revalidación de Salvoconducto</option>
                                        <option value="Cesión de Armas">Cesión de Armas</option>
                                        <option value="Compra de Munición">Compra de Munición</option>
                                        <option value="Permiso Nacional">Permiso Nacional</option>
                                        <option value="Permiso Regional">Permiso Regional</option>
                                        <option value="Cambio de Correo">Cambio de Correo</option>
                                        <option value="Usuarios Bloqueados">Usuarios Bloqueados</option>
                                        <option value="Otros Trámites">Otros Trámites</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Observaciones Iniciales</label>
                                    <textarea 
                                        value={tramiteData.observaciones}
                                        onChange={e => setTramiteData({...tramiteData, observaciones: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none h-32"
                                        placeholder="Detalles sobre el trámite o requisitos pendientes..."
                                    />
                                </div>
                             </div>
                             <button type="submit" className="w-full py-4 bg-gold-gradient text-military-950 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                CREAR EXPEDIENTE DE TRÁMITE
                             </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Tab: Armas */}
            {activeTab === 'ARMAS' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            <ShieldCheck className="text-gold-500" />
                            Catálogo de Armas del Cliente
                        </h3>
                        <button 
                            onClick={() => setShowArmaModal(true)}
                            className="bg-gold-gradient text-military-950 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.05] transition-all flex items-center gap-2"
                        >
                            <Plus size={14} /> Registrar Nueva Arma
                        </button>
                    </div>

                    {cliente.armas?.length === 0 ? (
                        <div className="glass p-12 rounded-[2.5rem] border-2 border-dashed border-military-800 text-center">
                            <p className="text-military-600 font-bold uppercase text-xs tracking-widest">No hay armas registradas para este cliente</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cliente.armas?.map((arma) => (
                                <div key={arma.id} className="glass p-8 rounded-[2.5rem] border border-military-100/10 hover:border-gold-500/30 transition-all">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{arma.marca} {arma.modelo}</h4>
                                            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] mt-2">{arma.claseArma}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-military-900 border border-military-800 flex items-center justify-center text-military-300">
                                                <Shield size={20} />
                                            </div>
                                            <button 
                                                onClick={() => setArmaExpanded(armaExpanded === arma.id ? null : arma.id)}
                                                className="w-12 h-12 rounded-2xl bg-military-900 border border-military-800 flex items-center justify-center text-military-400 hover:text-gold-500 transition-colors"
                                                title="Ver/Cargar Fotos"
                                            >
                                                <Camera size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-military-950/30 p-4 rounded-3xl border border-military-900">
                                            <p className="text-[8px] font-black text-military-600 uppercase tracking-widest mb-1">Serial / Serie</p>
                                            <p className="text-xs font-bold text-white mb-1">{arma.numeroSerie}</p>
                                        </div>
                                        <div className="bg-military-950/30 p-4 rounded-3xl border border-military-900">
                                            <p className="text-[8px] font-black text-military-600 uppercase tracking-widest mb-1">Calibre</p>
                                            <p className="text-xs font-bold text-white mb-1">{arma.calibre}</p>
                                        </div>
                                        <div className="bg-military-950/30 p-4 rounded-3xl border border-military-900">
                                            <p className="text-[8px] font-black text-military-600 uppercase tracking-widest mb-1">Long. Cañón</p>
                                            <p className="text-xs font-bold text-white mb-1">{arma.longitudCanon || 'N/A'}</p>
                                        </div>
                                        <div className="bg-military-950/30 p-4 rounded-3xl border border-military-900">
                                            <p className="text-[8px] font-black text-military-600 uppercase tracking-widest mb-1">País Origen</p>
                                            <p className="text-xs font-bold text-white mb-1">{arma.paisOrigen || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-6 border-t border-military-900">
                                        <div className="px-3 py-1 bg-gold-500/10 text-gold-500 text-[8px] font-black uppercase rounded-lg border border-gold-500/20">{arma.tipoPermiso || 'SIN PERMISO'}</div>
                                        {(arma.foto1 || arma.foto2 || arma.foto3 || arma.foto4 || arma.fotoImprontas) && (
                                            <div className="px-3 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded-lg border border-green-500/20">
                                                {[(arma.foto1), (arma.foto2), (arma.foto3), (arma.foto4), (arma.fotoImprontas)].filter(Boolean).length}/5 fotos
                                            </div>
                                        )}
                                    </div>

                                    {armaExpanded === arma.id && <ArmaFotosSection arma={arma} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* Tab: Trámites */}
            {activeTab === 'TRAMITES' && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <History className="text-gold-500" />
                        Historial de Trámites
                    </h3>
                    {cliente.tramites?.length === 0 ? (
                        <div className="glass p-12 rounded-[2.5rem] border-2 border-dashed border-military-800 text-center">
                            <p className="text-military-600 font-bold uppercase text-xs tracking-widest">No hay trámites registrados</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cliente.tramites?.map((tramite) => (
                                <div key={tramite.id} className="glass p-6 rounded-[2rem] border border-military-100/10 flex items-center justify-between group">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-2xl bg-military-900 flex items-center justify-center text-gold-500">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white uppercase text-sm tracking-tight">{tramite.tipo}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                                        tramite.estado === 'FINALIZADO' ? 'bg-green-500/10 text-green-500' : 'bg-gold-500/10 text-gold-500'
                                                    }`}>
                                                        {tramite.estado}
                                                    </span>
                                                    <p className="text-[10px] text-military-500 font-black tracking-widest uppercase">ID: {tramite.id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="hidden md:flex flex-col gap-1.5 min-w-[140px]">
                                                <div className="flex justify-between items-center text-[9px] font-black text-gold-500 uppercase tracking-widest">
                                                    <span>Progreso</span>
                                                    <p className="text-[9px] text-military-500 font-black tracking-widest uppercase">
                                                    {tramite.createdAt ? new Date(tramite.createdAt).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }) : ''}
                                                </p>
                                                </div>
                                                <div className="w-full h-1 bg-military-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gold-gradient transition-all duration-700" 
                                                        style={{ width: `${tramite.progreso || 0}%` }} 
                                                    />
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => navigate(`/tramites/${tramite.id}`)}
                                                className="p-3 bg-military-900 border border-military-800 rounded-xl text-military-400 hover:text-gold-500 hover:border-gold-500/50 transition-all shadow-lg"
                                            >
                                                <ArrowRight size={20} />
                                            </button>
                                        </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Información General (Editable) */}
            {activeTab === 'INFO' && (
                <div className="glass p-10 rounded-[3rem] border border-military-100/10 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                            <User className="text-gold-500" />
                            Datos del Ciudadano
                        </h3>
                        {!isEditing ? (
                            <button 
                                onClick={() => { setEditData(cliente); setIsEditing(true); }}
                                className="px-6 py-2 bg-military-900 border border-military-800 rounded-xl text-military-400 hover:text-gold-500 font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Editar Datos
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSaveClient}
                                    className="px-6 py-2 bg-gold-gradient text-military-950 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        )
                    }
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isEditing ? (
                            <>
                                <EditField label="Nombres" value={editData.nombres} onChange={v => setEditData({...editData, nombres: v})} />
                                <EditField label="Apellidos" value={editData.apellidos} onChange={v => setEditData({...editData, apellidos: v})} />
                                <EditField label="Cédula" value={editData.cedula} onChange={v => setEditData({...editData, cedula: v})} />
                                <EditField label="Teléfono" value={editData.telefono} onChange={v => setEditData({...editData, telefono: v})} />
                                <EditField label="Correo" value={editData.correoElectronico} onChange={v => setEditData({...editData, correoElectronico: v})} />
                                <EditField label="Dirección" value={editData.direccion} onChange={v => setEditData({...editData, direccion: v})} />
                                <EditField label="Barrio" value={editData.barrio} onChange={v => setEditData({...editData, barrio: v})} />
                                <EditField label="Ciudad" value={editData.ciudad} onChange={v => setEditData({...editData, ciudad: v})} />
                                <EditField label="Departamento" value={editData.departamento} onChange={v => setEditData({...editData, departamento: v})} />
                                <EditField label="Nacionalidad" value={editData.nacionalidad} onChange={v => setEditData({...editData, nacionalidad: v})} />
                                <EditField label="Ocupación" value={editData.ocupacion} onChange={v => setEditData({...editData, ocupacion: v})} />
                                <EditField label="Contraseña DCCAE" value={editData.contrasenaDCCAE} onChange={v => setEditData({...editData, contrasenaDCCAE: v})} />
                                <EditField label="Correo DCCAE" value={editData.correoDCCAE} onChange={v => setEditData({...editData, correoDCCAE: v})} />
                            </>
                        ) : (
                            <>
                                <InfoItem icon={<User size={16}/>} label="Nombres" value={cliente.nombres} />
                                <InfoItem icon={<User size={16}/>} label="Apellidos" value={cliente.apellidos} />
                                <InfoItem icon={<FileText size={16}/>} label="Cédula" value={cliente.cedula} />
                                <InfoItem icon={<Phone size={16}/>} label="Teléfono" value={cliente.telefono} />
                                <InfoItem icon={<Mail size={16}/>} label="Correo" value={cliente.correoElectronico || 'No registrado'} />
                                <InfoItem icon={<MapPin size={16}/>} label="Ubicación" value={`${cliente.direccion} • ${cliente.barrio || ''}`} />
                                <InfoItem icon={<Globe size={16}/>} label="Nacionalidad" value={cliente.nacionalidad} />
                                <InfoItem icon={<Award size={16}/>} label="Ocupación" value={cliente.ocupacion || 'No especificada'} />
                                <InfoItem icon={<Lock size={16}/>} label="DCCAE Pass" value={cliente.contrasenaDCCAE ? '********' : 'Sin cargar'} />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Nueva Arma */}
            {showArmaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-military-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="glass w-full max-w-xl p-10 rounded-[3rem] border border-military-100/10 relative overflow-hidden shadow-2xl">
                        <button 
                            onClick={() => setShowArmaModal(false)}
                            className="absolute top-8 right-8 text-military-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Registrar Arma</h2>
                        <p className="text-[10px] font-bold text-military-500 uppercase tracking-[0.2em] mb-10">Vinculación técnica de equipo al ciudadano</p>

                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await api.armas.create({ ...armaData, clienteId: id });
                                toast.success('Arma registrada correctamente');
                                setShowArmaModal(false);
                                fetchClienteData();
                            } catch (err) {
                                toast.error('Error al registrar arma');
                            }
                        }}>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Clase de Arma</label>
                                    <select 
                                        value={armaData.claseArma} 
                                        onChange={e => setArmaData({...armaData, claseArma: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none appearance-none"
                                    >
                                        <option value="Pistola">Pistola</option>
                                        <option value="Revolver">Revolver</option>
                                        <option value="Escopeta">Escopeta</option>
                                        <option value="Carabina">Carabina</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Marca</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={armaData.marca} 
                                        onChange={e => setArmaData({...armaData, marca: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                                        placeholder="Ej: Indumil, CZ"
                                    />
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Modelo</label>
                                    <input 
                                        type="text" 
                                        value={armaData.modelo} 
                                        onChange={e => setArmaData({...armaData, modelo: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                                        placeholder="Ej: Córdova"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Serial / Serie</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={armaData.numeroSerie} 
                                        onChange={e => setArmaData({...armaData, numeroSerie: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                                        placeholder="Serial único"
                                    />
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Calibre</label>
                                    <input 
                                        type="text" 
                                        value={armaData.calibre} 
                                        onChange={e => setArmaData({...armaData, calibre: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                                        placeholder="Ej: 9mm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">País de Origen</label>
                                    <input 
                                        type="text" 
                                        value={armaData.paisOrigen} 
                                        onChange={e => setArmaData({...armaData, paisOrigen: e.target.value})}
                                        className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                                        placeholder="Ej: Colombia"
                                    />
                                </div>
                             </div>

                             <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Longitud Cañón (pulg/mm)</label>
                                <input 
                                    type="text" 
                                    value={armaData.longitudCanon} 
                                    onChange={e => setArmaData({...armaData, longitudCanon: e.target.value})}
                                    className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                                    placeholder="Ej: 4.5 pulg"
                                />
                             </div>

                             <button type="submit" className="w-full py-4 bg-gold-gradient text-military-950 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                REGISTRAR Y VINCULAR ARMA
                             </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Hidden Input for generic file upload */}
            <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
            />
        </div>
    );
};

const EditField = ({ label, value, onChange, type = "text" }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-military-500 block">{label}</label>
        <input 
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold-500 outline-none transition-all font-bold"
        />
    </div>
);

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="text-gold-500 mt-0.5">{icon}</div>
        <div>
            <p className="text-[10px] font-black text-military-500 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-military-100">{value}</p>
        </div>
    </div>
);

const TabButton = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
            active ? 'text-gold-500' : 'text-military-500 hover:text-military-300'
        }`}
    >
        {label}
        {active && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500" />}
    </button>
);

const DocAction = ({ label, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-military-950/20 rounded-2xl hover:bg-military-950/40 transition-all border border-military-950/10 group text-left"
    >
        <span className="text-[11px] font-black uppercase tracking-tight">{label}</span>
        <Download size={16} className="group-hover:translate-y-0.5 transition-transform shrink-0" />
    </button>
);

const EyeIcon = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default ClientePerfil;
