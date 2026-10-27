"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureCarrusel from "@/components/FeatureCarrusel";

interface HeroKadiStyleProps {
  onConoceKadi: () => void;
}

// ===== COMPONENTE AISLADO PARA LAS PARTÍCULAS =====
function ParticulasHero() {
  const [particulas, setParticulas] = useState<Array<{
    left: number;
    top: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const generadas = [...Array(8)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 5,
    }));
    setParticulas(generadas);
  }, []);

  if (particulas.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particulas.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: "rgba(212, 175, 55, 0.4)",
            animation: `floatUp ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function HeroKadiStyle({ onConoceKadi }: HeroKadiStyleProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showFinanciamientoModal, setShowFinanciamientoModal] = useState(false); // NUEVO ESTADO

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-white pt-[140px] pb-20">
        
        {/* ===== IMAGEN DE FONDO ===== */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/transmision-hero-bg.jpg')",
          }}
        />

        {/* ===== OVERLAY OSCURO PARA QUE EL TEXTO SE LEA ===== */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(15, 18, 21, 0.85) 0%, rgba(15, 18, 21, 0.7) 50%, rgba(15, 18, 21, 0.95) 100%)",
          }}
        />

        {/* Glow dinámico (dorado + azul metálico) */}
        <motion.div
          animate={{
            x: mousePosition.x * 15,
            y: mousePosition.y * 15,
          }}
          transition={{ type: "spring", damping: 50, stiffness: 100 }}
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-60 pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(30, 74, 140, 0.10) 50%, transparent 70%)",
          }}
        />

        {/* Partículas aisladas */}
        <ParticulasHero />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col items-center text-center">
            
            {/* Badge superior */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--kadi-gold)" }} />
              <span className="text-xs font-medium text-white/80 tracking-wider uppercase">
                Impulsado por NIA
              </span>
            </motion.div>

            {/* ===== H1 PRINCIPAL (SEO) ===== */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
            >
              <span className="block text-white/90">Tu transmisión manual</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1e4a8c] via-[#2a5ca8] to-[#D4AF37]">
                en un solo lugar.
              </span>
            </motion.h1>

            {/* Subtítulo con keyword secundaria */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/60 max-w-2xl mb-8 font-light"
            >
              Compra y diagnóstico de <strong className="font-medium text-white/80">transmisiones manuales y diferenciales</strong> en{" "}
              <span className="font-medium" style={{ color: "var(--kadi-gold)" }}>segundos</span>.
            </motion.p>

            {/* BOTÓN DE FINANCIAMIENTO (Ahora abre el Modal) */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFinanciamientoModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-10 backdrop-blur-md cursor-pointer transition-colors group"
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.1)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
              }}
            >
              <span className="text-xl">💳</span>
              <span className="text-sm text-white/90 group-hover:text-white transition-colors">
                Financiamiento exclusivo para <strong>Mano de Obra</strong> en reparaciones
              </span>
              <span className="text-xs ml-1 opacity-50 group-hover:opacity-100 transition-opacity">➔</span>
            </motion.button>

            {/* Botón principal (mantiene rojo por ser CTA urgente) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mb-20"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConoceKadi}
                className="relative group px-8 py-4 bg-transparent border-2 border-[#ef4444] text-white font-medium rounded-2xl overflow-hidden transition-all hover:bg-[#ef4444]/10 hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]"
              >
                <span className="relative z-10 flex items-center gap-2 text-base">
                  📖 CONOCE KADI
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#ef4444]/30 to-[#D4AF37]/30"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.button>
            </motion.div>

            {/* ===== CARRUSEL DE FEATURES ===== */}
            <div className="w-full max-w-5xl mt-4">
              <FeatureCarrusel />
            </div>

          </div>
        </div>
      </section>

      {/* ===== MODAL DE FINANCIAMIENTO ===== */}
      <AnimatePresence>
        {showFinanciamientoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Fondo oscuro (Backdrop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(15, 18, 21, 0.85)" }}
              onClick={() => setShowFinanciamientoModal(false)}
            />

            {/* Contenido del Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
              style={{
                background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)",
              }}
            >
              {/* Encabezado del Modal */}
              <div className="p-6 border-b border-white/5 relative">
                <h3 className="text-2xl font-light text-white/90 flex items-center gap-3">
                  <span className="text-3xl">🔧</span> Financiamiento de Mano de Obra
                </h3>
                <p className="text-white/50 text-sm mt-2">
                  Facilidades de pago exclusivas para el costo de tu reparación (no aplica a refacciones).
                </p>
                <button
                  onClick={() => setShowFinanciamientoModal(false)}
                  className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Cuerpo del Modal */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                
                {/* Costos Fijos */}
                <div>
                  <h4 className="text-sm font-medium text-white/90 mb-3">Costos fijos de mano de obra:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg text-sm">
                      <span className="text-white/70">Transmisiones Manuales</span>
                      <span className="text-white font-medium">$1,500 <span className="text-[10px] text-white/40">+ IVA</span></span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg text-sm">
                      <span className="text-white/70">Transmisiones Automáticas</span>
                      <span className="text-white font-medium">$4,000 <span className="text-[10px] text-white/40">+ IVA</span></span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg text-sm">
                      <span className="text-white/70">Diferenciales y Transfer</span>
                      <span className="text-white font-medium">$1,300 <span className="text-[10px] text-white/40">+ IVA</span></span>
                    </div>
                  </div>
                </div>

                {/* Plan de Pagos */}
                <div>
                  <h4 className="text-sm font-medium text-white/90 mb-2">¿Cómo funciona el plan?</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Puedes diferir el costo de la mano de obra en <strong>hasta 4 parcialidades</strong>, eligiendo pagos de forma <strong>semanal o quincenal</strong>. 
                    Al agendar tu reparación, solo pagas la primera parcialidad para que el técnico comience a trabajar.
                  </p>
                </div>

                {/* Regla de la Garantía */}
                <div className="p-4 rounded-xl border" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                  <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Condición de Garantía
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    La póliza de garantía de la reparación está estrictamente condicionada al cumplimiento puntual de los pagos. 
                    Si existe un atraso mayor a <strong>48 horas</strong> en cualquiera de las parcialidades, la garantía del servicio quedará suspendida automáticamente.
                  </p>
                </div>

              </div>

              {/* Footer del Modal */}
              <div className="p-6 border-t border-white/5 bg-black/20">
                <button
                  onClick={() => {
                    setShowFinanciamientoModal(false);
                    // Opcional: aquí podrías redirigir al usuario al perfil o al WhatsApp
                  }}
                  className="w-full py-3 rounded-lg text-sm font-medium text-white transition hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "linear-gradient(90deg, var(--kadi-blue), var(--kadi-blue-bright))",
                    boxShadow: "0 8px 20px rgba(30, 74, 140, 0.3)",
                  }}
                >
                  Entendido, crear mi cuenta para agendar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}