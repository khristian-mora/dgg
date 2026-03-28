import React, { useState, useEffect, useRef } from 'react'
import { FileText, Image as ImageIcon, Trash2, Upload, Download, Eye, Plus, Search, Filter, Loader2 } from 'lucide-react'
import { api, getResourceUrl } from '../api/api'
import toast from 'react-hot-toast'

const Documentos = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDocumentos();
    }, []);

    const fetchDocumentos = async () => {
        try {
            setLoading(true);
            const data = await api.documentos.getAll ? await api.documentos.getAll() : [];
            setDocumentos(data);
        } catch (error) {
            console.error('Error fetching documentos:', error);
            setDocumentos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('archivo', file);   // ← multer espera 'archivo'
            formData.append('titulo', file.name);
            formData.append('tipo', file.type.includes('pdf') ? 'IDENTIFICACION' : 'OTRO');
            
            await api.documentos.upload(formData);
            toast.success('Documento subido exitosamente');
            fetchDocumentos();
        } catch (error) {
            toast.error('Error al subir documento');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este documento?')) return;
        
        try {
            await api.documentos.delete(id);
            toast.success('Documento eliminado');
            fetchDocumentos();
        } catch (error) {
            toast.error('Error al eliminar documento');
        }
    };

    const filteredDocs = documentos.filter(doc => 
        doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="md:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-military-500 group-focus-within:text-gold-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre de archivo o cliente..." 
                        className="w-full pl-12 pr-4 py-3 bg-military-950/40 border border-military-800 rounded-2xl focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
               </div>
               <button 
                    onClick={() => toast.success('Filtrar por categoría...')}
                    className="glass px-4 py-3 rounded-2xl flex items-center justify-between border-military-800 border hover:border-gold-500/30 transition-colors"
               >
                    <span className="text-xs text-military-400 font-bold uppercase">Categoría</span>
                    <Filter size={16} className="text-military-500" />
               </button>
               <button 
                    onClick={() => toast.success('Filtrar por tipo de archivo...')}
                    className="glass px-4 py-3 rounded-2xl flex items-center justify-between border-military-800 border hover:border-gold-500/30 transition-colors"
               >
                    <span className="text-xs text-military-400 font-bold uppercase">Tipo de Archivo</span>
                    <ImageIcon size={16} className="text-military-500" />
               </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
            ) : filteredDocs.length === 0 ? (
                <div className="glass p-12 rounded-[2.5rem] text-center">
                    <p className="text-military-500">No hay documentos</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="glass p-5 rounded-[2rem] border border-military-100/10 hover:border-gold-500/30 transition-all group flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.extension === 'pdf' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {doc.extension === 'pdf' ? <FileText size={24} /> : <ImageIcon size={24} />}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => window.open(getResourceUrl(doc.url), '_blank')}
                                        className="p-2 text-military-500 hover:text-gold-500 transition-colors bg-military-900/50 rounded-lg"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-military-500 hover:text-red-500 transition-colors bg-military-900/50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-white text-sm line-clamp-2 mb-1 group-hover:text-gold-400 transition-colors">
                                    {doc.titulo}
                                </h4>
                                <p className="text-[10px] text-gold-500 font-black uppercase tracking-widest bg-gold-500/5 inline-block px-2 py-0.5 rounded-md mb-3">
                                    {doc.tipo}
                                </p>
                                
                                <div className="space-y-1.5 mt-auto">
                                    <p className="text-[10px] text-military-400 flex justify-between uppercase font-bold">
                                        <span>Cliente:</span>
                                        <span className="text-military-200">{doc.cliente?.nombre || 'N/A'}</span>
                                    </p>
                                    <p className="text-[10px] text-military-500 flex justify-between uppercase">
                                        <span>Tamaño:</span>
                                        <span>{doc.size || 'N/A'}</span>
                                    </p>
                                    <p className="text-[10px] text-military-500 flex justify-between uppercase">
                                        <span>Fecha:</span>
                                        <span>{doc.fecha ? new Date(doc.fecha).toLocaleDateString('es-CO') : 'N/A'}</span>
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = getResourceUrl(doc.url);
                                    link.setAttribute('download', doc.titulo);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }}
                                className="mt-6 w-full py-2.5 bg-military-800 hover:bg-military-700 text-military-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Download size={14} />
                                <span>DESCARGAR</span>
                            </button>
                        </div>
                    ))}

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-military-800 rounded-[2rem] p-5 flex flex-col items-center justify-center gap-4 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 rounded-full bg-military-900 flex items-center justify-center text-military-500 group-hover:text-gold-500 group-hover:scale-110 transition-all">
                            <Plus size={24} />
                        </div>
                        <p className="text-xs font-bold text-military-500 uppercase tracking-widest">Añadir Archivo</p>
                    </button>
                </div>
            )}
        </div>
    )
}

export default Documentos
