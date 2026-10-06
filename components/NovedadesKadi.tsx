"use client";

import { motion } from "framer-motion";

interface Novedad {
  id: string;
  fecha: string;
  titulo: string;
  contenido: string;
  emoji: string;
  tipo: 'destacada' | 'promo' | 'update';
  cta?: string;
  href?: string;
}

export default function NovedadesKadi() {
  const novedades: Novedad[] = [
    {
      id: "1",
      fecha: "Octubre 2026",
      titulo: "Nuevas cajas de transferencia en catálogo",
      contenido: "Recién ingresaron cajas de transferencia verificadas para vehículos 4x4. Disponibles para Audi Q3,Q5 , BMW X5, Jaguar, Hyundai y más. Cada unidad pasa por banco de pruebas antes de salir.",
      emoji: "",
      tipo: "destacada",
      cta: "Ver catálogo",
      href: "/catalogo",
    },
    {
      id: "2",
      fecha: "Octubre 2026",
      titulo: "Transmisiones estándar reconstruidas",
      contenido: "Lote nuevo de transmisiones manuales estándar reconstruidas con tolerancias OEM y garantía por escrito.",
      emoji: "",
      tipo: "update",
    },
    {
      id: "3",
      fecha: "Octubre 2026",
      titulo: "NIA actualizada 2.0",
      contenido: "Ahora NIA identifica síntomas de cajas de transferencia y te dice exactamente qué refacción pedir.",
      emoji: "",
      tipo: "update",
    },
  ];

  return (
    <section 
      className="relative z-10 py-20 border-t border-white/5 overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* ===== FONDO CON GRADIENTE KADI ===== */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 20% 30%, rgba(30, 74, 140, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.06) 0%, transparent 50%)",
        }}
      />
      
      {/* Línea superior con gradiente KADI */}
      <div 
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background: "linear-gradient(to right, transparent, var(--kadi-blue), var(--kadi-gold), transparent)",
        }}
      />

      {/* Glows decorativos */}
      <div 
        className="absolute top-20 left-1/4 w-64 h-64 rounded-full blur-3xl" 
        style={{ backgroundColor: "rgba(30, 74, 140, 0.1)" }}
      />
      <div 
        className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl" 
        style={{ backgroundColor: "rgba(212, 175, 55, 0.08)" }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* ===== TÍTULO DE LA SECCIÓN ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/10 rounded-full mb-4 bg-white/5 backdrop-blur-sm">
            <span 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: "var(--kadi-gold)" }} 
            />
            <span className="text-white/60 text-xs tracking-[0.2em] uppercase">
              Novedades del taller
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-light text-white/90 mb-3">
            Lo más nuevo en <span 
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(90deg, #1e4a8c, #2a5ca8, #D4AF37)",
              }}
            >
              KADI
            </span>
          </h2>
          <p className="text-white/40 text-sm">
            Productos recién ingresados y actualizaciones del sistema
          </p>
          
          <div 
            className="w-24 h-px mx-auto mt-6" 
            style={{
              background: "linear-gradient(to right, transparent, var(--kadi-gold), transparent)",
            }}
          />
        </motion.div>

        {/* ===== GRID DE NOVEDADES ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {novedades.map((novedad, index) => {
            const esDestacada = novedad.tipo === 'destacada';
            
            return (
              <motion.article
                key={novedad.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group relative rounded-2xl overflow-hidden transition-all ${
                  esDestacada
                    ? "lg:col-span-2 border-2 shadow-2xl"
                    : "border border-white/5"
                }`}
                style={esDestacada ? {
                  borderColor: "rgba(212, 175, 55, 0.3)",
                  boxShadow: "0 20px 40px rgba(30, 74, 140, 0.15)",
                } : {}}
              >
                {/* ===== FONDO DE LA TARJETA ===== */}
                {esDestacada ? (
                  <>
                    {/* Fondo con gradiente KADI */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(30, 74, 140, 0.25) 0%, rgba(15, 18, 21, 0.9) 50%, rgba(212, 175, 55, 0.15) 100%)",
                      }}
                    />
                    
                    {/* Patrón decorativo sutil */}
                    <div 
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: "repeating-linear-gradient(45deg, var(--kadi-gold) 0px, var(--kadi-gold) 1px, transparent 1px, transparent 30px)",
                      }}
                    />
                    
                    {/* Emoji decorativo grande */}
                    <div className="absolute top-6 right-6 text-7xl opacity-5 select-none">
                      {novedad.emoji}
                    </div>
                  </>
                ) : (
                  <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: "var(--bg-card)" }}
                  />
                )}
                
                {/* ===== BRILLO AL HOVER ===== */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* ===== CONTENIDO ===== */}
                <div className={`relative z-10 p-8 ${esDestacada ? 'md:p-12' : ''}`}>
                  
                  {/* Emoji grande */}
                  <div className={`mb-6 ${esDestacada ? 'text-6xl md:text-7xl' : 'text-4xl'}`}>
                    {novedad.emoji}
                  </div>

                  {/* Fecha con punto pulsante */}
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className="w-1.5 h-1.5 rounded-full animate-pulse" 
                      style={{ backgroundColor: "var(--kadi-gold)" }}
                    />
                    <span className={`text-xs tracking-wider uppercase ${
                      esDestacada ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {novedad.fecha}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className={`font-light mb-4 ${
                    esDestacada 
                      ? 'text-4xl md:text-5xl text-white' 
                      : 'text-xl text-white/90'
                  }`}>
                    {novedad.titulo}
                  </h3>

                  {/* Contenido */}
                  <p className={`leading-relaxed ${
                    esDestacada 
                      ? 'text-base md:text-lg text-white/80 max-w-2xl' 
                      : 'text-sm text-white/60'
                  }`}>
                    {novedad.contenido}
                  </p>

                  {/* CTA en tarjeta destacada */}
                  {esDestacada && novedad.cta && novedad.href && (
                    <motion.a
                      href={novedad.href}
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center gap-2 mt-8 text-sm font-medium transition-colors"
                      style={{ color: "var(--kadi-gold)" }}
                    >
                      {novedad.cta}
                      <span>→</span>
                    </motion.a>
                  )}
                </div>

                {/* Línea inferior decorativa en la tarjeta destacada */}
                {esDestacada && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{
                      background: "linear-gradient(to right, var(--kadi-blue), var(--kadi-gold))",
                    }}
                  />
                )}
              </motion.article>
            );
          })}
        </div>

        {/* ===== FRASE AL PIE ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-white/30 text-xs tracking-[0.3em] uppercase">
            Inventario actualizado semanalmente
          </p>
        </motion.div>
      </div>
    </section>
  );
}