import React, { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api/api'

const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isValidToken, setIsValidToken] = useState(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            setIsValidToken(false)
            toast.error('Token de recuperación inválido')
        } else {
            setIsValidToken(true)
        }
    }, [token])

    const getPasswordStrength = (pwd) => {
        let strength = 0
        if (pwd.length >= 8) strength++
        if (/[A-Z]/.test(pwd)) strength++
        if (/[a-z]/.test(pwd)) strength++
        if (/[0-9]/.test(pwd)) strength++
        if (/[^A-Za-z0-9]/.test(pwd)) strength++
        return strength
    }

    const passwordStrength = getPasswordStrength(password)

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }

        if (password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres')
            return
        }

        setIsLoading(true)
        
        try {
            await api.auth.resetPassword(token, password)
            setIsSuccess(true)
            toast.success('Contraseña actualizada correctamente')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al restablecer la contraseña')
        } finally {
            setIsLoading(false)
        }
    }

    if (isValidToken === false) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-military-950 relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center brightness-[0.2]"
                    style={{ backgroundImage: `url('/login_background_army_1773794198346.png')` }}
                />
                <div className="relative w-full max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <X size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-military-100 mb-4">Enlace Inválido</h1>
                    <p className="text-military-400 mb-8">El enlace de recuperación es inválido o ha expirado.</p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-gold-500 hover:text-gold-400 font-medium transition-colors"
                    >
                        ← Solicitar nuevo enlace
                    </button>
                </div>
            </div>
        )
    }

    if (isSuccess) {
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
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden bg-military-950">
                    <div 
                        className="absolute inset-0 lg:hidden bg-cover bg-center brightness-[0.2]"
                        style={{ backgroundImage: `url('/login_background_army_1773794198346.png')` }}
                    />
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full" />

                    <div className="relative w-full max-w-md text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <Check size={40} className="text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-military-100 mb-4">¡Contraseña Restablecida!</h1>
                        <p className="text-military-400 mb-8">Tu contraseña ha sido actualizada correctamente.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 gold-gradient hover:brightness-110 text-military-950 font-bold rounded-2xl shadow-[0_4px_20px_-2px_rgba(213,161,21,0.5)] transition-all"
                        >
                            INICIAR SESIÓN
                        </button>
                    </div>
                </div>
            </div>
        )
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
                            <Lock size={32} className="text-gold-400" />
                        </div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-400 to-gold-600 tracking-tight">
                            Nueva Contraseña
                        </h1>
                        <p className="text-military-400 text-sm mt-2">
                            Ingresa tu nueva contraseña
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-military-400 group-focus-within:text-gold-400 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-12 pr-12 py-4 bg-military-950/50 border border-military-800 rounded-2xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-military-100 placeholder-military-600 outline-none transition-all"
                                placeholder="Nueva contraseña"
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

                        {password && (
                            <div className="space-y-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-colors ${
                                                passwordStrength >= level
                                                    ? passwordStrength <= 2 ? 'bg-red-500' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                                                    : 'bg-military-800'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] text-military-500">
                                    Mínimo 8 caracteres. Usa mayúsculas, minúsculas, números y símbolos.
                                </p>
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-military-400 group-focus-within:text-gold-400 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-military-950/50 border border-military-800 rounded-2xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-military-100 placeholder-military-600 outline-none transition-all"
                                placeholder="Confirmar contraseña"
                                required
                            />
                        </div>

                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-red-500 text-xs">Las contraseñas no coinciden</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || password !== confirmPassword || password.length < 8}
                            className="w-full relative py-4 gold-gradient hover:brightness-110 active:scale-[0.98] text-military-950 font-bold rounded-2xl shadow-[0_4px_20px_-2px_rgba(213,161,21,0.5)] flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none group"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-military-950/30 border-t-military-950 rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>RESTABLECER CONTRASEÑA</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center space-y-2">
                        <p className="text-military-600 text-[10px] tracking-wider uppercase font-black">
                            Sistema Protegido | &copy; 2024 Diana Gómez García
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
