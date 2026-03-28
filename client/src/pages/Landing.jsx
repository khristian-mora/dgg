import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Shield, 
    ChevronRight, 
    Target, 
    FileCheck, 
    Users, 
    MessageCircle, 
    ArrowRight, 
    Lock, 
    Zap,
    Scale,
    CheckCircle2,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const services = [
        {
            title: "Permiso para Porte",
            description: "Asesoría integral para la obtención del permiso de porte nacional.",
            icon: <Shield className="text-gold-500" size={32} />,
            details: ["Evaluación psicomédica", "Trámites ante DCCAE", "Curso de manejo"]
        },
        {
            title: "Permiso para Tenencia",
            description: "Legalice la seguridad en su hogar o empresa con expertos.",
            icon: <Lock className="text-gold-500" size={32} />,
            details: ["Inspección de seguridad", "Registro INDUMIL", "Actualización de datos"]
        },
        {
            title: "Cesión de Armas",
            description: "Transferencia de propiedad legal y segura entre ciudadanos.",
            icon: <Users className="text-gold-500" size={32} />,
            details: ["Contrato de compraventa", "Verificación de antecedentes", "Paz y salvo"]
        },
        {
            title: "Revalidación",
            description: "No deje vencer sus permisos. Gestión rápida y proactiva.",
            icon: <Zap className="text-gold-500" size={32} />,
            details: ["Alertas tempranas", "Renovación digital", "Citas prioritarias"]
        }
    ];

    const steps = [
        {
            num: "01",
            title: "Registro Digital",
            desc: "Cree su perfil seguro y cargue su información básica."
        },
        {
            num: "02",
            title: "Asesoría Técnica",
            desc: "Validamos su perfil de acuerdo con la Ley 1581 y normatividad militar."
        },
        {
            num: "03",
            title: "Gestión de Documentos",
            desc: "Nos encargamos del papeleo pesado y las citas con INDUMIL."
        },
        {
            num: "04",
            title: "Entrega Final",
            desc: "Reciba sus permisos y documentos legalmente legalizados."
        }
    ];

    return (
        <div className="min-h-screen bg-military-950 font-outfit text-military-100 overflow-x-hidden selection:bg-gold-500/30">
            {/* Navigation */}
            <nav className="fixed w-full z-[100] transition-all duration-300 backdrop-blur-md border-b border-gold-500/10 bg-military-950/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="p-2 bg-gold-gradient rounded-xl shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform">
                            <Shield size={24} className="text-military-950" />
                        </div>
                        <div>
                            <span className="text-xl font-black text-white tracking-tight">GestorArmas</span>
                            <span className="block text-[10px] text-gold-500 font-black uppercase tracking-widest leading-none mt-0.5">Pro Edition</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Servicios', 'Nosotros', 'Proceso'].map((item) => (
                            <a 
                                key={item} 
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-bold text-military-400 hover:text-gold-500 transition-colors uppercase tracking-widest"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="h-6 w-px bg-military-800 mx-2"></div>
                        <Link to="/login" className="text-sm font-bold text-white hover:text-gold-500 transition-colors uppercase tracking-widest">
                            Acceso Agentes
                        </Link>
                        <Link 
                            to="/register" 
                            className="px-6 py-3 bg-gold-gradient text-military-950 font-black rounded-2xl shadow-xl shadow-gold-500/20 hover:scale-105 active:scale-95 transition-all text-sm"
                        >
                            REGISTRARSE
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden glass animate-in slide-in-from-top duration-300 p-6 flex flex-col gap-6">
                         {['Servicios', 'Nosotros', 'Proceso'].map((item) => (
                            <a 
                                key={item} 
                                href={`#${item.toLowerCase()}`}
                                className="text-lg font-bold text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                        <Link to="/login" className="text-lg font-bold text-gold-500">Acceso Agentes</Link>
                        <Link to="/register" className="w-full py-4 bg-gold-gradient text-military-950 font-black rounded-2xl text-center">
                            REGISTRARSE
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-military-500/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-center lg:text-left animate-in fade-in slide-in-from-left duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full text-gold-500 text-xs font-black uppercase tracking-widest mb-6">
                            <Scale size={14} /> Soluciones Legales de Confianza
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8">
                            Gestión Elite para sus <span className="text-transparent bg-clip-text bg-gold-gradient">Permisos de Armas</span>
                        </h1>
                        <p className="text-lg md:text-xl text-military-400 max-w-2xl lg:mx-0 mx-auto mb-10 leading-relaxed">
                            Expertos en trámites ante el DCCAE e INDUMIL. Seguridad jurídica, eficiencia operativa y reserva absoluta para ciudadanos y empresas.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link to="/register" className="group w-full sm:w-auto px-10 py-5 bg-gold-gradient text-military-950 font-black rounded-[2rem] shadow-2xl shadow-gold-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                INICIAR MI TRÁMITE <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#servicios" className="w-full sm:w-auto px-10 py-5 bg-military-900/50 border border-military-800 text-white font-bold rounded-[2rem] hover:bg-military-800 transition-all flex items-center justify-center gap-3 group">
                                VER SERVICIOS <ArrowRight size={18} className="text-gold-500 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                        
                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                             <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">12k+</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Trámites Exitosos</span>
                             </div>
                             <div className="h-10 w-px bg-military-800"></div>
                             <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">99%</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Legalidad Total</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 relative animate-in fade-in zoom-in duration-1000 delay-300">
                        {/* Abstract Hero Image Placeholder (Rendered with CSS for Premium Look) */}
                        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                            <div className="absolute inset-0 bg-gold-gradient rounded-[3rem] rotate-6 opacity-20 blur-2xl"></div>
                            <div className="relative h-full w-full glass rounded-[3rem] border border-gold-500/30 p-8 flex flex-col justify-end overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-full bg-military-950/40 z-0"></div>
                                <div className="relative z-10">
                                    <div className="p-4 bg-gold-500/20 backdrop-blur-xl rounded-2xl border border-gold-500/30 w-fit mb-6 animate-bounce">
                                        <FileCheck size={32} className="text-gold-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">Trámite Seguro DCCAE</h3>
                                    <p className="text-military-400 text-sm">Nuestro sistema de inteligencia valida automáticamente sus documentos antes de la radicación final.</p>
                                </div>
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-500/20 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section id="servicios" className="py-24 px-6 relative bg-military-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 flex flex-col items-center">
                        <span className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-4">Nuestra Experticia</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Servicios Especializados</h2>
                        <div className="w-20 h-1.5 bg-gold-gradient rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((s, idx) => (
                            <div key={idx} className="glass p-8 rounded-[2.5rem] border border-military-100/10 hover:border-gold-500/30 transition-all hover:-translate-y-2 group">
                                <div className="mb-6 p-4 bg-military-800 rounded-2xl w-fit group-hover:bg-gold-500/10 transition-colors">
                                    {s.icon}
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">{s.title}</h4>
                                <p className="text-military-400 text-sm mb-6 leading-relaxed">{s.description}</p>
                                <ul className="space-y-3">
                                    {s.details.map((d, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-military-500 uppercase tracking-tighter">
                                            <CheckCircle2 size={12} className="text-gold-500" /> {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="proceso" className="py-24 px-6 bg-military-950">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl text-center lg:text-left">
                            <span className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-4 block">Metodología Elite</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">¿Cómo lo Hacemos?</h2>
                            <p className="text-military-400">Diseñamos un flujo de trabajo simplificado para que usted no tenga que preocuparse por la complejidad técnica.</p>
                        </div>
                        <div className="bg-military-900 border border-military-800 p-2 rounded-2xl flex gap-2">
                            <button className="px-6 py-3 bg-gold-gradient text-military-950 font-black rounded-xl text-xs uppercase tracking-widest">Procedimiento</button>
                            <button className="px-6 py-3 text-military-400 font-black rounded-xl text-xs uppercase tracking-widest hover:text-white transition-colors">Normatividad</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-military-800 -translate-y-1/2 -z-10 bg-gradient-to-r from-transparent via-military-800 to-transparent"></div>
                        
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
                                <div className="text-6xl font-black text-gold-500/10 absolute -top-8 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0">{step.num}</div>
                                <div className="w-12 h-12 rounded-full bg-military-950 border-4 border-military-800 flex items-center justify-center z-10 mb-6 group hover:border-gold-500 transition-colors">
                                    <div className="w-3 h-3 bg-gold-gradient rounded-full"></div>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">{step.title}</h4>
                                <p className="text-military-400 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="nosotros" className="py-24 px-6 bg-military-900/40 relative">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1">
                        <div className="glass p-2 rounded-[3rem] max-w-lg mx-auto lg:mx-0">
                            <div className="relative overflow-hidden rounded-[2.8rem] aspect-[4/5] bg-military-800">
                                {/* Use an image prompt here or a rich color fill */}
                                <div className="absolute inset-0 bg-gradient-to-t from-military-950 via-transparent to-transparent z-10"></div>
                                <div className="absolute inset-0 flex items-center justify-center p-12 text-center flex-col z-20">
                                    <Target size={64} className="text-gold-500/20 mb-8" />
                                    <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter italic opacity-80">Precision & Security</h3>
                                    <div className="w-full h-px bg-gold-500/20 mb-6"></div>
                                    <p className="text-sm font-bold text-military-500 uppercase tracking-widest leading-loose">Herencia de Excelencia Militar aplicada al servicio civil</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                        <span className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 block">Nuestra Identidad</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">Más que Gestores, sus <span className="text-transparent bg-clip-text bg-gold-gradient">Aliados Estratégicos</span></h2>
                        <div className="space-y-6 text-military-400 text-lg leading-relaxed mb-10">
                            <p>
                                Fundada sobre los valores de <strong>honor, disciplina y reserva</strong>, GestorArmas Pro nace para llenar el vacío de profesionalismo en la industria de la gestión de permisos en Colombia.
                            </p>
                            <p>
                                Comprendemos que su seguridad y la de su familia no son un juego. Por ello, aplicamos estándares de inteligencia militar en la revisión de cada expediente, garantizando que su radicación sea impecable.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                             <div>
                                <h5 className="text-white font-black text-xl mb-1">20+ Años</h5>
                                <p className="text-xs text-military-500 uppercase font-black tracking-widest">Experiencia Combinada</p>
                             </div>
                             <div>
                                <h5 className="text-white font-black text-xl mb-1">Ley 1581</h5>
                                <p className="text-xs text-military-500 uppercase font-black tracking-widest">Dato Protegido</p>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-gold-500/20 shadow-[0_0_50px_rgba(213,161,21,0.1)]">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/20 rounded-full blur-[80px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8">¿Listo para Asegurar su <span className="text-gold-500">Legalidad</span>?</h2>
                        <p className="text-military-400 text-xl max-w-2xl mx-auto mb-12">
                            Únase a los miles de colombianos que han confiado en nuestro sistema para sus trámites ante INDUMIL.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link to="/register" className="px-12 py-5 bg-gold-gradient text-military-950 font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg">
                                REGISTRARME AHORA
                            </Link>
                            <a 
                                href="https://wa.me/573115312653" 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-12 py-5 bg-green-500/10 border border-green-500/30 text-green-500 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-green-500/20 transition-all text-lg"
                            >
                                <MessageCircle size={24} /> ASESORÍA WHATSAPP
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-military-800/50 bg-military-950">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                                <div className="p-2 bg-gold-gradient rounded-xl shadow-lg">
                                    <Shield size={24} className="text-military-950" />
                                </div>
                                <span className="text-xl font-black text-white">GestorArmas</span>
                            </div>
                            <p className="text-military-500 text-sm leading-relaxed mb-8">
                                Líderes en gestión administrativa para la tenencia y porte legal de armas en el territorio colombiano.
                            </p>
                        </div>
                        <div>
                            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-8">Navegación</h5>
                            <ul className="space-y-4 text-sm text-military-500 font-bold">
                                <li><a href="#" className="hover:text-gold-500 transition-colors">Inicio</a></li>
                                <li><a href="#servicios" className="hover:text-gold-500 transition-colors">Servicios</a></li>
                                <li><a href="#proceso" className="hover:text-gold-500 transition-colors">Proceso</a></li>
                                <li><Link to="/login" className="hover:text-gold-500 transition-colors">Backoffice</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-8">Legal</h5>
                            <ul className="space-y-4 text-sm text-military-500 font-bold">
                                <li><button className="hover:text-gold-500 transition-colors">Política de Datos</button></li>
                                <li><button className="hover:text-gold-500 transition-colors">Términos del Servicio</button></li>
                                <li><button className="hover:text-gold-500 transition-colors">Habeas Data</button></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-8">Contacto</h5>
                            <div className="space-y-4 text-sm text-military-500 font-bold">
                                <p>Barrancabermeja - Santander</p>
                                <p className="text-gold-500">contacto@dggestionarmas.com</p>
                                <p>+57 311 531 2653</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-military-900 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
                        <p className="text-[10px] font-bold text-military-500 uppercase tracking-widest">
                            © 2026 GestorArmas Pro. Todos los derechos reservados. Diseñado para la excelencia.
                        </p>
                        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
                            <span>Sujeto a normas DCCAE</span>
                            <span>Seguridad Nivel Militar</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp */}
            <a 
                href="https://wa.me/573115312653" 
                target="_blank" 
                rel="noreferrer"
                className="fixed bottom-8 right-8 z-[500] p-4 bg-green-500 text-white rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-110 active:scale-90 transition-all group"
            >
                <MessageCircle size={32} />
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-military-900 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-military-800 shadow-xl">
                    ¿Dudas? Chat en Vivo
                </span>
            </a>
        </div>
    );
};

export default Landing;
