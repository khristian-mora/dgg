import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/api';

const COOKIE_OPTIONS = {
    secure: true,
    sameSite: 'Strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 7 // 7 días
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const sessionCookie = getCookie('session_token');
        
        if (storedUser && sessionCookie) {
            const userData = JSON.parse(storedUser);
            if (userData.token === sessionCookie) {
                setUser(userData);
            } else {
                logout();
            }
        } else if (storedUser || sessionCookie) {
            logout();
        }
        setLoading(false);
    }, []);

    const setCookie = (name, value, options = {}) => {
        if (typeof document === 'undefined') return;
        
        const cookieOptions = {
            ...COOKIE_OPTIONS,
            ...options,
            ...(isHttps ? { secure: true } : {})
        };
        
        const expires = cookieOptions.maxAge 
            ? `; max-age=${cookieOptions.maxAge}` 
            : '';
        
        const sameSite = `; samesite=${cookieOptions.sameSite}`;
        const secure = cookieOptions.secure ? '; secure' : '';
        
        document.cookie = `${name}=${value}${expires}${sameSite}${secure}; path=/`;
    };

    const getCookie = (name) => {
        if (typeof document === 'undefined') return null;
        
        const nameEQ = name + '=';
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
            let c = cookies[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    const deleteCookie = (name) => {
        if (typeof document === 'undefined') return;
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    const generateSecureToken = () => {
        const array = new Uint8Array(32);
        if (typeof window !== 'undefined' && window.crypto) {
            window.crypto.getRandomValues(array);
        } else {
            for (let i = 0; i < 32; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            // Llamada a la API real
            const response = await api.auth.login(email, password);
            const { token, user: userData } = response;
            
            // Combinar token en el objeto user para compatibilidad con AuthContext existente
            const fullUserData = {
                ...userData,
                token,
                loginTime: new Date().toISOString()
            };
            
            setUser(fullUserData);
            localStorage.setItem('user', JSON.stringify(fullUserData));
            setCookie('session_token', token);
            setCookie('user_rol', userData.rol);
            
            logAudit('LOGIN', 'Inicio de sesión real exitoso');
            toast.success(`Bienvenido(a) ${userData.nombre}`);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            logAudit('LOGIN_FAILED', `Intento fallido con email: ${email}. Error: ${error.message}`);
            toast.error(error.message || 'Credenciales inválidas');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        const userRole = user?.rol || getCookie('user_rol');
        logAudit('LOGOUT', 'Cierre de sesión');
        
        setUser(null);
        localStorage.removeItem('user');
        deleteCookie('session_token');
        deleteCookie('user_rol');
        
        toast.success('Sesión cerrada correctamente');
    };

    const logAudit = (action, details) => {
        const auditLog = JSON.parse(localStorage.getItem('audit_log') || '[]');
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            details,
            userId: user?.id || 'anonymous',
            ip: 'client-side',
            userAgent: navigator.userAgent
        };
        
        if (auditLog.length > 1000) {
            auditLog.shift();
        }
        auditLog.push(entry);
        
        try {
            localStorage.setItem('audit_log', JSON.stringify(auditLog));
        } catch (e) {
            console.warn('No se pudo guardar audit log:', e);
        }
    };

    const refreshSession = () => {
        if (user) {
            const newToken = generateSecureToken();
            const updatedUser = { ...user, token: newToken };
            
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCookie('session_token', newToken);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            loading, 
            isSuperAdmin: user?.rol === 'SUPER_ADMIN',
            isGestion: user?.rol === 'GESTION',
            isCliente: user?.rol === 'CLIENTE',
            refreshSession,
            isHttps
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
