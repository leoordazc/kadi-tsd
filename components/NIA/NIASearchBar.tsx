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
        "Puedes preguntarme sobre cualquier producto 🔧",
        "¿Sabías que el aceite incorrecto daña tu transmisión? ⚠️",
        "Tengo 15 años de experiencia en transmisiones 🏆",
        "Garantía 12 meses en todas mis recomendaciones ✅"
    ];

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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        style={{ pointerEvents: "none" }}
                    />
                )}
            </AnimatePresence>

            <div className="sticky top-[70px] z-30 flex justify-center py-3 pointer-events-none">
                <motion.div
                    ref={containerRef}
                    className="relative w-full max-w-2xl pointer-events-auto"
                    animate={{
                        scale: isZoomed ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Leyenda de bienvenida - centrada y legible */}
                    <AnimatePresence>
                        {isZoomed && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="absolute -top-14 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap z-20"
                            >
                                <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-2 shadow-xl">
                                    <p className="text-white/90 text-sm font-medium tracking-wide">
                                        Hola, soy <span className="text-white">NIA</span>
                                    </p>
                                    <p className="text-white/50 text-[10px] -mt-0.5">tu asesor en KADI</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Frase animada */}
                    {!isScrolled && !isFocused && !showWelcome && (
                        <div className="absolute -top-7 left-0 right-0 text-center pointer-events-none">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentPhrase}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 0.6, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-[11px] text-white/30 tracking-wide whitespace-nowrap"
                                >
                                    {phrases[currentPhrase]}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Input de búsqueda */}
                    <div className={`relative backdrop-blur-md rounded-full border transition-all duration-300 ${
                        isFocused 
                            ? 'bg-black/80 border-white/30' 
                            : 'bg-black/60 border-white/15'
                    }`}>
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center">
                                <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                                    <svg 
                                        className={`w-4 h-4 transition-colors ${
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
                                    className="w-full bg-transparent text-white/80 text-sm py-3 pl-12 pr-14 focus:outline-none placeholder-white/30 rounded-full"
                                    style={{ caretColor: "#ef4444" }}
                                />
                                
                                {!isFocused && !inputValue && !isScrolled && !showWelcome && (
                                    <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-white/40 tracking-wider">NIA</span>
                                            <div className="w-1.5 h-1.5 bg-[#ef4444]/60 rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                )}
                                
                                {inputValue && (
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                                    >
                                        <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </form>
                        
                        {/* Luz animada inferior */}
                        <motion.div
                            className="absolute -bottom-px left-0 right-0 h-px"
                            animate={{
                                x: isFocused ? ["-100%", "100%"] : "0%",
                                opacity: isFocused ? [0, 0.5, 0] : 0
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: isFocused ? Infinity : 0,
                                ease: "easeInOut"
                            }}
                            style={{
                                background: "linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.5), transparent)"
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </>
    );
}