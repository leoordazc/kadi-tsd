"use client";
import { useState, useEffect } from "react";

export default function PuntosLuz() {
  const [puntos, setPuntos] = useState<any[]>([]);

  useEffect(() => {
    // Math.random() SOLO se ejecuta en el cliente, después de montar
    const generados = [...Array(30)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
      opacity: 0.1 + Math.random() * 0.1,
    }));
    setPuntos(generados);
  }, []);

  if (puntos.length === 0) return null; // No renderiza nada en SSR

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {puntos.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}