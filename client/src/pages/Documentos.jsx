import React, { useState, useEffect, useRef } from 'react'
import { 
    FileText, Image as ImageIcon, Trash2, Upload, Download, Eye, Plus, 
    Search, Loader2, FolderOpen, File, Film, Table2, Grid2x2, List,
    User, Link2, Filter, X
} from 'lucide-react'
import { api, getResourceUrl } from '../api/api'
import toast from 'react-hot-toast'

const TIPOS = ['TODOS', 'IDENTIFICACION', 'PSICOFISICO', 'CERTIFICADO', 'POLIZA', 'CONTRATO', 'PODER', 'FOTO', 'OTRO']

const EXT_CONFIG = {
    pdf:  { bg: 'bg-red-500/10 text-red-400',    icon: <FileText size={22} /> },
    png:  { bg: 'bg-blue-500/10 text-blue-400',  icon: <ImageIcon size={22} /> },
    jpg:  { bg: 'bg-blue-500/10 text-blue-400',  icon: <ImageIcon size={22} /> },
    jpeg: { bg: 'bg-blue-500/10 text-blue-400',  icon: <ImageIcon size={22} /> },
    doc:  { bg: 'bg-indigo-500/10 text-indigo-400', icon: <File size={22} /> },
    docx: { bg: 'bg-indigo-500/10 text-indigo-400', icon: <File size={22} /> },
    xls:  { bg: 'bg-green-500/10 text-green-400', icon: <Table2 size={22} /> },
    xlsx: { bg: 'bg-green-500/10 text-green-400', icon: <Table2 size={22} /> },
};
const extConfig = (ext) => EXT_CONFIG[ext?.toLowerCase()] || { bg: 'bg-military-700 text-military-300', icon: <File size={22} /> };

