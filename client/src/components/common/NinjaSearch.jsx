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
            className="fixed inset-0 z-[1000] flex items-start justify-center pt-24 px-4 bg-military-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div 
                ref={searchRef}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-2xl glass rounded-[2rem] border border-gold-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Search Header */}
                <div className="flex items-center p-6 border-b border-military-800">
                    <Search className="text-gold-500 mr-4" size={24} />
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Busca clientes, trámites o documentos... (Esc para cerrar)" 
                        className="bg-transparent border-none outline-none flex-1 text-white text-lg placeholder-military-600 font-bold"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-1 bg-military-900 px-2 py-1 rounded-lg border border-military-800 text-[10px] text-military-500 font-black">
                        <Command size={10} />
                        <span>K</span>
                    </div>
                </div>

                {/* Results Area */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-4">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs text-military-500 font-bold uppercase tracking-widest">Escaneando sistema...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                           {results.map((item, idx) => (
                               <div 
                                    key={`${item.type}-${item.id}`}
                                    onClick={() => handleSelect(item)}
                                    className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border ${activeIndex === idx ? 'bg-gold-500/10 border-gold-500/30' : 'hover:bg-military-900 border-transparent text-military-400'}`}
                                    onMouseEnter={() => setActiveIndex(idx)}
                               >
                                   <div className={`p-3 rounded-xl mr-4 ${item.type === 'CLIENTE' ? 'bg-blue-500/10 text-blue-500' : item.type === 'TRAMITE' ? 'bg-gold-500/10 text-gold-500' : 'bg-red-500/10 text-red-500'}`}>
                                       {item.type === 'CLIENTE' && <User size={20} />}
                                       {item.type === 'TRAMITE' && <FileText size={20} />}
                                       {item.type === 'DOCUMENTO' && <FolderOpen size={20} />}
                                   </div>
                                   <div className="flex-1">
                                       <p className="text-sm font-bold text-white uppercase tracking-tight">{item.title}</p>
                                       <p className="text-[10px] text-military-500">{item.subtitle}</p>
                                   </div>
                                   <span className="text-[10px] font-black text-military-600 uppercase bg-military-950 px-2 py-1 rounded-md">
                                       {item.category || item.type}
                                   </span>
                               </div>
                           ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="p-12 text-center opacity-40">
                             <Search size={48} className="mx-auto mb-4 text-military-600" />
                             <p className="text-sm font-bold text-military-500 uppercase">Sin resultados para "{query}"</p>
                        </div>
                    ) : (
                        <div className="p-12 text-center opacity-40">
                             <Command size={48} className="mx-auto mb-4 text-military-600" />
                             <p className="text-sm font-bold text-military-500 uppercase tracking-widest">Inicia tu búsqueda de élite</p>
                        </div>
                    )}
                </div>

                {/* Footer hints */}
                <div className="p-4 bg-military-950 border-t border-military-800 flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] text-military-500 font-bold">
                            <span className="bg-military-900 px-1.5 py-0.5 rounded border border-military-800 text-military-300">↑↓</span>
                            <span>NAVEGAR</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-military-500 font-bold">
                            <span className="bg-military-900 px-1.5 py-0.5 rounded border border-military-800 text-military-300">ENTER</span>
                            <span>SELECCIONAR</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-gold-500 font-black uppercase tracking-widest">GestorArmas Search v1.0</span>
                </div>
            </div>
        </div>
    );
};

export default NinjaSearch;
