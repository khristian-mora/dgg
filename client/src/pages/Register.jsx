import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Shield, 
    ArrowRight, 
    ChevronLeft, 
    CheckCircle2, 
    User, 
    Phone, 
    Mail, 
    FileText, 
    Clock,
    Lock,
    Globe
} from 'lucide-react';
import { api } from '../api/api';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        cedula: '',
        telefono: '',
        correoElectronico: '',
        nacionalidad: 'COLOMBIANA',
        prospectoInteres: 'Permiso para Porte',
        tipoCliente: 'PROSPECTO',
        estado: 'PROSPECTO'
    });

    const paises = [
        "COLOMBIANA", "AFGANA", "ALBANESA", "ALEMANA", "ANDORRANA", "ANGOLEÑA", "ANTIGUANA", "ARABE", "ARGELINA", "ARGENTINA", "ARMENIA", "AUSTRALIANA", "AUSTRIACA", "AZERBAIヤーNA", "BAHAMESA", "BAHREINI", "BANGLADESI", "BARBADENSE", "BELGA", "BELICEÑA", "BENINESA", "BIELORRUSA", "BIRMANA", "BOLIVIANA", "BOSNIA", "BOTSUANA", "BRASILEÑA", "BRUNEANA", "BULGARA", "BURKINABE", "BURUNDESA", "BUTANESA", "CABOVERDIANA", "CAMBOYANA", "CAMERUNESA", "CANADIENSE", "CATARI", "CHADIANA", "CHILENA", "CHINA", "CHIPRIOTA", "COMORENSE", "CONGOLEÑA", "COREANA", "COSTARRICENSE", "CROATA", "CUBANA", "DANESA", "DOMINICANA", "DOMINIQUENSE", "ECUATORIANA", "EGIPCIA", "EMIRATI", "ERITREA", "ESLOVACA", "ESLOVENA", "ESPAÑOLA", "ESTADOUNIDENSE", "ESTONIA", "ETIOPE", "FILIPINA", "FINLANDESA", "FIYIANA", "FRANCESA", "GABONESA", "GAMBIANA", "GEORGIANA", "GHANESA", "GRANADINA", "GRIEGA", "GUATEMALTECA", "GUINEANA", "GUYANESA", "HAITIANA", "HONDUREÑA", "HUNGARA", "INDIA", "INDONESIA", "IRAQUI", "IRANI", "IRLANDESA", "ISLANDESA", "ISRAELI", "ITALIANA", "JAMAIQUINA", "JAPONESA", "JORDANNA", "KAZAJA", "KENIATA", "KIRGUISA", "KIRIBATIANA", "KUWAITI", "LAOSIANA", "LESOTENSE", "LETONA", "LIBANESA", "LIBERIANA", "LIBIA", "LIECHTENSTEINIANA", "LITUANA", "LUXEMBURGUESA", "MACEDONIA", "MALGACHE", "MALASIA", "MALAWI", "MALDIVA", "MALIENSE", "MALTESA", "MARROQUI", "MAURICIANA", "MAURITANA", "MEXICANA", "MICRONESIA", "MOLDAVA", "MONAQUESCA", "MONGOLA", "MONTENEGRINA", "MOZAMBIQUEÑA", "NAMIBIA", "NAURUANA", "NECOPA", "NEERLANDESA", "NEOPALESA", "NICARAGÜENSE", "NIGERIANA", "NIGERINA", "NORCOREANA", "NORUEGA", "NEOZELANDESA", "OMANI", "PAKISTANI", "PALAUIANA", "PALESTINA", "PANAMEÑA", "PAPUENSE", "PARAGUAYA", "PERUANA", "POLACA", "PORTUGUESA", "RWANDESA", "RUMANA", "RUSA", "SALOMONENSE", "SALVADOREÑA", "SAMOANA", "SANMARINENSE", "SANTALUCIENSE", "SANTOTOMEÑA", "SAUDI", "SENEGALESA", "SERBIA", "SEYCHELLENSE", "SIERRALEONESA", "SINGAPURENSE", "SIRIA", "SOMALI", "SRILANKESA", "SUDAFRICANA", "SUDANESA", "SUECA", "SUIZA", "SURINAMESA", "TAYIKA", "TAILANDESA", "TANZANA", "TOGOLEÑA", "TONGANA", "TRINITARIA", "TUNECINA", "TURCA", "TURCOMANA", "TUVALUANA", "UCRANIANA", "UGANDESA", "URUGUAYA", "UZBEKA", "VANUATUENSE", "VENEZOLANA", "VIETNAMITA", "YEMENI", "YIBUTIANA", "ZAMBIANA", "ZIMBABUENSE"
    ];

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.clientes.enroll({
                ...formData,
                nombres: formData.nombre,
                apellidos: formData.apellidos,
            });
            setStep(3);
            toast.success('¡Registro Exitoso!');
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Ocurrió un error al registrar los datos. Por favor intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-military-950 font-outfit text-military-100 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-gold-500/30">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-military-500/5 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

            {/* Header / Logo */}
            <Link to="/" className="mb-12 flex items-center gap-4 group animate-in slide-in-from-top-4 duration-700">
                <img src="/dgg_logo.jpg" alt="DGG Logo" className="w-16 h-16 rounded-2xl object-contain shadow-[0_0_20px_rgba(213,161,21,0.3)] group-hover:scale-110 transition-transform" />
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight leading-none uppercase">DGG</h1>
                    <span className="block text-[8px] text-gold-500 font-bold uppercase tracking-widest leading-none mt-1">Gestión y Asesorías - ARMAS DE FUEGO DE DEFENSA PERSONAL</span>
                </div>
            </Link>

            {/* Registration Card */}
            <div className="w-full max-w-xl glass border border-gold-500/10 rounded-[3rem] p-4 md:p-10 shadow-2xl relative animate-in zoom-in duration-500">
                {/* Progress Bar */}
                <div className="flex items-center justify-between px-8 mb-10 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-military-800 -translate-y-1/2 -z-10"></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 1 ? 'bg-gold-gradient text-military-950 border-gold-400' : 'bg-military-950 text-military-500 border-military-800'}`}>1</div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 2 ? 'bg-gold-gradient text-military-950 border-gold-400' : 'bg-military-950 text-military-500 border-military-800'}`}>2</div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 3 ? 'bg-gold-gradient text-military-950 border-gold-400' : 'bg-military-950 text-military-500 border-military-800'}`}><CheckCircle2 size={18}/></div>
                </div>

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-3xl font-black text-white mb-2">Información Básica</h2>
                        <p className="text-military-500 text-sm mb-8 font-bold uppercase tracking-widest">Paso 1 de 2: Datos de Identificación</p>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-military-400 tracking-widest ml-2 flex items-center gap-2 underline decoration-gold-500/50">
                                        <User size={12}/> Nombres
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="Ej: Juan Andrés"
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 transition-all font-bold placeholder:text-military-700"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-military-400 tracking-widest ml-2 flex items-center gap-2 underline decoration-gold-500/50">
                                        <User size={12}/> Apellidos
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="Ej: Pérez García"
                                        className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 transition-all font-bold placeholder:text-military-700"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-military-400 tracking-widest ml-2 flex items-center gap-2 underline decoration-gold-500/50">
                                    <FileText size={12}/> Documento de Identidad (Cédula)
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Sin puntos ni comas"
                                    className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 transition-all font-bold placeholder:text-military-700"
                                    value={formData.cedula}
                                    onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <button 
                                    onClick={() => navigate('/')}
                                    className="flex items-center justify-center gap-2 py-5 text-military-400 font-bold hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={18}/> Cancelar
                                </button>
                                <button 
                                    disabled={!formData.nombre || !formData.cedula}
                                    onClick={handleNext}
                                    className="flex items-center justify-center gap-2 py-5 bg-gold-gradient text-military-950 font-black rounded-2xl shadow-xl shadow-gold-500/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    SIGUIENTE <ArrowRight size={18}/>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-3xl font-black text-white mb-2">Contacto e Interés</h2>
                        <p className="text-military-500 text-sm mb-8 font-bold uppercase tracking-widest">Paso 2 de 2: Canal de Comunicación</p>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-military-400 tracking-widest ml-2 flex items-center gap-2 underline decoration-gold-500/50">
                                    <Phone size={12}/> Teléfono Celular
                                </label>
                                <input 
                                    type="tel"
                                    placeholder="+57 3..."
                                    className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 transition-all font-bold placeholder:text-military-700"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-military-400 tracking-widest ml-2 flex items-center gap-2 underline decoration-gold-500/50">
                                    <Mail size={12}/> Usuario o Correo
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Usuario o Correo"
                                    className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 transition-all font-bold placeholder:text-military-700"
                                    value={formData.correoElectronico}
                                    onChange={(e) => setFormData({...formData, correoElectronico: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-military-400 tracking-widest ml-2 flex items-center gap-2 underline decoration-gold-500/50">
                                    <Globe size={12}/> Nacionalidad del Ciudadano
                                </label>
                                <select 
                                    className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 transition-all font-bold appearance-none cursor-pointer"
                                    value={formData.nacionalidad}
                                    onChange={(e) => setFormData({...formData, nacionalidad: e.target.value})}
                                >
                                    {paises.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-military-400 tracking-widest ml-2 flex items-center gap-2 underline decoration-gold-500/50">
                                    <Lock size={12}/> Trámite de Interés
                                </label>
                                <select 
                                    className="w-full p-4 bg-military-950 border border-military-800 rounded-2xl text-white outline-none focus:border-gold-500/50 transition-all font-bold appearance-none cursor-pointer"
                                    value={formData.prospectoInteres}
                                    onChange={(e) => setFormData({...formData, prospectoInteres: e.target.value})}
                                >
                                    <option value="Permiso para Porte">Permiso para Porte Nacional</option>
                                    <option value="Permiso para Tenencia">Permiso para Tenencia</option>
                                    <option value="Revalidación">Revalidación de Permiso</option>
                                    <option value="Cesión de Arma">Cesión de Propiedad</option>
                                    <option value="Compra Munición">Compra de Munición/Accesorios</option>
                                </select>
                            </div>

                            <div className="p-4 bg-gold-500/5 border border-gold-500/10 rounded-2xl flex items-start gap-4">
                                <CheckCircle2 className="text-gold-500 shrink-0 mt-1" size={16} />
                                <p className="text-[10px] text-military-400 font-bold leading-relaxed">
                                    Al continuar, acepto el tratamiento de mis datos personales de acuerdo a la Ley 1581 de 2012 para fines de asesoría legal en trámites militares.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <button 
                                    onClick={handleBack}
                                    className="flex items-center justify-center gap-2 py-5 text-military-400 font-bold hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={18}/> Atrás
                                </button>
                                <button 
                                    disabled={loading || !formData.telefono || !formData.correoElectronico}
                                    onClick={handleSubmit}
                                    className="flex items-center justify-center gap-2 py-5 bg-gold-gradient text-military-950 font-black rounded-2xl shadow-xl shadow-gold-500/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'REGISTRANDO...' : 'REGISTRARME'} <CheckCircle2 size={18}/>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-10 animate-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(213,161,21,0.2)]">
                            <CheckCircle2 className="text-gold-500" size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 italic tracking-tight">¡Misión Cumplida!</h2>
                        <p className="text-military-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                            Hemos recibido su solicitud. Un agente especializado revisará su perfil y se contactará con usted en menos de 12 horas.
                        </p>
                        
                        <div className="p-6 bg-military-900 border border-military-800 rounded-[2.5rem] mb-10">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-military-800 rounded-2xl">
                                    <Clock className="text-gold-500" size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-military-500 uppercase tracking-widest">Próximo Paso</span>
                                    <p className="text-sm font-bold text-white tracking-widest uppercase">Estudio Jurídico Inicial</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/')}
                            className="w-full py-5 bg-military-800 border border-military-700 text-white font-black rounded-2xl hover:bg-military-700 transition-all uppercase tracking-widest"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                )}
            </div>

            {/* Support Footer */}
            <div className="mt-12 flex flex-col items-center gap-4 opacity-70">
                <p className="text-[10px] font-black text-military-500 uppercase tracking-[0.3em]">Reserva y Seguridad Garantizada بالدقة والسرية</p>
                <div className="flex items-center gap-8">
                     <div className="flex items-center gap-2 text-[9px] font-bold text-military-400 uppercase tracking-widest">
                        <Lock size={12} className="text-gold-500"/> SSL 256-Bit
                     </div>
                     <div className="flex items-center gap-2 text-[9px] font-bold text-military-400 uppercase tracking-widest">
                        <img src="/dgg_logo.jpg" alt="Mini Logo" className="w-4 h-4 object-contain opacity-50" />
                        <span className="text-gold-500">Ley 1581</span>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
