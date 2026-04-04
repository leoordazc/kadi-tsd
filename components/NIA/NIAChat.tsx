"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { usePathname } from "next/navigation"; // 👈 ELIMINA o comenta esta línea

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function NIAChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hola. Soy NIA.\nAsistente inteligente de transmisiones KADI.\n¿En qué puedo apoyarte?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  

  // ===== NO MOSTRAR NADA EN LA PÁGINA PRINCIPAL =====
  // La página principal ya tiene su propio chat integrado
  

  // Auto-scroll a los mensajes nuevos
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus en input cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const responseText = await res.text();
      
      if (!responseText) {
        throw new Error("Respuesta vacía");
      }

      const data = JSON.parse(responseText);
      let reply = data.reply || "No entendí bien. ¿Puedes repetirlo?";

      if (reply.includes("[[MOSTRAR_BOTON_COMPRA]]")) {
        setShowBuyButton(true);
        reply = reply.replace("[[MOSTRAR_BOTON_COMPRA]]", "");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, tuve un problema. ¿Puedes intentar de nuevo?",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Formatear hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Botón flotante de NIA */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative">
          {/* Círculo de pulso */}
          <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20"></div>
          
          {/* Botón principal */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-lg flex items-center justify-center group-hover:from-red-500 group-hover:to-red-700 transition-all">
            {isOpen ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <>
                <span className="text-white font-bold text-2xl">NIA</span>
                {/* Indicador de online */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              </>
            )}
          </div>
        </div>
      </motion.button>

      {/* Ventana de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden z-50 flex flex-col"
          >
            {/* Header del chat */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">NIA</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">Asesora Estratégica</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-white/80 text-xs">Online · Tiempo real</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === "assistant" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === "assistant"
                        ? "bg-neutral-800 text-white rounded-tl-none"
                        : "bg-red-600 text-white rounded-tr-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </p>
                    <p className={`text-[10px] mt-1 ${
                      msg.role === "assistant" ? "text-neutral-500" : "text-red-200"
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-neutral-800 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Botón de compra flotante */}
            <AnimatePresence>
              {showBuyButton && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700"
                >
                  <button className="w-full bg-white text-green-700 font-bold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Finalizar compra</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input de mensaje */}
            <div className="border-t border-neutral-800 p-4 bg-neutral-900">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    disabled={loading}
                    className="w-full bg-black border border-neutral-700 rounded-full px-4 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
                  />
                  {!loading && input.length > 0 && (
                    <button
                      onClick={sendMessage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Sugerencias rápidas */}
              {messages.length <= 2 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Precios", "Horario", "Garantía", "Envíos"].map((sug) => (
                    <button
                      key={sug}
                      onClick={() => setInput(sug)}
                      className="text-xs bg-neutral-800 hover:bg-neutral-700 text-gray-300 px-3 py-1 rounded-full transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}