"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface NIASearchBarProps {
    onSearch?: (query: string) => void;
}

export default function NIASearchBar({ onSearch }: NIASearchBarProps) {
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [userId, setUserId] = useState<string>(""); // ✅ Movido DENTRO del componente
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Generar o recuperar ID de usuario para mantener memoria
    useEffect(() => {
        let id = localStorage.getItem('nia_user_id');
        if (!id) {
            id = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('nia_user_id', id);
        }
        setUserId(id);
    }, []);

    // Auto-scroll dentro del contenedor del chat
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
                    userId: userId  // ✅ Correcto: dentro del body
                }),
            });

            const data = await res.json();
            const reply = data.reply || "Lo siento, no pude procesar tu consulta.";

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: reply,
            };
            setMessages((prev) => [...prev, assistantMessage]);
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
                {/* Barra de búsqueda/chat */}
                <div className={`relative backdrop-blur-md rounded-2xl border transition-all duration-300 ${
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
                                onKeyPress={handleKeyPress}
                                placeholder={isFocused ? "Escribe tu pregunta a NIA..." : "Pregúntale a NIA sobre transmisiones..."}
                                className="w-full bg-transparent text-white/80 text-sm py-3 pl-12 pr-14 focus:outline-none placeholder-white/30 rounded-2xl"
                                style={{ caretColor: "#ef4444" }}
                            />
                            
                            {inputValue && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-[#ef4444] to-[#f97316] hover:from-[#ef4444]/90 hover:to-[#f97316]/90 transition-colors flex items-center justify-center disabled:opacity-50"
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

                {/* Área de mensajes del chat - SOLO visible después de interactuar */}
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
                                className="space-y-3 overflow-y-auto custom-scroll"
                                style={{ maxHeight: "400px", minHeight: "300px" }}
                            >
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-2xl ${
                                                msg.role === "user"
                                                    ? "bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white rounded-br-sm"
                                                    : "bg-white/10 text-white/80 rounded-bl-sm"
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </motion.div>
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