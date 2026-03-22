"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NIASearchBarProps {
    onSearch?: (query: string) => void;
}

export default function NIASearchBar({ onSearch }: NIASearchBarProps) {
    const [currentPhrase, setCurrentPhrase] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showLightBar, setShowLightBar] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const phrases = [
        "Hola, soy NIA, tu asistente",
        "Puedes preguntarme sobre cualquier producto ",
        "¿Sabías que el aceite incorrecto daña tu transmisión? ",
        "Tengo 15 años de experiencia en transmisiones",
        "Garantía 12 meses en todas mis recomendaciones"
    ];

    // Animación de bienvenida al cargar la página
    useEffect(() => {
        setIsZoomed(true);
        
        const zoomTimer = setTimeout(() => {
            setIsZoomed(false);
            
            setTimeout(() => {
                setShowLightBar(true);
                setTimeout(() => {
                    setShowLightBar(false);
                    setShowWelcome(false);
                }, 1500);
            }, 800);
        }, 3000);
        
        return () => clearTimeout(zoomTimer);
    }, []);

    // Detectar scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Frases solo cuando NO está enfocado y NO ha hecho scroll
    useEffect(() => {
        if (!isFocused && !isScrolled && !showWelcome) {
            const interval = setInterval(() => {
                setCurrentPhrase((prev) => (prev + 1) % phrases.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [isFocused, isScrolled, showWelcome]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch && inputValue.trim()) {
            onSearch(inputValue.trim());
            setInputValue("");
            setIsFocused(false);
            inputRef.current?.blur();
        }
    };

    return (
        <>
            {/* Overlay de desenfoque para todo el contenido (solo durante el zoom) */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
                        style={{ pointerEvents: "none" }}
                    />
                )}
            </AnimatePresence>

            {/* Barra de búsqueda con Z-INDEX más alto */}
            <div className={`sticky top-[70px] z-[200] flex justify-center py-4 pointer-events-none transition-all duration-500 ${
                isZoomed ? 'scale-110' : 'scale-100'
            }`}>
                <motion.div
                    ref={containerRef}
                    className="relative w-full max-w-2xl pointer-events-auto"
                    animate={{
                        width: isZoomed ? "90%" : (isFocused ? "100%" : "80%"),
                        maxWidth: isZoomed ? "800px" : (isFocused ? "100%" : "640px"),
                        scale: isZoomed ? 1.05 : 1,
                    }}
                    transition={{ 
                        duration: isZoomed ? 0.8 : 0.4, 
                        ease: "easeOut"
                    }}
                >
                    {/* Contenedor principal con efecto glassmorphism (neutro) */}
                    <motion.div 
                        className={`relative backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
                            isFocused 
                                ? 'bg-black/60 border-white/20 shadow-lg shadow-white/5' 
                                : 'bg-black/40 border-white/10 hover:border-white/15'
                        }`}
                        animate={{
                            boxShadow: showLightBar ? [
                                "0 0 0px rgba(255, 255, 255, 0)",
                                "0 0 20px rgba(255, 255, 255, 0.3)",
                                "0 0 40px rgba(255, 255, 255, 0.2)",
                                "0 0 20px rgba(255, 255, 255, 0.1)",
                                "0 0 0px rgba(255, 255, 255, 0)"
                            ] : "none"
                        }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        {/* Leyenda de bienvenida durante el zoom */}
                        <AnimatePresence>
                            {isZoomed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="absolute -top-20 left-0 right-0 text-center pointer-events-none z-20"
                                >
                                    <div className="inline-block bg-gradient-to-r from-neutral-800 to-neutral-900 text-white/90 px-8 py-4 rounded-2xl shadow-2xl border border-white/10">
                                        <p className="text-xl font-light tracking-wide"> Hola, soy <span className="text-white font-medium">NIA</span> </p>
                                        <p className="text-sm text-white/60 mt-1">Tu asesor en KADI</p>
                                        <p className="text-xs text-white/40 mt-2">Si necesitas algo, no dudes en consultarme</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Frase animada de NIA */}
                        {!isScrolled && !isFocused && !showWelcome && (
                            <div className="absolute -top-8 left-0 right-0 text-center pointer-events-none">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentPhrase}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 0.5, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.4 }}
                                        className="text-xs text-white/20 tracking-wide whitespace-nowrap overflow-x-auto scrollbar-hide"
                                    >
                                        {phrases[currentPhrase]}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Input de búsqueda */}
                        <form onSubmit={handleSubmit} className="relative">
                            <div className="flex items-center">
                                {/* Icono de búsqueda */}
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <svg 
                                        className={`w-4 h-4 transition-colors duration-300 ${
                                            isFocused ? 'text-white/60' : 'text-white/30'
                                        }`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder={isFocused ? "Escribe tu búsqueda..." : ""}
                                    className="w-full bg-transparent text-white/70 text-sm py-3 pl-10 pr-12 focus:outline-none placeholder-white/20"
                                    style={{ caretColor: "#ffffff" }}
                                />
                                
                                {/* Indicador de NIA */}
                                {!isFocused && !inputValue && !isScrolled && !showWelcome && (
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] text-white/20 tracking-wider">NIA</span>
                                            <div className="w-1 h-1 bg-white/30 rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Botón de enviar */}
                                {inputValue && (
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                                    >
                                        <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </form>
                        
                        {/* Línea inferior animada */}
                        <motion.div
                            className="absolute -bottom-px left-0 right-0 h-px"
                            animate={{
                                x: isFocused ? ["-100%", "100%"] : "0%",
                                opacity: isFocused ? [0, 0.4, 0] : 0
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: isFocused ? Infinity : 0,
                                ease: "easeInOut"
                            }}
                            style={{
                                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)"
                            }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}