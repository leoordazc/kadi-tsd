"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FeatureCarrusel from "@/components/FeatureCarrusel";

interface HeroKadiStyleProps {
  onConoceKadi: () => void;
}

interface Feature {
  id: string;
  imagen: string;
  title: string;
  desc: string;
  cta: string;
  color: string;
  badge: string;
  href?: string;
}

const features: Feature[] = [
  {
    id: "1",
    imagen: "/images/venta-unidades.jpg",
    title: "Venta de unidades",
    desc: "Transmisiones y diferenciales listos para instalar.",
    cta: "Ver catálogo",
    color: "#ef4444",
    badge: "Nuevas · Reconstruidas",
    href: "/catalogo",
  },
  {
    id: "2",
    imagen: "/images/reparacion-especializada.jpg",
    title: "Reparación especializada",
    desc: "Reconstrucción mayor con tolerancias OEM.",
    cta: "Cotizar reparación",
    color: "#4ade80",
    badge: "Reparación mayor",
  },
  {
    id: "3",
    imagen: "/images/mantenimiento-preventivo.jpg",
    title: "Mantenimiento preventivo",
    desc: "Cambio de aceite e inspección completa.",
    cta: "Agendar cita",
    color: "#60a5fa",
    badge: "Preventivo",
  },
];

// ============================================
// COMPONENTE DE TARJETA CON EFECTO 3D
// ============================================
function FeatureCard3D({ feature, onClick }: { feature: Feature; onClick?: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Motion values para rotación 3D
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`group relative bg-[#1a1a1a] rounded-[32px] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.5)] transition-all duration-500 ease-out overflow-hidden text-left ${
        feature.href ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* ===== IMAGEN SUPERIOR ===== */}
      <div className="relative h-44 sm:h-48 rounded-[24px] mb-4 overflow-hidden bg-black">
        <img
          src={feature.imagen}
          alt={feature.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
                  <span class="text-6xl opacity-30">🔧</span>
                </div>
              `;
            }
          }}
        />

        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Badge de tipo */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm border"
          style={{
            backgroundColor: `${feature.color}25`,
            color: feature.color,
            borderColor: `${feature.color}50`,
          }}
        >
          {feature.badge}
        </div>

        {/* Efecto de brillo al hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: isHovering ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle at 50% 0%, ${feature.color}30, transparent 70%)`,
          }}
        />
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="px-3 pb-2">
        <h3 className="text-lg font-semibold text-white/95 mb-2 leading-tight">
          {feature.title}
        </h3>
        <p className="text-sm text-white/50 leading-relaxed mb-4">
          {feature.desc}
        </p>

        {/* CTA con flecha */}
        <div
          className="flex items-center gap-1 text-sm font-medium transition-colors"
          style={{ color: feature.color }}
        >
          {feature.cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// HERO PRINCIPAL
// ============================================
export default function HeroKadiStyle({ onConoceKadi }: HeroKadiStyleProps) {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black text-white pt-[140px] pb-20">
      
      {/* Fondo con gradiente KADI */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0f0a0a] to-black" />

      {/* Glow dinámico */}
      <motion.div
        animate={{
          x: mousePosition.x * 15,
          y: mousePosition.y * 15,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
        className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-[#ef4444]/20 via-[#D4AF37]/10 to-transparent rounded-full blur-[120px] opacity-60 pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

     {/* Partículas sutiles (optimizadas: solo 8) */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  {[...Array(8)].map((_, i) => (
    <div
      key={i}
      className="absolute w-1 h-1 bg-[#ef4444]/40 rounded-full"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `floatUp ${8 + Math.random() * 6}s linear infinite`,
        animationDelay: `${Math.random() * 5}s`,
      }}
    />
  ))}
</div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col items-center text-center">
          
          {/* Badge superior */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-xs font-medium text-white/80 tracking-wider uppercase">
              Impulsado por NIA
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
          >
            <span className="block text-white/90">Tu transmisión manual</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#D4AF37]">
              en un solo lugar.
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 max-w-2xl mb-10 font-light"
          >
            Encuentra o diagnostica en <span className="text-[#4ade80] font-medium">segundos</span>.
          </motion.p>

          {/* Botón principal */}
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
  );
}