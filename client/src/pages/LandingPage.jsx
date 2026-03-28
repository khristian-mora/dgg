import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft, ChevronRight, ArrowRight, CheckCircle, Phone, Mail, MapPin, Menu, X, FileText, Users, Award, Clock, DollarSign, Star, MessageCircle, AlertTriangle, TrendingUp, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [footerModal, setFooterModal] = useState(null);

    const slides = [
        {
            title: "Gestión y Asesorías Especializadas",
            subtitle: "ARMAS DE FUEGO DE DEFENSA PERSONAL",
            description: "Expertos en trámites ante el DCCAE e INDUMIL. Seguridad jurídica, eficiencia operativa y reserva absoluta para ciudadanos y empresas.",
            cta: "INICIAR MI TRÁMITE",
            image: "https://www.indumil.gov.co/wp-content/uploads/2024/02/Fusil_Galil_Ace_21_01.png"
        },
        {
            title: "Pistola Córdova Compacta",
            subtitle: "Diseño colombiano de vanguardia",
            description: "La Pistola Córdova ha sido diseñada y fabricada en Colombia para satisfacer las demandas de uso oficial y defensa personal.",
            cta: "VER SERVICIOS",
            image: "https://www.indumil.gov.co/wp-content/uploads/2024/02/compacta.jpg"
        },
        {
            title: "Indumil Ultra Martial .38",
            subtitle: "Defensa personal de alto nivel",
            description: "Este tipo de arma es muy valorada por su simplicidad de uso y su resistencia. Fabricada bajo estándares militares.",
            cta: "CONOCER MÁS",
            image: "https://www.indumil.gov.co/wp-content/uploads/2024/02/Revolver_Indumil_Martial_03.png"
        }
    ];

    const stats = [
        { value: "12k+", label: "Trámites Exitosos" },
        { value: "99%", label: "Legalidad Total" },
        { value: "20+", label: "Años de Experiencia" }
    ];

    const servicios = [
        {
            icon: <FileText size={32} />,
            title: "Permiso para Porte",
            description: "Asesoría integral para la obtención del permiso de porte nacional.",
            items: ["Evaluación psicomédica", "Trámites ante DCCAE", "Curso de manejo"]
        },
        {
            icon: <Shield size={32} />,
            title: "Permiso para Tenencia",
            description: "Legalice la seguridad en su hogar o empresa con expertos.",
            items: ["Inspección de seguridad", "Registro INDUMIL", "Actualización de datos"]
        },
        {
            icon: <Users size={32} />,
            title: "Cesión de Armas",
            description: "Transferencia de propiedad legal y segura entre ciudadanos.",
            items: ["Contrato de compraventa", "Verificación de antecedentes", "Paz y salvo"]
        },
        {
            icon: <Clock size={32} />,
            title: "Revalidación",
            description: "No deje vencer sus permisos. Gestión rápida y proactiva.",
            items: ["Alertas tempranas", "Renovación digital", "Citas prioritarias"]
        }
    ];

    const proceso = [
        { step: "01", title: "Registro Digital", description: "Cree su perfil seguro y cargue su información básica." },
        { step: "02", title: "Asesoría Técnica", description: "Validamos su perfil de acuerdo con la Ley 1581 y normatividad militar." },
        { step: "03", title: "Gestión de Documentos", description: "Nos encargamos del papeleo pesado y las citas con INDUMIL." },
        { step: "04", title: "Entrega Final", description: "Reciba sus permisos y documentos legalmente legalizados." }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const securityData = [
        { year: '2019', hurtos: 260000 },
        { year: '2020', hurtos: 220000 },
        { year: '2021', hurtos: 280000 },
        { year: '2022', hurtos: 340000 },
        { year: '2023', hurtos: 370000 },
        { year: '2024', hurtos: 410000 },
    ];

    return (
        <div className="min-h-screen bg-military-950">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-military-800/50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                             <img src="/dgg_logo.png" alt="DGG Logo" className="w-12 h-12 rounded-xl object-contain shadow-[0_0_15px_rgba(213,161,21,0.3)]" />
                            <div>
                                <h2 className="text-xl font-black text-white leading-none">DGG</h2>
                                <span className="text-[8px] text-gold-500 uppercase tracking-widest font-bold">Gestión y Asesorías - ARMAS DE FUEGO DE DEFENSA PERSONAL</span>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <a href="#quienes-somos" className="text-military-300 hover:text-gold-500 font-bold text-sm transition-colors">Quiénes Somos</a>
                            <a href="#servicios" className="text-military-300 hover:text-gold-500 font-bold text-sm transition-colors">Servicios</a>
                            <a href="#proceso" className="text-military-300 hover:text-gold-500 font-bold text-sm transition-colors">Proceso</a>
                            <a href="https://wa.me/573115312653" target="_blank" className="text-military-300 hover:text-gold-500 font-bold text-sm transition-colors">WhatsApp</a>
                            <button 
                                onClick={() => navigate('/login')}
                                className="text-military-300 hover:text-gold-500 font-bold text-sm transition-colors"
                            >
                                INICIAR SESIÓN
                            </button>
                            <button 
                                onClick={() => navigate('/register')}
                                className="px-6 py-2.5 gold-gradient text-military-950 font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-gold-500/10"
                            >
                                REGISTRARSE
                            </button>
                        </div>

                        <button 
                            className="md:hidden text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-military-950 border-t border-military-800 p-6 space-y-4">
                        <a href="#quienes-somos" className="block text-military-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Quiénes Somos</a>
                        <a href="#servicios" className="block text-military-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Servicios</a>
                        <a href="#contacto" className="block text-military-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
                        <div className="pt-4 flex flex-col gap-3">
                            <button 
                                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                                className="w-full px-6 py-3 border border-military-800 text-military-300 font-bold rounded-xl"
                            >
                                INICIAR SESIÓN
                            </button>
                            <button 
                                onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                                className="w-full px-6 py-3 gold-gradient text-military-950 font-bold rounded-xl"
                            >
                                REGISTRARSE
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Carousel */}
            <div className="relative h-screen pt-16">
                {slides.map((slide, index) => (
                    <div 
                        key={index}
                        style={{ zIndex: index === currentSlide ? 10 : 1 }}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-military-950 via-military-950/80 to-transparent z-10" />
                        <img 
                            src={slide.image} 
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 z-20 flex items-center">
                            <div className="max-w-7xl mx-auto px-6 w-full">
                                <div className="max-w-2xl">
                                    <p className="text-gold-500 font-bold tracking-[0.3em] mb-4 animate-fade-in">{slide.subtitle}</p>
                                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                                        {slide.title}
                                    </h1>
                                    <p className="text-military-300 text-lg mb-8">{slide.description}</p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button 
                                            onClick={() => {
                                                if (slide.cta === 'VER SERVICIOS' || slide.cta === 'CONOCER MÁS') {
                                                    document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
                                                } else {
                                                    navigate('/register');
                                                }
                                            }}
                                            className="px-8 py-4 gold-gradient text-military-950 font-bold rounded-2xl text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(213,161,21,0.3)] flex items-center justify-center"
                                        >
                                            {slide.cta} <ArrowRight className="ml-2" size={20} />
                                        </button>
                                        <button 
                                            onClick={() => navigate('/login')}
                                            className="px-8 py-4 glass border border-military-800 text-white font-bold rounded-2xl text-lg hover:bg-military-800 transition-all flex items-center justify-center font-black uppercase tracking-widest"
                                        >
                                            Iniciar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Carousel Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-gold-500 w-8' : 'bg-military-700'}`}
                        />
                    ))}
                </div>

                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 glass rounded-full hover:bg-gold-500/20 transition-colors">
                    <ChevronLeft className="text-white" size={24} />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 glass rounded-full hover:bg-gold-500/20 transition-colors">
                    <ChevronRight className="text-white" size={24} />
                </button>
            </div>

            {/* Contexto de Seguridad Nacional */}
            <div className="py-24 px-6 bg-gradient-to-b from-military-950 to-military-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                <AlertTriangle size={14} /> Alerta de Seguridad Nacional
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                                Entendemos la problemática del país
                            </h2>
                            <p className="text-military-300 text-lg mb-8 leading-relaxed">
                                Sabemos que su prioridad es proteger lo que más ama. En un entorno complejo, la defensa personal no es solo una opción, es un **derecho fundamental**. Estar preparado para la peor situación no es paranoia, es responsabilidad.
                            </p>

                            <div className="space-y-6">
                                <div className="p-6 glass rounded-2xl border-l-4 border-gold-500">
                                    <p className="text-white font-bold italic">
                                        "La seguridad no se negocia, se gestiona. El derecho a la vida exige estar listo."
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                     <div className="flex-1 p-4 bg-military-900/40 rounded-xl border border-military-800">
                                         <p className="text-2xl font-black text-gold-500">+120%</p>
                                         <p className="text-[10px] text-military-500 uppercase font-black tracking-widest mt-1">Incremento Hurto (6 años)</p>
                                     </div>
                                     <div className="flex-1 p-4 bg-military-900/40 rounded-xl border border-military-800">
                                         <p className="text-2xl font-black text-gold-500">92k+</p>
                                         <p className="text-[10px] text-military-500 uppercase font-black tracking-widest mt-1">Hurtos mensuales est.</p>
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-8 rounded-[3rem] border border-military-100/10 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-cover bg-center brightness-[0.2] opacity-30 group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('/security_monitoring_city_night_1773868641447.png')" }}></div>
                           <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-1">Tendencia de Inseguridad (Hurtos)</p>
                                        <h4 className="text-lg font-bold text-white uppercase">REPORTE COLOMBIA 2019 - 2024</h4>
                                    </div>
                                    <TrendingUp className="text-gold-500" size={24} />
                                </div>

                                <div className="h-[300px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={securityData}>
                                            <defs>
                                                <linearGradient id="colorHurtos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D5A115" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#D5A115" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e24" vertical={false} />
                                            <XAxis dataKey="year" stroke="#4a5141" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis hide />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#181b14', border: '1px solid #d5a11533', borderRadius: '12px' }}
                                                itemStyle={{ color: '#D5A115', fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="hurtos" stroke="#D5A115" strokeWidth={3} fillOpacity={1} fill="url(#colorHurtos)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-[9px] text-center text-military-500 uppercase mt-4 font-bold tracking-widest italic opacity-50">
                                    *Datos basados en informes de hurtos a personas y residencias (consolidado anual)
                                </p>
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quiénes Somos */}
            <div id="quienes-somos" className="py-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gold-500/5 blur-[120px] rounded-full -z-10" />
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="aspect-square rounded-[3rem] overflow-hidden border-2 border-gold-500/20 shadow-2xl">
                                <img 
                                    src="/quienes_somos_team_1773866667700.png" 
                                    alt="Equipo de Expertos en Gestión de Armas" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8 glass p-8 rounded-[2rem] border border-gold-500/30 animate-bounce-slow">
                                <p className="text-4xl font-black text-gold-500">20+</p>
                                <p className="text-xs font-bold text-white uppercase tracking-widest leading-tight">Años de <br/>Trayectoría</p>
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-gold-500 font-bold tracking-[0.3em] mb-4">MÁS QUE GESTORES</p>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                                Expertos en Trámites y Permisos de Armas
                            </h2>
                            <p className="text-military-300 text-lg mb-8 leading-relaxed">
                                Somos expertos en trámites y permisos para el porte de armas, llevamos <strong>más de 20 años en la industria</strong>. Trabajamos con experiencia, puntualidad y transparencia, garantizando siempre el cumplimiento estricto de todas las leyes vigentes en Colombia.
                            </p>
                            
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-military-900/40 border border-military-800">
                                    <div className="p-3 rounded-xl bg-gold-500/10 text-gold-500">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Experiencia</h4>
                                        <p className="text-xs text-military-500">Dos décadas liderando el sector.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-military-900/40 border border-military-800">
                                    <div className="p-3 rounded-xl bg-gold-500/10 text-gold-500">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Puntualidad</h4>
                                        <p className="text-xs text-military-500">Gestión ágil de sus procesos.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-military-900/40 border border-military-800">
                                    <div className="p-3 rounded-xl bg-gold-500/10 text-gold-500">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Legalidad</h4>
                                        <p className="text-xs text-military-500">Transparencia total en cada paso.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-military-900/40 border border-military-800">
                                    <div className="p-3 rounded-xl bg-gold-500/10 text-gold-500">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Confianza</h4>
                                        <p className="text-xs text-military-500">Reserva absoluta de su información.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Servicios */}
            <div id="servicios" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-gold-500 font-bold tracking-[0.3em] mb-4">NUESTRA EXPERTICIA</p>
                        <h2 className="text-4xl font-black text-white">Servicios Especializados</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {servicios.map((servicio, index) => (
                            <div 
                                key={index}
                                className="glass p-8 rounded-[2rem] border border-military-800 hover:border-gold-500/30 transition-all group hover:-translate-y-2"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 mb-6 group-hover:bg-gold-500 group-hover:text-military-950 transition-all">
                                    {servicio.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{servicio.title}</h3>
                                <p className="text-military-400 text-sm mb-4">{servicio.description}</p>
                                <ul className="space-y-2">
                                    {servicio.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-military-500 text-xs">
                                            <CheckCircle size={14} className="text-green-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Proceso */}
            <div id="proceso" className="py-24 px-6 bg-military-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-gold-500 font-bold tracking-[0.3em] mb-4">METODOLOGÍA ELITE</p>
                        <h2 className="text-4xl font-black text-white mb-4">¿Cómo lo Hacemos?</h2>
                        <p className="text-military-400 max-w-2xl mx-auto">
                            Diseñamos un flujo de trabajo simplificado para que usted no tenga que preocuparse por la complejidad técnica.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {proceso.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="glass p-8 rounded-[2rem] border border-military-800 text-center h-full">
                                    <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-military-950 font-black text-2xl mx-auto mb-6">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                    <p className="text-military-400 text-sm">{step.description}</p>
                                </div>
                                {index < proceso.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                                        <ArrowRight className="text-gold-500" size={24} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contacto */}
            <div id="contacto" className="py-24 px-6">
                <div className="max-w-4xl mx-auto glass p-12 rounded-[3rem] border border-gold-500/20">
                    <div className="text-center mb-12">
                        <p className="text-gold-500 font-bold tracking-[0.3em] mb-4">¿LISTO PARA ASEGURAR SU LEGALIDAD?</p>
                        <h2 className="text-4xl font-black text-white mb-6">Únase a los miles de colombianos</h2>
                        <p className="text-military-400">que han confiado en nuestro sistema para sus trámites ante INDUMIL.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <button 
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 gold-gradient text-military-950 font-bold rounded-2xl hover:scale-105 transition-all"
                        >
                            REGISTRARME AHORA
                        </button>
                        <button 
                            onClick={() => window.open('https://wa.me/573115312653', '_blank')}
                            className="px-8 py-4 glass border border-gold-500/30 text-gold-500 font-bold rounded-2xl hover:bg-gold-500/10 transition-all"
                        >
                            ASESORÍA WHATSAPP
                        </button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-military-800 flex flex-col md:flex-row gap-8 justify-center text-military-400">
                        <div className="flex items-center gap-2">
                            <Phone size={18} className="text-gold-500" />
                            <span>+57 311 513 2653</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={18} className="text-gold-500" />
                            <span>contacto@dggestionarmas.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-gold-500" />
                            <span>Barrancabermeja - Santander</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 px-6 bg-military-900/50 border-t border-military-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/dgg_logo.png" alt="DGG Logo" className="w-10 h-10 rounded-lg object-contain" />
                            <div>
                                <h3 className="text-lg font-black text-white">DGG - GestorArmas Pro</h3>
                                <p className="text-[10px] text-military-500 uppercase tracking-widest font-bold">Gestión y Asesorías - ARMAS DE FUEGO DE DEFENSA PERSONAL</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 text-sm text-military-500">
                            <button onClick={() => setFooterModal('politica')} className="hover:text-gold-500 transition-colors">Política de Datos</button>
                            <button onClick={() => setFooterModal('terminos')} className="hover:text-gold-500 transition-colors">Términos del Servicio</button>
                            <button onClick={() => setFooterModal('habeas')} className="hover:text-gold-500 transition-colors">Habeas Data</button>
                            <button onClick={() => setFooterModal('contacto')} className="hover:text-gold-500 transition-colors">Contacto</button>
                        </div>

                        <p className="text-military-600 text-sm">© 2024 GestorArmas. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Footer Modals */}
            {footerModal && (
                <div className="fixed inset-0 z-[300] bg-military-950/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto glass rounded-[2rem] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-white">
                                {footerModal === 'politica' && 'Política de Protección de Datos'}
                                {footerModal === 'terminos' && 'Términos del Servicio'}
                                {footerModal === 'habeas' && 'Habeas Data'}
                                {footerModal === 'contacto' && 'Contacto'}
                            </h2>
                            <button onClick={() => setFooterModal(null)} className="p-2 hover:bg-military-800 rounded-xl">
                                <X className="text-military-400" size={24} />
                            </button>
                        </div>
                        <div className="text-military-300 text-sm space-y-4">
                            {footerModal === 'politica' && (
                                <>
                                    <p>En GestorArmas respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.</p>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">Recopilación de Datos</h4>
                                        <p>Recopilamos información necesaria para gestionar trámites ante la DCCAE y INDUMIL, incluyendo datos de identificación personal, documentación legal y registros de trámites.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">Uso de la Información</h4>
                                        <p>Sus datos son utilizados exclusivamente para la gestión de trámites legales ante autoridades competentes en Colombia.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">Protección</h4>
                                        <p>Implementamos medidas de seguridad robustas para proteger sus datos conforme a la Ley 1581 de 2012.</p>
                                    </div>
                                </>
                            )}
                            {footerModal === 'terminos' && (
                                <>
                                    <p>Al usar GestorArmas, usted acepta los siguientes términos y condiciones.</p>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">Uso del Servicio</h4>
                                        <p>Este sistema está destinado exclusivamente para la gestión de trámites legales de armas ante la DCCAE y autoridades competentes en Colombia.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">Responsabilidades del Usuario</h4>
                                        <p>El usuario es responsable de proporcionar información veraz y mantener la confidencialidad de sus credenciales de acceso.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">Limitaciones</h4>
                                        <p>Queda prohibido el uso del sistema para fines ilícitos o fraudulentos.</p>
                                    </div>
                                </>
                            )}
                            {footerModal === 'habeas' && (
                                <>
                                    <p>De acuerdo con la Ley 1581 de 2012, usted tiene derecho a:</p>
                                    <ul className="list-disc ml-5 space-y-2">
                                        <li>Conocer, actualizar y rectificar sus datos personales</li>
                                        <li>Solicitar prueba de la autorización otorgada</li>
                                        <li>Ser informado sobre el uso de sus datos</li>
                                        <li>Presentar quejas ante la Superintendencia de Industria y Comercio</li>
                                        <li>Revocar la autorización y/o solicitar eliminación de datos</li>
                                    </ul>
                                    <div className="mt-4 p-4 bg-gold-500/10 border border-gold-500/20 rounded-xl">
                                        <p className="text-gold-500 font-bold">Datos del Responsable:</p>
                                        <p className="text-xs mt-2">GestorArmas - contacto@dggestionarmas.com</p>
                                    </div>
                                </>
                            )}
                            {footerModal === 'contacto' && (
                                <>
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Shield size={40} className="text-military-950" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-4">GestorArmas</h3>
                                        <p className="text-military-400 mb-6">Estamos aquí para ayudarle con sus trámites de armas</p>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-center gap-3 text-military-300">
                                                <Phone size={20} className="text-gold-500" />
                                                <span>+57 311 513 2653</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-3 text-military-300">
                                                <Mail size={20} className="text-gold-500" />
                                                <span>contacto@dggestionarmas.com</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-3 text-military-300">
                                                <MapPin size={20} className="text-gold-500" />
                                                <span>Barrancabermeja - Santander</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => window.open('https://wa.me/573115312653', '_blank')}
                                            className="mt-8 px-8 py-4 gold-gradient text-military-950 font-bold rounded-2xl hover:scale-105 transition-all"
                                        >
                                            Contactar por WhatsApp
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Footer Credit */}
            <footer className="w-full py-8 glass border-t border-military-100/5 text-center mt-20 relative z-10">
                <p className="text-[10px] font-black tracking-[0.3em] text-military-600 uppercase mb-2">Plataforma Tecnológica GestorArmas</p>
                <p className="text-xs font-bold text-military-400">
                    Desarrollado por <span className="text-gold-500/80 hover:text-gold-500 cursor-pointer transition-colors">ProNext</span> | &copy; 2024 Diana Gómez García
                </p>
            </footer>

            {/* Floating WhatsApp Button */}
            <button 
                onClick={() => window.open('https://wa.me/573115312653', '_blank')}
                className="fixed bottom-8 right-8 z-[100] w-16 h-16 gold-gradient rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(213,161,21,0.5)] hover:scale-110 transition-transform animate-bounce-slow group"
            >
                <MessageCircle size={32} className="text-military-950" />
                <span className="absolute right-full mr-4 bg-gold-500 text-military-950 text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest shadow-xl pointer-events-none">
                    Chatear con un experto
                </span>
            </button>
        </div>
    );
};

export default LandingPage;
