import React, { useState } from 'react';
import { Shield, X, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const TerminosCondiciones = ({ onClose, onAccept }) => {
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="fixed inset-0 z-[300] bg-military-950/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto glass rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Shield className="text-gold-500" size={28} />
                        <h2 className="text-2xl font-black text-white">Términos y Condiciones</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-military-800 rounded-xl">
                        <X className="text-military-400" size={24} />
                    </button>
                </div>
                
                <div className="space-y-6 text-military-300 text-sm">
                    <div className="p-4 bg-gold-500/10 border border-gold-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 text-gold-500 mb-2">
                            <AlertTriangle size={18} />
                            <span className="font-bold">Uso exclusivo legal</span>
                        </div>
                        <p className="text-xs">Este sistema está diseñado exclusivamente para la gestión de trámites legales ante la DCCAE y autoridades competentes en Colombia. El uso para fines ilícitos está prohibido y será reportado a las autoridades.</p>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-white mb-2">1. OBJETO</h4>
                        <p>GestorArmas Pro es una herramienta de gestión administrativa para trámites de armas de fuego ante la Dirección de Control y Fiscalización de Armas, Municiones y Explosivos (DCCAE) de la Policía Nacional de Colombia.</p>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-white mb-2">2. USOS AUTORIZADOS</h4>
                        <ul className="space-y-2 mt-2">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                                <span>Gestión de permisos de porte y tenencia de armas</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                                <span>Trámites de cesión y traspaso de armas</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                                <span>Gestión de documentación ante Indumil</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                                <span>Agenda de citas y seguimiento de trámites</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-white mb-2">3. PROHIBICIONES</h4>
                        <ul className="space-y-2 mt-2">
                            <li className="flex items-start gap-2">
                                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <span>Uso para trámites ilegales o fraudulentos</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <span>Fabricación o modificación de documentos oficiales</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <span>Compartición de credenciales de acceso</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-white mb-2">4. RESPONSABILIDADES</h4>
                        <p>El usuario es responsable de:</p>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>Mantener confidenciales sus credenciales</li>
                            <li>Usar el sistema únicamente para fines legales</li>
                            <li>Cumplir con la Ley 1581 de 2012 de protección de datos</li>
                            <li>Reportar cualquier actividad sospechosa</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-white mb-2">5. RESPONSABILIDAD LEGAL</h4>
                        <p>El uso indebido de este sistema puede constituir delito según el Código Penal Colombiano, incluyendo pero no limitándose a:</p>
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>Falsedad en documento público (Art. 286)</li>
                            <li>Usurpación de funciones públicas (Art. 141)</li>
                            <li>Tráfico de influencias (Art. 184)</li>
                        </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-military-800">
                        <p className="text-xs text-military-500">Última actualización: {new Date().toLocaleDateString('es-CO')}</p>
                    </div>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="w-5 h-5 rounded border-military-700 bg-military-900 text-gold-600 focus:ring-gold-500"
                        />
                        <span className="text-sm text-military-300">He leído y acepto los términos</span>
                    </label>
                    <button 
                        onClick={() => { if(accepted) { onAccept(); onClose(); }}}
                        disabled={!accepted}
                        className={`px-8 py-3 font-bold rounded-xl transition-all ${
                            accepted 
                            ? 'bg-gold-gradient text-military-950 hover:scale-105' 
                            : 'bg-military-800 text-military-600 cursor-not-allowed'
                        }`}
                    >
                        Aceptar y Continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TerminosCondiciones;
