import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, FileText, FolderOpen, Command } from 'lucide-react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const NinjaSearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Perform search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const data = await api.search.global(query);
                setResults(data.results || []);
                setActiveIndex(0);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (item) => {
        setIsOpen(false);
        setQuery('');
        setResults([]);
        if (item.type === 'CLIENTE') navigate(`/clientes/${item.id}`);
        if (item.type === 'TRAMITE') navigate(`/tramites/${item.id}`);
        if (item.type === 'DOCUMENTO') navigate(`/documentos`);
    };

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                const input = document.querySelector('input[placeholder*="Busca clientes"]');
                if (input) input.focus();
            }, 50); // Small delay for animation
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle keyboard navigation for results
    useEffect(() => {
        const handleKeys = (e) => {
            if (!isOpen) return;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter' && results[activeIndex]) {
                e.preventDefault();
                handleSelect(results[activeIndex]);
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [isOpen, results, activeIndex]);

    // Close on outside click
    const handleBackdropClick = (e) => {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[1000] flex items-start justify-center pt-20 px-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div 
                ref={searchRef}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Search Header */}
                <div className="flex items-center p-5 border-b border-slate-100 bg-slate-50/50">
                    <Search className="text-gold-600 mr-3.5" size={22} />
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Busca clientes, trámites o documentos... (Esc para cerrar)" 
                        className="bg-transparent border-none outline-none flex-1 text-slate-900 text-base placeholder-slate-400 font-semibold focus:ring-0"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-500 font-bold shadow-2xs">
                        <Command size={10} />
                        <span>K</span>
                    </div>
                </div>

                {/* Results Area */}
                <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-3">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="w-7 h-7 border-3 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Buscando...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1.5">
                           {results.map((item, idx) => (
                               <div 
                                    key={`${item.type}-${item.id}`}
                                    onClick={() => handleSelect(item)}
                                    className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all border ${activeIndex === idx ? 'bg-amber-50/80 border-amber-300 shadow-xs' : 'hover:bg-slate-50 border-transparent text-slate-600'}`}
                                    onMouseEnter={() => setActiveIndex(idx)}
                               >
                                   <div className={`p-2.5 rounded-xl mr-3.5 ${item.type === 'CLIENTE' ? 'bg-blue-50 text-blue-600 border border-blue-100' : item.type === 'TRAMITE' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                       {item.type === 'CLIENTE' && <User size={18} />}
                                       {item.type === 'TRAMITE' && <FileText size={18} />}
                                       {item.type === 'DOCUMENTO' && <FolderOpen size={18} />}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                       <p className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate">{item.title}</p>
                                       <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 ml-2">
                                       {item.category || item.type}
                                   </span>
                               </div>
                           ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="p-10 text-center opacity-60">
                             <Search size={40} className="mx-auto mb-3 text-slate-300" />
                             <p className="text-sm font-semibold text-slate-500">Sin resultados para "{query}"</p>
                        </div>
                    ) : (
                        <div className="p-10 text-center opacity-60">
                             <Command size={40} className="mx-auto mb-3 text-slate-300" />
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Escribe al menos 2 caracteres para buscar</p>
                        </div>
                    )}
                </div>

                {/* Footer hints */}
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-bold shadow-2xs">↑↓</span>
                            <span>Navegar</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-bold shadow-2xs">Enter</span>
                            <span>Seleccionar</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-gold-600 font-bold uppercase tracking-wider">Buscador Rápido</span>
                </div>
            </div>
        </div>
    );
};

export default NinjaSearch;
