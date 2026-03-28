import React, { useState, useEffect, useRef } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Plus, Camera, Image as ImageIcon, X, Loader2, CheckCircle2, User, Search, Download } from 'lucide-react'
import { api, getResourceUrl } from '../api/api'
import { toast } from 'react-hot-toast'

const Caja = () => {
    const [view, setView] = useState('DIARIO');
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [resumen, setResumen] = useState({ ingresos: 0, egresos: 0, balance: 0 });

    // Client search state
    const [clienteSearch, setClienteSearch] = useState('');
    const [clienteResults, setClienteResults] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [searchingCliente, setSearchingCliente] = useState(false);
    const searchTimeout = useRef(null);

    // Form data
    const [formData, setFormData] = useState({
        tipo: 'INGRESO',
        concepto: '',
        valor: '',
        categoria: 'tramite',
        metodoPago: 'NEQUI',
        notas: '',
        comprobante: '',
        clienteId: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [view]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.caja.getArqueoDiario();
            setMovimientos(res.movimientos || []);
            setResumen(res.resumen || { ingresos: 0, egresos: 0, balance: 0 });
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar movimientos');
        } finally {
            setLoading(false);
        }
    };

    const handleClienteSearch = (q) => {
        setClienteSearch(q);
        setClienteSeleccionado(null);
        setFormData(prev => ({ ...prev, clienteId: '' }));
        if (!q.trim()) { setClienteResults([]); return; }
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setSearchingCliente(true);
            try {
                const res = await api.clientes.search(q);
                setClienteResults(res.slice(0, 6));
            } catch {
                setClienteResults([]);
            } finally {
                setSearchingCliente(false);
            }
        }, 350);
    };

    const seleccionarCliente = (c) => {
        setClienteSeleccionado(c);
        setClienteSearch(`${c.nombres} ${c.apellidos}`);
        setClienteResults([]);
        setFormData(prev => ({ ...prev, clienteId: c.id }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append('archivo', file);
            const res = await api.documentos.simpleUpload(uploadFormData);
            setFormData({ ...formData, comprobante: res.url });
            toast.success('Pantallazo cargado correctamente');
        } catch (error) {
            toast.error('Error al subir comprobante');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.caja.registrar({ ...formData, valor: parseFloat(formData.valor) });
            toast.success('Movimiento registrado');
            setShowModal(false);
            setFormData({ tipo: 'INGRESO', concepto: '', valor: '', categoria: 'tramite', metodoPago: 'NEQUI', notas: '', comprobante: '', clienteId: '' });
            setClienteSeleccionado(null);
            setClienteSearch('');
            fetchData();
        } catch (error) {
            toast.error('Error al registrar');
        }
    };

    const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Control Financiero (COP)</p>
                   <h1 className="text-4xl font-black text-white tracking-tight">Caja y Arqueos</h1>
                </div>
                
                <div className="flex gap-2">
                    <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-military-900 border border-military-800 text-white font-bold rounded-2xl hover:border-gold-500/50 transition-all">
                        <Download size={20} />
                        <span>Resumen</span>
                    </button>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center space-x-2 px-6 py-4 bg-gold-gradient text-military-950 font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
                    >
                        <Plus size={20} />
                        <span>REGISTRAR NEQUI / EFECTIVO</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <FinanceCard label="Ingresos" value={formatCOP(resumen.ingresos)} icon={<TrendingUp />} color="green" />
                <FinanceCard label="Egresos" value={formatCOP(resumen.egresos)} icon={<TrendingDown />} color="red" />
                <FinanceCard label="Balance Total" value={formatCOP(resumen.balance)} icon={<DollarSign />} color="gold" />
            </div>

            <div className="glass p-8 rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 border-b border-military-100/10 pb-6">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setView('DIARIO')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'DIARIO' ? 'bg-gold-500 text-military-950 shadow-lg' : 'bg-military-900 text-military-500'}`}
                        >
                            Arqueo Diario
                        </button>
                    </div>
                    <div className="flex items-center gap-2 bg-military-900/50 px-4 py-2 rounded-xl border border-military-800">
                        <Calendar size={14} className="text-gold-500" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">
                            {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }).toUpperCase()}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold-500" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-military-900/50">
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400">Fecha / Hora</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400">Concepto / Categoría</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400">Cliente</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400">Método</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-military-400 text-right">Valor</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-military-100/5">
                                {movimientos.map((m) => (
                                    <TransactionRow 
                                        key={m.id} 
                                        date={new Date(m.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} 
                                        concept={m.concepto} 
                                        category={m.categoria} 
                                        type={m.tipo} 
                                        method={m.metodoPago}
                                        value={formatCOP(m.valor)}
                                        comprobante={m.comprobante}
                                        cliente={m.cliente}
                                    />
                                ))}
                                {movimientos.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-military-500 text-sm">No hay movimientos registrados hoy</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Registro */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-military-100/10 scale-in-center shadow-2xl">
                        <div className="p-8 border-b border-military-100/10 flex justify-between items-center bg-gold-gradient/5">
                            <h2 className="text-2xl font-black text-white italic">REGISTRAR MOVIMIENTO</h2>
                            <button onClick={() => setShowModal(false)} className="text-military-400 hover:text-white"><X /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setFormData({...formData, tipo: 'INGRESO'})} className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-all ${formData.tipo === 'INGRESO' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-military-900 border-military-800 text-military-500'}`}>
                                    Ingreso (+)
                                </button>
                                <button type="button" onClick={() => setFormData({...formData, tipo: 'EGRESO'})} className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-all ${formData.tipo === 'EGRESO' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-military-900 border-military-800 text-military-500'}`}>
                                    Egreso (-)
                                </button>
                            </div>

                            {/* Buscador de Cliente */}
                            <div className="relative">
                                <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Asociar Cliente (opcional)</label>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-military-500" />
                                    <input
                                        type="text"
                                        value={clienteSearch}
                                        onChange={e => handleClienteSearch(e.target.value)}
                                        placeholder="Buscar por nombre o cédula..."
                                        className="w-full bg-military-900 border border-military-800 rounded-xl pl-9 pr-4 py-3 text-white focus:border-gold-500 outline-none text-sm"
                                    />
                                    {searchingCliente && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500 animate-spin" />}
                                </div>
                                {clienteResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-military-900 border border-military-700 rounded-xl overflow-hidden shadow-xl">
                                        {clienteResults.map(c => (
                                            <button key={c.id} type="button" onClick={() => seleccionarCliente(c)}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-military-800 transition-colors text-left">
                                                <User size={14} className="text-gold-500 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-bold text-white">{c.nombres} {c.apellidos}</p>
                                                    <p className="text-[10px] text-military-500">{c.cedula}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {clienteSeleccionado && (
                                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-gold-500/10 border border-gold-500/30 rounded-xl">
                                        <User size={12} className="text-gold-500" />
                                        <span className="text-xs font-bold text-gold-400">Vinculado: {clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</span>
                                        <button type="button" onClick={() => { setClienteSeleccionado(null); setClienteSearch(''); setFormData(prev => ({ ...prev, clienteId: '' })); }} className="ml-auto text-military-500 hover:text-red-400">
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Concepto</label>
                                    <input required type="text" value={formData.concepto} onChange={e => setFormData({...formData, concepto: e.target.value})} className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none" placeholder="Ej: Abono trámite Juan Perez" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Valor (COP)</label>
                                        <input required type="number" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Método</label>
                                        <select value={formData.metodoPago} onChange={e => setFormData({...formData, metodoPago: e.target.value})} className="w-full bg-military-900 border border-military-800 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none appearance-none">
                                            <option value="NEQUI">NEQUI (Transferencia)</option>
                                            <option value="EFECTIVO">EFECTIVO (Caja física)</option>
                                            <option value="TRANSFERENCIA">DAVIPLATA / OTRO</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-military-500 mb-2 block">Pantallazo / Comprobante</label>
                                    <div className="relative group">
                                        <input type="file" onChange={handleFileUpload} className="hidden" id="screenshot-upload" accept="image/*" />
                                        <label htmlFor="screenshot-upload" className="w-full flex items-center justify-center gap-3 p-4 bg-military-950/50 border-2 border-dashed border-military-800 rounded-2xl cursor-pointer hover:border-gold-500/50 hover:bg-military-900 transition-all">
                                            {uploading ? <Loader2 className="animate-spin text-gold-500" /> : (
                                                formData.comprobante ? <CheckCircle2 className="text-green-500" /> : <Camera className="text-military-500" />
                                            )}
                                            <span className="text-xs font-bold text-military-400">
                                                {formData.comprobante ? '¡Subido con éxito!' : 'Cargar pantallazo Nequi'}
                                            </span>
                                        </label>
                                    </div>
                                    {formData.comprobante && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src={getResourceUrl(formData.comprobante)} className="w-12 h-12 object-cover rounded-lg border border-military-700" alt="Preview" />
                                            <button type="button" onClick={() => setFormData({...formData, comprobante: ''})} className="text-red-500 text-[10px] font-bold">Quitar</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-gold-gradient text-military-950 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                GUARDAR MOVIMIENTO
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

const FinanceCard = ({ label, value, icon, color }) => {
    const colorMap = {
        gold: 'text-gold-500 bg-gold-500/5 border-gold-500/10',
        red: 'text-red-500 bg-red-500/5 border-red-500/10',
        green: 'text-green-500 bg-green-500/5 border-green-500/10'
    };
    return (
        <div className={`glass p-8 rounded-[2.5rem] relative overflow-hidden group hover:translate-y-[-4px] transition-all border ${colorMap[color]}`}>
             <div className="p-3 rounded-2xl bg-military-800/50 border border-military-100/10 mb-6 inline-block">
                {React.cloneElement(icon, { size: 28 })}
             </div>
             <p className="text-military-400 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
             <p className="text-3xl font-black text-white tracking-tight">{value}</p>
             <div className={`absolute right-0 bottom-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
                 {React.cloneElement(icon, { size: 80 })}
             </div>
        </div>
    )
}

const TransactionRow = ({ date, concept, category, type, method, value, comprobante, cliente }) => (
    <tr className="hover:bg-military-800/30 transition-colors group">
        <td className="p-4">
             <p className="text-xs font-bold text-white">{date}</p>
        </td>
        <td className="p-4">
            <p className="text-xs font-bold text-white leading-tight">{concept}</p>
            <p className="text-[10px] text-military-500 font-bold uppercase tracking-widest">{category}</p>
        </td>
        <td className="p-4">
            {cliente ? (
                <div className="flex items-center gap-2">
                    <User size={12} className="text-gold-500 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-white leading-none">{cliente.nombres} {cliente.apellidos}</p>
                        <p className="text-[9px] text-military-500">{cliente.cedula}</p>
                    </div>
                </div>
            ) : (
                <span className="text-[10px] text-military-700 font-bold italic">Sin cliente</span>
            )}
        </td>
        <td className="p-4">
            <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-military-800 text-military-300 border border-military-700`}>
                    {method || 'EFECTIVO'}
                </span>
                {comprobante && (
                    <a href={getResourceUrl(comprobante)} target="_blank" rel="noreferrer" className="text-gold-500 hover:text-white transition-colors">
                        <ImageIcon size={14} />
                    </a>
                )}
            </div>
        </td>
        <td className="p-4 text-right">
             <p className={`text-sm font-black ${type === 'INGRESO' ? 'text-green-500' : 'text-red-500'}`}>{value}</p>
        </td>
        <td className="p-4 text-right">
            <button 
                onClick={() => toast(`${concept}${cliente ? ` · ${cliente.nombres}` : ''}`, { icon: '📊' })}
                className="text-military-500 group-hover:text-gold-500 p-2 transition-colors"
                title="Ver detalles"
            >
                <User size={16} />
            </button>
        </td>
    </tr>
)

export default Caja