const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Documentos = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('TODOS');
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({ titulo: '', tipo: 'OTRO', file: null });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDocumentos();
    }, []);

    const fetchDocumentos = async () => {
        try {
            setLoading(true);
            const data = await api.documentos.getAll();
            setDocumentos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching documentos:', error);
            toast.error('No se pudieron cargar los documentos');
            setDocumentos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadForm({
            titulo: file.name.replace(/\.[^.]+$/, ''), // nombre sin extensión
            tipo: file.type.includes('pdf') ? 'IDENTIFICACION' : 'OTRO',
            file
        });
        setUploadModal(true);
        e.target.value = '';
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('archivo', uploadForm.file);
            formData.append('titulo', uploadForm.titulo || uploadForm.file.name);
            formData.append('tipo', uploadForm.tipo);
            await api.documentos.upload(formData);
            toast.success('Documento subido exitosamente');
            setUploadModal(false);
            setUploadForm({ titulo: '', tipo: 'OTRO', file: null });
            fetchDocumentos();
        } catch (error) {
            toast.error('Error al subir documento: ' + (error.message || ''));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, titulo) => {
        if (!confirm(`¿Eliminar "${titulo}"?`)) return;
        try {
            await api.documentos.delete(id);
            toast.success('Documento eliminado');
            setDocumentos(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            toast.error('Error al eliminar documento');
        }
    };

    const handleView = (doc) => {
        const url = getResourceUrl(doc.url);
        if (url) window.open(url, '_blank');
    };

    const handleDownload = (doc) => {
        const url = getResourceUrl(doc.url);
        if (!url) return;
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.titulo || doc.nombreArchivo || 'documento';
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    // Filtrado local (búsqueda + tipo)
    const filtered = documentos.filter(doc => {
        const matchSearch = !searchTerm ||
            doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.cliente?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.cliente?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tramite?.tipo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchTipo = tipoFiltro === 'TODOS' || doc.tipo === tipoFiltro;
        return matchSearch && matchTipo;
    });

    // Stats
    const totalSize = documentos.reduce((acc, d) => acc + (d.size || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Archivo Digital DCCAE</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">Gestión Documental</h1>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-gold-gradient text-military-950 font-bold rounded-2xl shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                    <span>SUBIR DOCUMENTO</span>
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Archivos', value: documentos.length, icon: <FolderOpen size={20} /> },
                    { label: 'Almacenamiento', value: formatSize(totalSize), icon: <Grid2x2 size={20} /> },
                    { label: 'PDFs', value: documentos.filter(d => d.extension === 'pdf').length, icon: <FileText size={20} /> },
                    { label: 'Imágenes', value: documentos.filter(d => ['jpg','jpeg','png'].includes(d.extension)).length, icon: <ImageIcon size={20} /> },
                ].map((stat) => (
                    <div key={stat.label} className="glass p-5 rounded-[2rem] border border-military-100/10 flex items-center gap-4">
                        <div className="p-3 bg-gold-500/10 rounded-xl text-gold-500">{stat.icon}</div>
                        <div>
                            <p className="text-xl font-black text-white">{stat.value}</p>
                            <p className="text-[9px] font-black text-military-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-military-500 group-focus-within:text-gold-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, cliente o trámite..." 
                        className="w-full pl-12 pr-10 py-3.5 bg-military-950/40 border border-military-800 rounded-2xl focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-military-500 hover:text-white">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Filtro tipo */}
                <div className="flex gap-2 overflow-x-auto py-1">
                    {TIPOS.map(tipo => (
                        <button
                            key={tipo}
                            onClick={() => setTipoFiltro(tipo)}
                            className={`shrink-0 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                tipoFiltro === tipo
                                    ? 'bg-gold-500 text-military-950'
                                    : 'bg-military-900 text-military-400 border border-military-800 hover:border-gold-500/40'
                            }`}
                        >
                            {tipo}
                        </button>
                    ))}
                </div>

                {/* Vista grid/lista */}
                <div className="flex gap-1 bg-military-900 p-1 rounded-xl border border-military-800 shrink-0">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gold-500 text-military-950' : 'text-military-500 hover:text-white'}`}>
                        <Grid2x2 size={16} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gold-500 text-military-950' : 'text-military-500 hover:text-white'}`}>
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Resultado */}
            <div className="text-[10px] font-black text-military-500 uppercase tracking-widest px-1">
                {filtered.length} de {documentos.length} archivos {tipoFiltro !== 'TODOS' ? `• Tipo: ${tipoFiltro}` : ''}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass p-14 rounded-[2.5rem] text-center border border-military-800">
                    <FolderOpen className="mx-auto text-military-700 mb-4" size={52} />
                    <p className="text-military-500 font-bold uppercase tracking-widest text-sm">
                        {documentos.length === 0 ? 'Aún no hay documentos subidos' : 'No coincide con la búsqueda'}
                    </p>
                    {documentos.length === 0 && (
                        <button onClick={() => fileInputRef.current?.click()} className="mt-6 px-6 py-3 bg-gold-gradient text-military-950 font-bold rounded-xl text-sm hover:scale-105 transition-all">
                            Subir primer documento
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                // ─── VISTA GRID ───
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {filtered.map((doc) => {
                        const cfg = extConfig(doc.extension);
                        return (
                            <div key={doc.id} className="glass p-5 rounded-[2rem] border border-military-100/10 hover:border-gold-500/30 transition-all group flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                                        {cfg.icon}
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => handleView(doc)} className="p-1.5 text-military-500 hover:text-gold-500 bg-military-900/60 rounded-lg transition-colors" title="Ver">
                                            <Eye size={14} />
                                        </button>
                                        <button onClick={() => handleDownload(doc)} className="p-1.5 text-military-500 hover:text-blue-400 bg-military-900/60 rounded-lg transition-colors" title="Descargar">
                                            <Download size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(doc.id, doc.titulo)} className="p-1.5 text-military-500 hover:text-red-500 bg-military-900/60 rounded-lg transition-colors" title="Eliminar">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-sm line-clamp-2 mb-2 group-hover:text-gold-400 transition-colors leading-tight">
                                        {doc.titulo}
                                    </h4>
                                    <span className="text-[9px] text-gold-500 font-black uppercase tracking-widest bg-gold-500/5 px-2 py-0.5 rounded-md border border-gold-500/10">
                                        {doc.tipo}
                                    </span>

                                    <div className="space-y-1.5 mt-4">
                                        {doc.cliente && (
                                            <div className="flex items-center gap-2">
                                                <User size={10} className="text-military-600 shrink-0" />
                                                <p className="text-[10px] text-military-400 font-bold truncate">
                                                    {doc.cliente.nombres} {doc.cliente.apellidos}
                                                </p>
                                            </div>
                                        )}
                                        {doc.tramite && (
                                            <div className="flex items-center gap-2">
                                                <Link2 size={10} className="text-military-600 shrink-0" />
                                                <p className="text-[10px] text-military-500 truncate">{doc.tramite.tipo}</p>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-[10px] text-military-600 font-bold pt-1 border-t border-military-800">
                                            <span>{formatSize(doc.size)}</span>
                                            <span>{doc.extension?.toUpperCase()}</span>
                                            <span>{new Date(doc.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Tarjeta "Subir" */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-military-800 rounded-[2rem] p-5 flex flex-col items-center justify-center gap-3 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all cursor-pointer group min-h-[180px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-military-900 flex items-center justify-center text-military-500 group-hover:text-gold-500 group-hover:scale-110 transition-all">
                            <Plus size={24} />
                        </div>
                        <p className="text-xs font-bold text-military-500 uppercase tracking-widest">Añadir Archivo</p>
                    </button>
                </div>
            ) : (
                // ─── VISTA LISTA ───
                <div className="glass rounded-[2.5rem] border border-military-100/10 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-military-800">
                                <th className="p-4 text-left text-[10px] font-black text-military-500 uppercase tracking-widest">Archivo</th>
                                <th className="p-4 text-left text-[10px] font-black text-military-500 uppercase tracking-widest hidden md:table-cell">Cliente / Trámite</th>
                                <th className="p-4 text-left text-[10px] font-black text-military-500 uppercase tracking-widest hidden lg:table-cell">Tipo</th>
                                <th className="p-4 text-left text-[10px] font-black text-military-500 uppercase tracking-widest hidden lg:table-cell">Tamaño</th>
                                <th className="p-4 text-left text-[10px] font-black text-military-500 uppercase tracking-widest">Fecha</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((doc, idx) => {
                                const cfg = extConfig(doc.extension);
                                return (
                                    <tr key={doc.id} className={`border-b border-military-800/50 hover:bg-military-900/30 transition-all ${idx % 2 === 0 ? '' : 'bg-military-950/20'}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${cfg.bg}`}>
                                                    {cfg.icon}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm leading-tight line-clamp-1">{doc.titulo}</p>
                                                    <p className="text-[9px] text-military-600 font-bold">.{doc.extension?.toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            {doc.cliente ? (
                                                <p className="text-xs text-military-300 font-bold">{doc.cliente.nombres} {doc.cliente.apellidos}</p>
                                            ) : doc.tramite ? (
                                                <p className="text-xs text-military-400">{doc.tramite.tipo}</p>
                                            ) : (
                                                <p className="text-xs text-military-600">—</p>
                                            )}
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <span className="text-[9px] text-gold-500 font-black uppercase px-2 py-0.5 bg-gold-500/5 rounded border border-gold-500/10">{doc.tipo}</span>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <span className="text-xs text-military-400 font-bold">{formatSize(doc.size)}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-military-400">
                                                {new Date(doc.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1.5 justify-end">
                                                <button onClick={() => handleView(doc)} className="p-1.5 text-military-500 hover:text-gold-500 bg-military-900 rounded-lg transition-colors">
                                                    <Eye size={14} />
                                                </button>
                                                <button onClick={() => handleDownload(doc)} className="p-1.5 text-military-500 hover:text-blue-400 bg-military-900 rounded-lg transition-colors">
                                                    <Download size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(doc.id, doc.titulo)} className="p-1.5 text-military-500 hover:text-red-500 bg-military-900 rounded-lg transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de upload con datos */}
            {uploadModal && uploadForm.file && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass w-full max-w-md p-8 rounded-[3rem] border border-military-800 shadow-2xl">
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Subir Documento</h3>
                        <p className="text-[10px] text-military-500 font-bold uppercase tracking-widest mb-6">
                            {uploadForm.file.name} · {formatSize(uploadForm.file.size)}
                        </p>
                        <form onSubmit={handleUpload} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Nombre del documento</label>
                                <input
                                    type="text"
                                    required
                                    value={uploadForm.titulo}
                                    onChange={(e) => setUploadForm({...uploadForm, titulo: e.target.value})}
                                    className="w-full bg-military-900 border border-military-800 rounded-2xl p-4 text-white focus:border-gold-500 outline-none font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-military-500 uppercase tracking-widest mb-2">Categoría</label>
                                <select
                                    value={uploadForm.tipo}
                                    onChange={(e) => setUploadForm({...uploadForm, tipo: e.target.value})}
                                    className="w-full bg-military-900 border border-military-800 rounded-2xl p-4 text-white focus:border-gold-500 outline-none font-bold"
                                >
                                    {TIPOS.filter(t => t !== 'TODOS').map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setUploadModal(false)} className="flex-1 py-4 bg-military-900 text-military-400 font-bold rounded-2xl border border-military-800">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={uploading} className="flex-1 py-4 bg-gold-gradient text-military-950 font-black rounded-2xl disabled:opacity-60 flex items-center justify-center gap-2">
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                    {uploading ? 'Subiendo...' : 'Subir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Documentos
