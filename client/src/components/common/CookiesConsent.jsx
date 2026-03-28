import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const CookiesConsent = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookiesConsent');
        if (!consent) {
            setTimeout(() => setShowBanner(true), 1500);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem('cookiesConsent', JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString()
        }));
        setShowBanner(false);
        toast.success('Cookies aceptadas');
    };

    const acceptNecessary = () => {
        localStorage.setItem('cookiesConsent', JSON.stringify({
            necessary: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString()
        }));
        setShowBanner(false);
        toast.success('Cookies esenciales aceptadas');
    };

    if (showPolicy) {
        return <PoliticaPrivacidad onClose={() => setShowPolicy(false)} />;
    }

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="max-w-4xl mx-auto glass border border-gold-500/20 rounded-[2rem] p-6 shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gold-500/10 rounded-2xl">
                        <Cookie className="text-gold-500" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-lg mb-2">🍪 Uso de Cookies - Ley 1581 de 2012</h3>
                        <p className="text-military-400 text-sm mb-4">
                            Este sistema utiliza cookies para mejorar tu experiencia. Los datos personales son tratados de acuerdo con la 
                            <button onClick={() => setShowPolicy(true)} className="text-gold-500 underline ml-1">Política de Privacidad</button> 
                            {' '}y la normatividad colombiana de protección de datos.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={acceptAll}
                                className="px-6 py-2 bg-gold-gradient text-military-950 font-bold rounded-xl hover:scale-105 transition-all"
                            >
                                Aceptar Todas
                            </button>
                            <button 
                                onClick={acceptNecessary}
                                className="px-6 py-2 bg-military-800 text-military-300 font-bold rounded-xl border border-military-700 hover:border-gold-500/50 transition-all"
                            >
                                Solo Esenciales
                            </button>
                            <button 
                                onClick={() => setShowPolicy(true)}
                                className="px-6 py-2 text-gold-500 font-bold text-sm hover:underline"
                            >
                                Leer Política Completa
                            </button>
                        </div>
                    </div>
                    <button onClick={() => setShowBanner(false)} className="text-military-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const PoliticaPrivacidad = ({ onClose }) => (
    <div className="fixed inset-0 z-[300] bg-military-950/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto glass rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Shield className="text-gold-500" size={28} />
                    <h2 className="text-2xl font-black text-white">Política de Privacidad</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-military-800 rounded-xl">
                    <X className="text-military-400" size={24} />
                </button>
            </div>
            
            <div className="space-y-6 text-military-300 text-sm">
                <div>
                    <h4 className="font-bold text-white mb-2">1. RESPONSABLE DEL TRATAMIENTO</h4>
                    <p>GestorArmas Pro, representado por Diana Gómez García, con domicilio en Colombia, es el responsable del tratamiento de tus datos personales.</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-white mb-2">2. FINALIDAD DEL TRATAMIENTO</h4>
                    <p>Los datos recopilados se utilizarán exclusivamente para:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Gestión de trámites ante DCCAE y autoridades competentes</li>
                        <li>Gestión de clientes y prospectos comerciales</li>
                        <li>Agenda de citas y turnos</li>
                        <li>Comunicación relacionada con servicios solicitados</li>
                        <li>Cumplimiento de obligaciones legales</li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-bold text-white mb-2">3. DERECHOS DEL TITULAR (ARTÍCULO 8 - LEY 1581/2012)</h4>
                    <p>Tienes derecho a:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti</li>
                        <li><strong>Rectificación:</strong> Solicitar corrección de datos erróneos</li>
                        <li><strong>Cancelación:</strong> Solicitar eliminación de tus datos</li>
                        <li><strong>Oposición:</strong> Opponerte al tratamiento</li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-bold text-white mb-2">4. COOKIES</h4>
                    <p>Utilizamos cookies técnicas esenciales y cookies analíticas opcionales. Puedes gestionar tu consentimiento en cualquier momento.</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-white mb-2">5. SEGURIDAD</h4>
                    <p>Implementamos medidas técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, pérdida o destrucción.</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-white mb-2">6. CONTACTO</h4>
                    <p>Para ejercer tus derechos, contactanos en: <span className="text-gold-500">diana@dggestionarmas.com</span></p>
                </div>
                
                <div className="pt-4 border-t border-military-800">
                    <p className="text-xs text-military-500">Última actualización: {new Date().toLocaleDateString('es-CO')}</p>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end">
                <button onClick={onClose} className="px-8 py-3 bg-gold-gradient text-military-950 font-bold rounded-xl">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
);

export default CookiesConsent;
