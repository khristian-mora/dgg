import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-military-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(user.rol)) {
        return (
            <div className="min-h-screen bg-military-950 flex flex-col items-center justify-center text-center p-10">
                <ShieldAlert size={64} className="text-red-500 mb-6 animate-pulse" />
                <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter">Acceso Restringido</h1>
                <p className="text-military-400 max-w-sm">Tu rol ({user.rol}) no tiene permisos para acceder a esta sección.</p>
                <button 
                  onClick={() => window.location.href = user.rol === 'CLIENTE' ? '/portal' : '/dashboard'}
                  className="mt-8 px-6 py-2 bg-military-800 text-gold-400 rounded-full hover:bg-military-700 transition-all font-bold text-xs uppercase"
                >
                  Regresar a mi Dashboard
                </button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
