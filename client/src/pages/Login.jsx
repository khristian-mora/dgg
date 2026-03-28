import React, { useState } from 'react'
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'


const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            const success = await login(email, password);
            if (success) {
                // We need to get the user from localStorage or just wait for the state update
                // But since login() just finished, we can trust the return if we modified it
                // Or just read from the localStorage directly if we want to be safe in this tick
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser?.rol === 'CLIENTE') {
                    navigate('/portal');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            // toast for errors is already handled in AuthContext but we can catch extra here if needed
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background with the generated image */}
            <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.2]"
                style={{ backgroundImage: `url('/login_background_army_1773794198346.png')` }}
            />
            
            {/* Animated elements (Ambient Glow) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-military-500/10 blur-[120px] rounded-full" />

            {/* Login Card */}
            <div className="relative glass w-full max-w-md p-8 lg:p-12 rounded-3xl shadow-2xl border border-military-100/10 hover:border-gold-500/20 transition-all duration-700">
                
                {/* Volver button */}
                <button 
                    onClick={() => navigate('/')}
                    className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-black text-military-500 hover:text-gold-500 transition-all uppercase tracking-widest group"
                >
                    <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    <span>Volver</span>
                </button>

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <img src="/dgg_logo.png" alt="DGG Logo" className="w-24 h-24 mb-6 object-contain drop-shadow-[0_0_20px_rgba(213,161,21,0.4)]" />
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-400 to-gold-600 tracking-tight">
                        DGG - GestorArmas Pro
                    </h1>
                    <p className="text-military-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-black">Gestión y Asesorías - ARMAS DE FUEGO DE DEFENSA PERSONAL</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-military-400 group-focus-within:text-gold-400 transition-colors">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-military-950/50 border border-military-800 rounded-2xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-military-100 placeholder-military-600 outline-none transition-all"
                                placeholder="Usuario o Correo"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-military-400 group-focus-within:text-gold-400 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-12 pr-12 py-4 bg-military-950/50 border border-military-800 rounded-2xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-military-100 placeholder-military-600 outline-none transition-all"
                                placeholder="Contraseña de seguridad"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-military-400 hover:text-gold-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center space-x-2 text-sm text-military-400 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-military-700 bg-military-900 text-gold-600 focus:ring-gold-500/30" />
                            <span className="group-hover:text-military-200 transition-colors">Recordar sesión</span>
                        </label>
                        <button 
                            type="button"
                            onClick={() => toast.success('Se ha enviado un enlace de recuperación a su correo')}
                            className="text-sm text-gold-500 hover:text-gold-300 font-medium transition-colors"
                        >
                            ¿Olvidó su contraseña?
                        </button>
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
                                <span>INGRESAR AL SISTEMA</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-10 text-center space-y-2">
                    <p className="text-military-600 text-[10px] tracking-wider uppercase font-black">
                        Sistema Protegido | &copy; 2024 Diana Gómez García
                    </p>
                    <p className="text-[10px] font-bold text-military-500 tracking-widest mt-2 uppercase">
                        Desarrollado por <span className="text-gold-500/80 hover:text-gold-500 cursor-pointer transition-colors">ProNext</span>
                    </p>
                </div>
            </div>
            
            {/* Ambient Particles (Simplified) */}
            <div className="absolute top-1/4 right-[20%] w-1 h-1 bg-gold-400/40 rounded-full animate-pulse" />
            <div className="absolute bottom-1/3 left-[15%] w-2 h-2 bg-military-400/20 rounded-full animate-bounce" />
            <div className="absolute top-[80%] right-[10%] w-1.5 h-1.5 bg-gold-500/30 rounded-full animate-pulse blur-[1px]" />
        </div>
    )
}

export default Login
