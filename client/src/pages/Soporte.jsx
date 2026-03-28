import React, { useState } from 'react'
import { BookOpen, Phone, ExternalLink, ShieldCheck, ShoppingCart, Users, Search, Download, Globe, MessageSquare, AlertCircle } from 'lucide-react'

const Soporte = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const linksDCCAE = [
        { name: 'Portal SIAEM / DCCAE', url: 'https://dccae.cgfm.mil.co/', desc: 'Nuevo portal para trámites, citas y trazabilidad SIAEM.' },
        { name: 'Trámites y Servicios', url: 'https://www.controlarmas.mil.co/tramites-y-servicios', desc: 'Guía oficial de trámites del DCCAE.' },
        { name: 'Formatos de Solicitud', url: 'https://www.controlarmas.mil.co/tramites-y-servicios/formatos-y-formularios', desc: 'Descarga de formularios oficiales.' },
        { name: 'Catálogo de Armas Indumil', url: 'https://www.indumil.gov.co/categoria-producto/armas/', desc: 'Catálogo actualizado de armas y municiones.' }
    ];

    const leyes = [
        { id: 'L2197', title: 'Ley 2197 de 2022', desc: 'Ley de Seguridad Ciudadana (Traumáticas).', url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=176406' },
        { id: 'D2535', title: 'Decreto 2535 de 1993', desc: 'Normas sobre armas, municiones y explosivos.', url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?id=1259520' },
        { id: 'D1417', title: 'Decreto 1417 de 2021', desc: 'Reglamentación de armas no letales / traumáticas.', url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=174094' }
    ];

    const contactos = [
        { name: 'DCCAE Bogotá (Central)', phone: '601 222 3456', cargo: 'Sede Principal' },
        { name: 'ACE - Psicomédicos', phone: '310 987 6543', cargo: 'Exámenes de Manejo' },
        { name: 'Vigilancia Privada - SuperVigilancia', phone: '601 307 8038', cargo: 'Trámites Empresas' },
        { name: 'Improntas Indumil', phone: '312 111 2233', cargo: 'Sede Fabril' },
        { name: 'Soporte Software DGG', phone: '+57 321 000 0000', cargo: 'Asistencia Técnica AI' }
    ];

    const searchResults = contactos.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div>
                <p className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Centro de Recursos DCCAE</p>
                <h1 className="text-4xl font-black text-white tracking-tight italic">SOPORTE Y HERRAMIENTAS</h1>
            </div>

            {/* Accesos Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SoporteCard icon={<BookOpen />} label="Legislación" to="#legislacion" color="blue" />
                <SoporteCard icon={<Phone />} label="Directorio" to="#directorio" color="green" />
                <SoporteCard icon={<AlertCircle />} label="Guía de Requisitos" to="#requisitos" color="gold" />
                <SoporteCard icon={<ExternalLink />} label="Enlaces DCCAE" to="#enlaces" color="red" />
            </div>

            {/* Enlaces y Leyes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div id="enlaces" className="glass p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-8">
                        <Globe size={20} className="text-blue-400" /> Enlaces Oficiales
                    </h3>
                    <div className="space-y-4">
                        {linksDCCAE.map(link => (
                            <a key={link.name} href={link.url} target="_blank" rel="noreferrer" 
                                className="block p-4 bg-military-900/40 border border-military-800 rounded-2xl hover:border-blue-500/50 transition-all group">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-white group-hover:text-blue-400">{link.name}</span>
                                    <ExternalLink size={14} className="text-military-600" />
                                </div>
                                <p className="text-[10px] text-military-500 mt-1">{link.desc}</p>
                            </a>
                        ))}
                    </div>
                </div>

                <div id="legislacion" className="glass p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-8">
                        <Download size={20} className="text-gold-500" /> Legislación Vigente
                    </h3>
                    <div className="space-y-4">
                        {leyes.map(ley => (
                            <a key={ley.id} href={ley.url} target="_blank" rel="noreferrer" 
                                className="block p-4 bg-military-900/40 border border-military-800 rounded-2xl flex items-center justify-between hover:border-gold-500/40 hover:bg-military-800/20 group transition-all">
                                <div>
                                    <span className="text-xs font-black text-gold-500 uppercase tracking-widest">{ley.id}</span>
                                    <p className="text-sm font-bold text-white group-hover:text-gold-500 transition-colors">{ley.title}</p>
                                    <p className="text-[10px] text-military-500 mt-1">{ley.desc}</p>
                                </div>
                                <div className="p-2 bg-military-800 rounded-xl text-military-600 group-hover:text-gold-500 transition-colors">
                                    <ExternalLink size={16} />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Directorio y Soporte */}
            <div id="directorio" className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 glass p-8 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                             <Phone size={20} className="text-green-400" /> Directorio de Entidades
                        </h3>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-military-500 group-focus-within:text-gold-500 transition-colors" size={14} />
                            <input 
                                type="text" 
                                placeholder="Buscar contacto..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-military-950/40 border border-military-800 rounded-xl text-xs focus:outline-none focus:border-gold-500/50" 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map(c => (
                            <ContactItem key={c.name} name={c.name} phone={c.phone} cargo={c.cargo} />
                        ))}
                    </div>
                </div>

                <div className="lg:w-1/3 glass p-8 rounded-[2.5rem] bg-gold-gradient/5 border-gold-500/20">
                     <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                        <MessageSquare size={20} className="text-gold-500" /> Asistencia Técnica
                    </h3>
                    <p className="text-xs text-military-400 mb-8 leading-relaxed">
                        Si tienes problemas con el software o necesitas ayuda con la carga masiva de datos, contacta a soporte técnico.
                    </p>
                    <button className="w-full py-4 bg-gold-gradient text-military-950 font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gold-500/10">
                        <Phone size={18} />
                        LLAMAR A SOPORTE
                    </button>
                </div>
            </div>
        </div>
    )
}

const SoporteCard = ({ icon, label, to, color }) => {
    const colorMap = {
        gold: 'bg-gold-500/10 text-gold-500 border-gold-500/20 hover:border-gold-500/50',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/50',
        green: 'bg-green-500/10 text-green-400 border-green-500/20 hover:border-green-500/50',
        red: 'bg-red-500/10 text-red-500 border-red-500/20 hover:border-red-500/50'
    };
    return (
        <a href={to} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border ${colorMap[color]} hover:translate-y-[-4px] transition-all group`}>
            <div className="mb-3 group-hover:scale-110 transition-transform">
                {React.cloneElement(icon, { size: 28 })}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </a>
    )
}

const ContactItem = ({ name, phone, cargo }) => (
    <div className="flex items-center justify-between p-4 bg-military-900/40 rounded-2xl border border-military-100/5 hover:border-military-600 transition-all group">
        <div>
            <p className="text-sm font-bold text-white leading-tight group-hover:text-green-400 transition-colors">{name}</p>
            <p className="text-[9px] text-military-500 font-bold uppercase tracking-widest">{cargo}</p>
        </div>
        <a href={`tel:${phone}`} className="p-3 bg-military-800/80 rounded-xl text-gold-500 hover:text-white transition-all shadow-lg">
            <Phone size={14} />
        </a>
    </div>
)

export default Soporte

