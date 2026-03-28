import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, FileText, DollarSign, Download, Filter, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/api';
import toast from 'react-hot-toast';

const Reportes = () => {
    const [loading, setLoading] = useState(true);
    const [periodType, setPeriodType] = useState('mensual'); // 'diario', 'mensual', 'anual'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [financialData, setFinancialData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);

    const COLORS = ['#d5a115', '#68774c', '#414b32', '#92580f'];

    useEffect(() => {
        fetchFinancialReport();
    }, [periodType, selectedDate]);

    const fetchFinancialReport = async () => {
        try {
            setLoading(true);
            let response;
            
            if (periodType === 'diario') {
                response = await api.caja.getArqueoDiario(selectedDate.toISOString().split('T')[0]);
            } else if (periodType === 'mensual') {
                response = await api.caja.getArqueoMensual(selectedDate.getMonth(), selectedDate.getFullYear());
            } else {
                response = await api.caja.getArqueoAnual(selectedDate.getFullYear());
            }

            if (response) {
                setFinancialData(response.resumen);
                
                // Formatear datos para el gráfico según el periodo
                if (periodType === 'anual' && response.grafico) {
                    setChartData(response.grafico);
                } else if (response.movimientos) {
                    // Agrupar movimientos por categoría para el PieChart
                    const dist = response.movimientos.reduce((acc, current) => {
                        const cat = current.categoria || 'Otro';
                        acc[cat] = (acc[cat] || 0) + current.valor;
                        return acc;
                    }, {});
                    setDistributionData(Object.entries(dist).map(([name, value]) => ({ name, value })));
                    
                    // Si es mensual, mostramos tendencia diaria (simulada o agrupada)
                    const tempChart = response.movimientos
                        .filter(m => m.tipo === 'INGRESO')
                        .slice(0, 10).reverse()
                        .map(m => ({
                            name: new Date(m.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
                            ingresos: m.valor
                        }));
                    setChartData(tempChart);
                }
            }
        } catch (error) {
            console.error('Error fetching financial report:', error);
            toast.error('Error al cargar datos financieros');
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        const newDate = new Date(selectedDate);
        if (periodType === 'diario') newDate.setDate(selectedDate.getDate() - 1);
        else if (periodType === 'mensual') newDate.setMonth(selectedDate.getMonth() - 1);
        else newDate.setFullYear(selectedDate.getFullYear() - 1);
        setSelectedDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(selectedDate);
        if (periodType === 'diario') newDate.setDate(selectedDate.getDate() + 1);
        else if (periodType === 'mensual') newDate.setMonth(selectedDate.getMonth() + 1);
        else newDate.setFullYear(selectedDate.getFullYear() + 1);
        setSelectedDate(newDate);
    };

    const formatCurrency = (val) => `$${(val || 0).toLocaleString()}`;

    const getPeriodLabel = () => {
        if (periodType === 'diario') return selectedDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
        if (periodType === 'mensual') return selectedDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
        return `Año ${selectedDate.getFullYear()}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header con Selectores */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Monitor Administrativo</p>
                    <h1 className="text-4xl font-black text-white tracking-tight italic">ESTADÍSTICAS FINANCIERAS</h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-military-900/60 p-2 rounded-2xl border border-military-100/10">
                    <div className="flex bg-military-950 p-1 rounded-xl border border-military-800">
                        {['diario', 'mensual', 'anual'].map(type => (
                            <button
                                key={type}
                                onClick={() => setPeriodType(type)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    periodType === type ? 'bg-gold-gradient text-military-950 shadow-lg' : 'text-military-500 hover:text-white'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 px-4">
                        <button onClick={handlePrevious} className="p-2 hover:bg-military-800 rounded-lg text-gold-500 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold text-white uppercase min-w-[150px] text-center">
                            {getPeriodLabel()}
                        </span>
                        <button onClick={handleNext} className="p-2 hover:bg-military-800 rounded-lg text-gold-500 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tarjetas Analíticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticCard 
                    title="Ingresos Totales" 
                    value={formatCurrency(financialData?.ingresos)} 
                    info={getPeriodLabel()} 
                    icon={<TrendingUp size={20}/>} 
                    color="gold" 
                />
                <AnalyticCard 
                    title="Egresos / Gastos" 
                    value={formatCurrency(financialData?.egresos)} 
                    info="operaciones caja" 
                    icon={<DollarSign size={20}/>} 
                    color="military" 
                />
                <AnalyticCard 
                    title="Balance Neto" 
                    value={formatCurrency(financialData?.balance)} 
                    info="utilidad bruta" 
                    icon={<FileText size={20}/>} 
                    color={financialData?.balance >= 0 ? "gold" : "red"} 
                />
                <AnalyticCard 
                    title="Movimientos" 
                    value={financialData?.totalMovimientos || "0"} 
                    info="registros en caja" 
                    icon={<Calendar size={20}/>} 
                    color="military" 
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tendencia Temporal */}
                <div className="glass p-8 rounded-[2.5rem] border border-military-100/10 h-[450px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
                             <TrendingUp size={16} className="text-gold-500" /> Tendencia de Ingresos
                        </h3>
                    </div>
                    <div className="flex-1 w-full" style={{ minWidth: 0, height: 300 }}>
                        {loading ? (
                            <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d5a115" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#d5a115" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3428" vertical={false} />
                                    <XAxis dataKey="name" stroke="#515e3c" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis tickFormatter={formatCurrency} stroke="#515e3c" fontSize={10} tickLine={false} axisLine={false} hide />
                                    <Tooltip 
                                        formatter={(val) => formatCurrency(val)}
                                        contentStyle={{ background: '#181b14', border: '1px solid #414b32', borderRadius: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="ingresos" stroke="#d5a115" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Distribución de Categorías */}
                <div className="glass p-8 rounded-[2.5rem] border border-military-100/10 h-[450px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
                             <FileText size={16} className="text-gold-500" /> Distribución por Categoría
                        </h3>
                    </div>
                    <div className="w-full flex flex-col md:flex-row items-center" style={{ minWidth: 0, height: 260 }}>
                        {loading ? (
                            <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" /></div>
                        ) : distributionData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val) => formatCurrency(val)} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-3 px-4 min-w-[150px]">
                                    {distributionData.map((d, i) => (
                                        <div key={d.name} className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="text-[10px] font-bold text-military-300 uppercase">{d.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-white">{formatCurrency(d.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="w-full text-center text-military-500 text-xs italic">No hay datos en este periodo</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnalyticCard = ({ title, value, info, icon, color }) => {
    const isGold = color === 'gold';
    const isRed = color === 'red';

    return (
        <div className={`glass p-6 rounded-3xl border ${
            isGold ? 'border-gold-500/20 shadow-lg shadow-gold-500/5' : 
            isRed ? 'border-red-500/20' : 'border-military-100/10'
        } hover:translate-y-[-4px] transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${isGold ? 'bg-gold-gradient text-military-950' : 'bg-military-800 text-gold-500'}`}>
                    {icon}
                </div>
                <TrendingUp size={16} className={isGold ? 'text-gold-500' : 'text-military-600'} />
            </div>
            <p className="text-[10px] font-black text-military-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-2xl font-black text-white mb-1">{value}</h4>
            <p className="text-[9px] text-military-500 font-bold uppercase tracking-widest">{info}</p>
        </div>
    );
};

export default Reportes;
