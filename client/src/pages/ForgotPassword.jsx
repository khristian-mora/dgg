import React, { useState } from 'react'
import { Mail, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api/api'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            await api.auth.forgotPassword(email)
            setEmailSent(true)
            toast.success('Se ha enviado un enlace de recuperación a tu correo')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al enviar el correo de recuperación')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('/login_background_army_1773794198346.png')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-military-950 via-military-950/70 to-transparent" />
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
                    <img src="/dgg_logo.jpg" alt="DGG Logo" className="w-40 h-40 mb-8 object-contain drop-shadow-[0_0_30px_rgba(213,161,21,0.5)]" />
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-400 to-gold-600 tracking-tight text-center">
                        DGG
                    </h1>
                    <p className="text-gold-400 text-lg mt-4 uppercase tracking-[0.3em] font-bold">GestorArmas Pro</p>
                </div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-military-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden bg-military-950">
                <div 
                    className="absolute inset-0 lg:hidden bg-cover bg-center brightness-[0.2]"
                    style={{ backgroundImage: `url('/login_background_army_1773794198346.png')` }}
                />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-military-500/10 blur-[120px] rounded-full" />

                <div className="relative w-full max-w-md">
                    <button 
                        onClick={() => navigate('/login')}
                        className="absolute -top-16 left-0 flex items-center gap-2 text-sm font-bold text-military-400 hover:text-gold-500 transition-all uppercase tracking-widest group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Volver</span>
                    </button>

                    <div className="lg:hidden flex flex-col items-center mb-8 text-center">
                        <img src="/dgg_logo.jpg" alt="DGG Logo" className="w-20 h-20 mb-4 object-contain drop-shadow-[0_0_20px_rgba(213,161,21,0.4)]" />
                    </div>

                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mb-4">
                            <Mail size={32} className="text-gold-400" />
                        </div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-400 to-gold-600 tracking-tight">
                            Recuperar Contraseña
                        </h1>
                        <p className="text-military-400 text-sm mt-2">
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                        </p>
                    </div>

                    {!emailSent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-military-400 group-focus-within:text-gold-400 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-military-950/50 border border-military-800 rounded-2xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-military-100 placeholder-military-600 outline-none transition-all"
                                    placeholder="Correo electrónico"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative py-4 gold-gradient hover:brightness-110 active:scale-[0.98] text-military-950 font-bold rounded-2xl shadow-[0_4px_20px_-2px_rgba(213,161,21,0.5)] flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none group"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-military-950/30 border-t-military-950 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>ENVIAR ENLACE DE RECUPERACIÓN</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                                <Check size={40} className="text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-military-100 mb-2">Correo Enviado</h2>
                                <p className="text-military-400 text-sm">
                                    Hemos enviado un enlace de recuperación a <strong className="text-gold-400">{email}</strong>
                                </p>
                            </div>
                            <p className="text-military-500 text-xs">
                                Revisa tu bandeja de entrada y spam. El enlace vence en 1 hora.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-gold-500 hover:text-gold-400 font-medium transition-colors"
                            >
                                ← Volver al inicio de sesión
                            </button>
                        </div>
                    )}

                    <div className="mt-10 text-center space-y-2">
                        <p className="text-military-600 text-[10px] tracking-wider uppercase font-black">
                            Sistema Protegido | &copy; 2024 Diana Gómez García
                        </p>
                        <p className="text-[10px] font-bold text-military-500 tracking-widest mt-2 uppercase">
                            Desarrollado por <span className="text-gold-500/80 hover:text-gold-500 cursor-pointer transition-colors">ProNext</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
