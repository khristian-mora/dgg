import React, { useState, useEffect } from 'react'
import { FileText, Plus, Download, ChevronRight, User as UserIcon, Loader2, CheckCircle2, FileDown } from 'lucide-react'
import { api } from '../api/api'
import { toast } from 'react-hot-toast'

const Formatos = () => {
    const [formatos, setFormatos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Selection state
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [selectedClient, setSelectedClient] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [formatsData, clientsData] = await Promise.all([
                api.formatos.getAll(),
                api.clientes.getAll()
            ]);
            setFormatos(formatsData || []);
            setClientes(clientsData || []);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFormat || !selectedClient) {
            toast.error('Selecciona un formato y un cliente');
            return;
        }

        try {
            setIsGenerating(true);
            const blob = await api.formatos.generar(selectedFormat.id, selectedClient);
            
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `GENERADO_${selectedFormat.nombre.replace(/\s+/g, '_')}.docx`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success('¡Documento generado con éxito!');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al generar el documento. Verifica que la plantilla exista en el servidor.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Plantillas DCCAE</p>
                <h1 className="text-4xl font-black text-white tracking-tight">Gestión de Formatos</h1>
            </div>

            {/* List of Formats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formatos.map(f => (
                    <FormatCard 
                        key={f.id}
                        title={f.nombre} 
                        type="DOCX" 
                        desc={f.descripcion} 
                        isActive={selectedFormat?.id === f.id}
                        onClick={() => setSelectedFormat(f)}
                    />
                ))}
            </div>

            {/* Automatic Generator Section */}
            <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5">
                   <FileText size={120} className="text-gold-500" />
               </div>
               
               <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Generador Automático</h3>
                            <p className="text-military-500 text-sm mt-1">Pre-llenado de datos DCCAE e Indumil</p>
                        </div>
                        <div className={`p-3 rounded-full ${selectedFormat ? 'bg-green-500/20 text-green-500' : 'bg-military-800 text-military-500'}`}>
                            {selectedFormat ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-military-400 px-1">1. Seleccionar Formato Destino</label>
                            <div className="p-4 bg-military-900 border border-military-800 rounded-2xl text-white font-bold text-sm">
                                {selectedFormat ? selectedFormat.nombre : 'Haz clic en una tarjeta de arriba'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-military-400 px-1">2. Seleccionar Cliente</label>
                            <select 
                                value={selectedClient}
                                onChange={(e) => setSelectedClient(e.target.value)}
                                className="w-full p-4 bg-military-900 border border-military-800 rounded-2xl text-white font-bold text-sm outline-none focus:border-gold-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">--- Selecciona un cliente ---</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombres} {c.apellidos} - {c.cedula}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={!selectedFormat || !selectedClient || isGenerating}
                        className="w-full flex items-center justify-center gap-3 py-6 bg-gold-gradient text-military-950 font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>GENERANDO ARCHIVO...</span>
                            </>
                        ) : (
                            <>
                                <FileDown size={20} />
                                <span>GENERAR Y DESCARGAR DOCX</span>
                            </>
                        )}
                    </button>
                    
                    {!selectedFormat && (
                        <p className="text-center mt-6 text-xs font-bold text-military-600 animate-pulse">
                            (Selecciona una plantilla primero para activar el motor)
                        </p>
                    )}
               </div>
            </div>
        </div>
    )
}

const FormatCard = ({ title, type, desc, isActive, onClick }) => (
    <div 
        onClick={onClick}
        className={`glass p-6 rounded-[2rem] border transition-all group cursor-pointer ${isActive ? 'border-gold-500 shadow-[0_0_20px_rgba(213,161,21,0.2)]' : 'border-military-100/10 hover:border-gold-500/20'}`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-gold-500 text-military-950' : (type === 'DOCX' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500')}`}>
                <FileText size={20} />
            </div>
            {isActive && <CheckCircle2 className="text-gold-500" size={20} />}
        </div>
        <h4 className="font-bold text-white mb-2 leading-tight">{title}</h4>
        <p className="text-xs text-military-500 mb-6 line-clamp-2">{desc}</p>
        <button className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'text-gold-500' : 'text-military-600 group-hover:text-gold-500'}`}>
            {isActive ? 'SELECCIONADO' : 'USAR PLANTILLA'} <ChevronRight size={14} />
        </button>
    </div>
)

export default Formatos
