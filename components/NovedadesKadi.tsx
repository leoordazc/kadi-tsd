"use client";

import { motion } from "framer-motion";

interface Novedad {
  id: string;
  fecha: string;
  titulo: string;
  contenido: string;
  emoji: string;
  tipo: 'patrio' | 'promo' | 'update';
}

export default function NovedadesKadi() {
  const novedades: Novedad[] = [
    {
      id: "1",
      fecha: "15 de Septiembre, 2026",
      titulo: "¡VIVA MÉXICO!",
      contenido: "En KADI TS&D celebramos con orgullo el Día de la Independencia. Gracias a todos los talleres, mecánicos y familias mexicanas que nos permiten seguir moviendo a nuestro país. ¡Que viva México!",
      emoji: "🇲🇽",
      tipo: "patrio",
    },
    {
      id: "2",
      fecha: "10 de Septiembre, 2026",
      titulo: "Nuevos productos en catálogo",
      contenido: "Recién subimos nuevas transmisiones estándar y diferenciales verificadas. Pasa a ver las novedades y aprovecha precios de almacén.",
      emoji: "🔧",
      tipo: "update",
    },
    {
      id: "3",
      fecha: "1 de Septiembre, 2026",
      titulo: "NIA disponible 24/7",
      contenido: "Nuestra inteligencia artificial NIA ya está lista para diagnosticar tu transmisión en segundos. Pregúntale lo que necesites, sin costo.",
      emoji: "🤖",
      tipo: "update",
    },
  ];

  return (
    <section className="relative z-10 py-20 border-t border-white/5 overflow-hidden">
      {/* ===== FONDO CON DEGRADADO PATRIO ===== */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-red-900/20" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-white/30 to-red-600" />
      
      {/* Partículas decorativas sutiles */}
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* ===== TÍTULO DE LA SECCIÓN ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/10 rounded-full mb-4 bg-black/40 backdrop-blur-sm">
            <span className="text-xl">🇲🇽</span>
            <span className="text-white/60 text-xs tracking-[0.2em] uppercase">
              Septiembre Patrio
            </span>
            <span className="text-xl">🇲🇽</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-light text-white/90 mb-3">
            Novedades <span className="text-[#ef4444]">KADI</span>
          </h2>
          <p className="text-white/40 text-sm">
            Lo último de nuestro taller y comunidad
          </p>
          
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mt-6" />
        </motion.div>

        {/* ===== GRID DE NOVEDADES ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {novedades.map((novedad, index) => {
            // Identidad especial para la del día patrio
            const esPatrio = novedad.tipo === 'patrio';
            
            return (
              <motion.article
                key={novedad.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group relative rounded-2xl overflow-hidden transition-all ${
                  esPatrio
                    ? "lg:col-span-2 border-2 border-white/20 shadow-2xl shadow-green-500/10"
                    : "border border-white/5"
                }`}
              >
                {/* ===== FONDO DE LA TARJETA ===== */}
                {esPatrio ? (
                  <>
                    {/* Fondo degradado verde-blanco-rojo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-700/40 via-black/60 to-red-700/40" />
                    
                    {/* Franjas de bandera sutiles */}
                    <div className="absolute inset-0 opacity-[0.08]">
                      <div className="absolute inset-y-0 left-0 w-1/3 bg-green-500" />
                      <div className="absolute inset-y-0 left-1/3 w-1/3 bg-white" />
                      <div className="absolute inset-y-0 right-0 w-1/3 bg-red-500" />
                    </div>
                    
                    {/* Águila estilizada (decorativa) */}
                    <div className="absolute top-6 right-6 text-6xl opacity-10 select-none">🇲🇽</div>
                  </>
                ) : (
                  <div className={`absolute inset-0 ${
                    novedad.tipo === 'promo'
                      ? 'bg-gradient-to-br from-[#ef4444]/10 to-[#f97316]/10'
                      : 'bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]'
                  }`} />
                )}
                
                {/* ===== BRILLO AL HOVER ===== */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* ===== CONTENIDO ===== */}
                <div className={`relative z-10 p-8 ${esPatrio ? 'md:p-12' : ''}`}>
                  
                  {/* Emoji grande */}
                  <div className={`mb-6 ${esPatrio ? 'text-6xl md:text-7xl' : 'text-4xl'}`}>
                    {novedad.emoji}
                  </div>

                  {/* Fecha con punto pulsante */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      esPatrio ? 'bg-white' : 'bg-[#ef4444]'
                    }`} />
                    <span className={`text-xs tracking-wider uppercase ${
                      esPatrio ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {novedad.fecha}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className={`font-light mb-4 ${
                    esPatrio 
                      ? 'text-4xl md:text-5xl text-white' 
                      : 'text-xl text-white/90'
                  }`}>
                    {novedad.titulo}
                  </h3>

                  {/* Contenido */}
                  <p className={`leading-relaxed ${
                    esPatrio 
                      ? 'text-base md:text-lg text-white/80 max-w-2xl' 
                      : 'text-sm text-white/60'
                  }`}>
                    {novedad.contenido}
                  </p>

                  {/* Banderines decorativos (solo en la patria) */}
                  {esPatrio && (
                    <div className="mt-8 flex gap-3 items-center">
                      {["🎉", "🇲🇽", "🎊", "🇲🇽", "🎉"].map((item, i) => (
                        <motion.span
                          key={i}
                          animate={{ 
                            y: [0, -5, 0],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                          className="text-3xl"
                        >
                          {item}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Línea inferior decorativa en la tarjeta patria */}
                {esPatrio && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-white to-red-500" />
                )}
              </motion.article>
            );
          })}
        </div>

        {/* ===== FRASE PATRIA AL PIE ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-white/30 text-xs tracking-[0.3em] uppercase">
            🇲🇽 Hecho en México por mexicanos 🇲🇽
          </p>
        </motion.div>
      </div>
    </section>
  );
}