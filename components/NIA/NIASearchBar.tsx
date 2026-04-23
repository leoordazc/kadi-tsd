"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    products?: any[];
}

interface NIASearchBarProps {
    onSearch?: (query: string) => void;
}

export default function NIASearchBar({ onSearch }: NIASearchBarProps) {
    const { addToCart } = useCart();
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [userId, setUserId] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // ============================================
    // GHOST TYPING (EFECTO MÁQUINA DE ESCRIBIR)
    // ============================================
    
    const phrases = [
        "Mi NP300 truena en tercera...",
        "¿Tienes transmisión para Hilux 2015?",
        "Chevrolet Spark 2012 no entra reversa",
        "¿Cuánto cuesta reparar mi transmisión?",
        "D21 zumba en quinta velocidad",
        "¿Tienen sucursal en CDMX o Edomex?"
    ];

    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100);

    useEffect(() => {
        if (isFocused || inputValue) {
            setCurrentText("");
            return;
        }

        const handleTyping = () => {
            const currentFullPhrase = phrases[currentPhraseIndex];
            
            if (!isDeleting) {
                setCurrentText(currentFullPhrase.substring(0, currentText.length + 1));
                setTypingSpeed(70);
                if (currentText === currentFullPhrase) {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                setCurrentText(currentFullPhrase.substring(0, currentText.length - 1));
                setTypingSpeed(30);
                if (currentText === "") {
                    setIsDeleting(false);
                    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                }
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentPhraseIndex, isFocused, inputValue]);

    // ============================================
    // FIN GHOST TYPING
    // ============================================

    useEffect(() => {
        let id = localStorage.getItem('nia_user_id');
        if (!id) {
            id = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('nia_user_id', id);
        }
        setUserId(id);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current && hasInteracted) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, hasInteracted]);

    const sendMessage = async () => {
        if (!inputValue.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setLoading(true);
        setHasInteracted(true);

        if (onSearch) onSearch(inputValue);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: inputValue,
                    userId: userId
                }),
            });

            const data = await res.json();
            
            // VERIFICAR SI ES RESPUESTA CON PRODUCTOS
            if (data.type === 'product_recommendations') {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.message,
                    products: data.products
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.reply || "Lo siento, no pude procesar tu consulta."
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Lo siento, tuve un problema técnico. Por favor intenta de nuevo.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="sticky top-[70px] z-30 bg-black/40 backdrop-blur-sm py-4">
            <div className="w-full max-w-3xl mx-auto px-4">
                {/* Barra de búsqueda/chat con GLOW AZUL */}
                <motion.div
                    animate={loading ? {
                        boxShadow: [
                            "0px 0px 0px rgba(15, 43, 92, 0)",
                            "0px 0px 25px rgba(30, 74, 140, 0.6)",
                            "0px 0px 0px rgba(15, 43, 92, 0)"
                        ],
                        borderColor: ["rgba(255,255,255,0.1)", "rgba(30, 74, 140, 0.8)", "rgba(255,255,255,0.1)"]
                    } : {
                        boxShadow: "0px 0px 0px rgba(15, 43, 92, 0)",
                        borderColor: isFocused ? "rgba(30, 74, 140, 0.5)" : "rgba(255,255,255,0.1)"
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: loading ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    className={`relative backdrop-blur-md rounded-2xl border transition-all duration-300 ${
                        isFocused ? 'bg-black/80' : 'bg-black/60'
                    }`}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center">
                            <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                                <svg 
                                    className={`w-4 h-4 transition-colors ${
                                        isFocused ? 'text-[#c49a2b]' : 'text-white/30'
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
                                onKeyPress={handleKeyPress}
                                placeholder={isFocused ? "Escribe tu pregunta a NIA..." : (currentText || "Pregúntale a NIA...")}
                                className="w-full bg-transparent text-white/80 text-sm py-3 pl-12 pr-14 focus:outline-none placeholder-white/30 rounded-2xl"
                                style={{ caretColor: "#c49a2b" }}
                            />
                            
                            {inputValue && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-[#0f2b5c] to-[#1e4a8c] hover:from-[#1a3d7a] hover:to-[#2a5ca8] transition-colors flex items-center justify-center disabled:opacity-50 shadow-lg shadow-[#0f2b5c]/30"
                                >
                                    {loading ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                    
                    {/* Luz animada inferior - AZUL */}
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
                            background: "linear-gradient(90deg, transparent, rgba(30, 74, 140, 0.5), transparent)"
                        }}
                    />
                </motion.div>

                {/* Mensaje de bienvenida debajo de la barra */}
                <div className="text-center mt-2">
                    <p className="text-[10px] text-white/30">
                        🔧 Diagnóstico gratis · ⚡ Respuesta en segundos · 📦 Envío a todo México
                    </p>
                </div>

                {/* Área de mensajes del chat */}
                <AnimatePresence>
                    {hasInteracted && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 overflow-hidden"
                        >
                            <div 
                                ref={chatContainerRef}
                                className="space-y-4 overflow-y-auto custom-scroll"
                                style={{ maxHeight: "450px", minHeight: "300px" }}
                            >
                                {messages.map((msg) => (
                                    <div key={msg.id}>
                                        {/* Burbuja de mensaje */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-3 rounded-2xl ${
                                                    msg.role === "user"
                                                        ? "bg-gradient-to-r from-[#0f2b5c] to-[#1a3d7a] text-white rounded-br-sm shadow-lg shadow-[#0f2b5c]/30"
                                                        : "bg-white/10 text-white/80 rounded-bl-sm border border-white/5"
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </motion.div>
                                        
                                        {/* Tarjetas de productos si existen */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {msg.products.map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border border-white/10 p-3 hover:border-[#1e4a8c]/50 transition-all"
                                                    >
                                                        {/* Imagen del producto */}
                                                        <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden bg-black/40">
                                                            {product.imagen_url ? (
                                                                <Image
                                                                    src={product.imagen_url}
                                                                    alt={product.nombre}
                                                                    fill
                                                                    className="object-contain"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-white/30">
                                                                    🔧
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <h4 className="text-white/90 font-medium text-sm">{product.nombre}</h4>
                                                        <p className="text-white/40 text-xs">Código: {product.codigo_caja}</p>
                                                        <p className="text-white/40 text-xs">Tipo: {product.tipo}</p>
                                                        <p className="text-[#ef4444] font-bold text-lg mt-2">${product.precio?.toLocaleString()}</p>
                                                        
                                                        <button
                                                            onClick={() => addToCart(product)}
                                                            className="mt-2 w-full bg-gradient-to-r from-[#0f2b5c] to-[#1e4a8c] hover:from-[#1a3d7a] hover:to-[#2a5ca8] text-white py-2 rounded-lg text-sm transition-all"
                                                        >
                                                            🛒 Agregar al carrito
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 p-3 rounded-2xl rounded-bl-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}