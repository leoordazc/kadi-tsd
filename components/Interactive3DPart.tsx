"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface Interactive3DPartProps {
  src: string;
  alt?: string;
  maxRotation?: number;   // Grados máximos de rotación (default: 15)
  className?: string;     // Clases extra para el contenedor
}

export default function Interactive3DPart({
  src,
  alt = "Pieza mecánica 3D",
  maxRotation = 15,
  className = "",
}: Interactive3DPartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // ===== MOTION VALUES (posición normalizada del mouse -0.5 a 0.5) =====
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // ===== ROTACIÓN CON RESORTE =====
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [maxRotation, -maxRotation]),
    { stiffness: 300, damping: 30 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-maxRotation, maxRotation]),
    { stiffness: 300, damping: 30 }
  );

  // ===== PROFUNDIDAD Z (se eleva al hover) =====
  const translateZ = useSpring(isHovering ? 50 : 0, {
    stiffness: 300,
    damping: 30,
  });

  // ===== BRILLO DINÁMICO (glare que sigue al mouse) =====
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x} ${y}, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 60%)`
  );

  // ===== MANEJO DE EVENTOS =====
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => setIsHovering(true);

  const handleMouseLeave = () => {
    setIsHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center ${className}`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative"
        style={{
          rotateX,
          rotateY,
          translateZ,
          transformStyle: "preserve-3d",
        }}
      >
        {/* ===== IMAGEN ===== */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="relative w-full h-auto object-contain select-none"
          style={{
            filter: "contrast(1.1) brightness(1.05) drop-shadow(0 0 40px rgba(212, 175, 55, 0.25))",
            mixBlendMode: "screen",
          }}
        />

        {/* ===== BRILLO METÁLICO DINÁMICO (glare) ===== */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: glareBackground,
            mixBlendMode: "overlay",
            opacity: isHovering ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* ===== REFLEJO SUTIL INFERIOR (sombra 3D) ===== */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-6 rounded-full blur-2xl pointer-events-none"
          style={{
            width: "70%",
            background: "radial-gradient(ellipse, rgba(212, 175, 55, 0.25) 0%, transparent 70%)",
            opacity: isHovering ? 1 : 0.5,
            transition: "opacity 0.3s ease",
          }}
        />
      </motion.div>
    </div>
  );
}