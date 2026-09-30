"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Wrench, Truck } from "lucide-react";

// Tarjetas de características alineadas a KADI
const features = [
  {
    icon: ShieldCheck,
    title: "Garantía por escrito",
    desc: "12 meses respaldados en cada reparación.",
    color: "#4ade80",
  },
  {
    icon: Wrench,
    title: "Especialistas en estándar",
    desc: "Solo transmisiones manuales y diferenciales.",
    color: "#ef4444",
  },
  {
    icon: Truck,
    title: "Envío nacional",
    desc: "Entrega en 24-48 horas a todo México.",
    color: "#D4AF37",
  },
];

export default function HeroKadiStyle() {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black text-white pt-[140px]">
      {/* Fondo sutil de gradiente KADI */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col items-center text-center">
          
          {/* Badge superior estilo Google Labs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-xs font-medium text-white/80 tracking-wider uppercase">
              Impulsado por NIA
            </span>
          </motion.div>

          {/* Título Principal */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
          >
            <span className="block text-white/90">Ingeniería que</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] to-[#D4AF37]">
              Mueve tu Inversión.
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mb-10"
          >
            Piezas originales verificadas por técnicos especialistas. Transmisiones manuales y diferenciales con trazabilidad total.
          </motion.p>

          {/* Botones de Acción */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link
              href="#nia-search"
              className="px-8 py-3.5 rounded-xl bg-[#ef4444] text-white font-medium hover:bg-[#ef4444]/90 transition-all shadow-lg shadow-[#ef4444]/20"
            >
              Consultar con NIA
            </Link>
            <Link
              href="/catalogo"
              className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
            >
              Ver Catálogo
            </Link>
          </motion.div>

          {/* CARRUSEL HORIZONTAL ESTILO GOOGLE LABS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-5xl overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
            ref={scrollRef}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex gap-4 px-4 justify-center min-w-max">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="snap-center flex-shrink-0 w-64 flex flex-col items-center p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl text-center"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-base font-medium text-white/90 mb-1">{feature.title}</h3>
                  <p className="text-xs text-white/40">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}