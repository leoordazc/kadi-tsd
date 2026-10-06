"use client";

import { motion } from "framer-motion";

export default function PaymentSection() {
  return (
    <section 
      className="relative z-10 py-20 border-t border-white/5 overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* TÍTULO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
            <span 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: "var(--kadi-gold)" }} 
            />
            <span className="text-xs font-medium text-white/70 tracking-wider uppercase">
              Pago seguro
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-white/90 mb-3">
            Compra con{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(90deg, #1e4a8c, #2a5ca8, #D4AF37)",
              }}
            >
              confianza
            </span>
          </h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            Protegemos cada transacción con la tecnología de Mercado Pago y asignamos un folio único a tu compra.
          </p>
          <div 
            className="w-16 h-px mx-auto mt-6"
            style={{
              background: "linear-gradient(to right, transparent, var(--kadi-gold), transparent)",
            }}
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* ===== LADO IZQUIERDO: EXPLICACIÓN ===== */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            {/* Bloque 1: Tecnología Mercado Pago */}
            <div className="flex gap-4">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(30, 74, 140, 0.2), rgba(42, 92, 168, 0.1))",
                  border: "1px solid rgba(42, 92, 168, 0.3)",
                }}
              >
                <svg className="w-6 h-6" style={{ color: "var(--kadi-blue-bright)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white/90 text-lg font-medium mb-1">
                  Pagos procesados por Mercado Pago
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  No almacenamos datos de tu tarjeta. Toda la información viaja encriptada y es procesada directamente por Mercado Pago, líder en pagos digitales en Latinoamérica.
                </p>
              </div>
            </div>

            {/* Bloque 2: Folio único */}
            <div className="flex gap-4">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(229, 193, 88, 0.1))",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                }}
              >
                <svg className="w-6 h-6" style={{ color: "var(--kadi-gold)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white/90 text-lg font-medium mb-1">
                  Folio único por cada compra
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Al confirmar tu pedido, generamos un folio personalizado (ej. <span className="font-mono" style={{ color: "var(--kadi-gold)" }}>KADI-00042</span>) que te acompaña durante todo el proceso: pago, envío y garantía.
                </p>
              </div>
            </div>

            {/* Bloque 3: Encriptación */}
            <div className="flex gap-4">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(30, 74, 140, 0.2), rgba(42, 92, 168, 0.1))",
                  border: "1px solid rgba(42, 92, 168, 0.3)",
                }}
              >
                <svg className="w-6 h-6" style={{ color: "var(--kadi-blue-bright)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white/90 text-lg font-medium mb-1">
                  Encriptación de nivel bancario
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Usamos protocolos SSL/TLS y certificación PCI DSS para que tu información esté siempre protegida.
                </p>
              </div>
            </div>

            {/* Badges resumen */}
            <div className="flex flex-wrap gap-3 pt-4">
              {[
                { label: "3D Secure", icon: "🔒" },
                { label: "PCI DSS", icon: "🛡️" },
                { label: "Mercado Pago", icon: "✓" },
                { label: "Encriptación AES-256", icon: "🔐" },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ===== LADO DERECHO: TARJETA ILUSTRATIVA ===== */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex items-center justify-center"
            style={{ perspective: "1200px" }}
          >
            {/* Glow detrás de la tarjeta */}
            <div
              className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-50 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(30, 74, 140, 0.2) 50%, transparent 70%)",
              }}
            />

            {/* Tarjeta con flotación */}
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotateY: [-6, 6, -6],
              }}
              transition={{
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-[340px] sm:w-[380px] aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Fondo de la tarjeta con gradiente KADI */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, #0f1215 0%, #1e4a8c 40%, #2a5ca8 60%, #D4AF37 100%)",
                }}
              />

              {/* Patrón decorativo metálico */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, transparent 0px, transparent 3px, rgba(255,255,255,0.08) 3px, rgba(255,255,255,0.08) 4px)",
                }}
              />

              {/* Brillo superior */}
              <div
                className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-40"
                style={{
                  background: "radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent 70%)",
                }}
              />

              {/* Contenido de la tarjeta */}
              <div className="relative h-full p-6 flex flex-col justify-between z-10">
                
                {/* Fila superior: chip + logo */}
                <div className="flex items-start justify-between">
                  {/* CHIP animado */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(212, 175, 55, 0.4)",
                        "0 0 40px rgba(212, 175, 55, 0.7)",
                        "0 0 20px rgba(212, 175, 55, 0.4)",
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-12 h-9 rounded-md overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #e5c158 0%, #D4AF37 50%, #a88923 100%)",
                    }}
                  >
                    {/* Líneas del chip */}
                    <div className="absolute inset-0 flex flex-col justify-around p-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-[1px]" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex justify-around">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-[1px]" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} />
                      ))}
                    </div>
                    {/* Centro del chip más claro */}
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-4 rounded-sm"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                    />
                  </motion.div>

                  {/* Marca (KADI) */}
                  <div className="text-right">
                    <div className="text-white/80 text-[10px] tracking-[0.2em] uppercase font-light">
                      KADI TS&D
                    </div>
                    <div className="text-white/40 text-[8px] tracking-wider">
                      TRANSMISIONES MANUALES
                    </div>
                  </div>
                </div>

                {/* Zona media: solo círculos decorativos, sin números */}
                <div className="flex items-center gap-3 my-4">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                    />
                  ))}
                  <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
                  <div className="text-white/50 text-xs tracking-wider font-mono">
                    •••• ••••
                  </div>
                </div>

                {/* Fila inferior: tipo de tarjeta + vigencia ficticia */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-white/40 text-[8px] tracking-widest uppercase mb-0.5">
                      Tarjeta
                    </div>
                    <div className="text-white/70 text-xs tracking-wider">
                      CRÉDITO · DÉBITO
                    </div>
                  </div>

                  {/* Círculos tipo Mastercard/Visa */}
                  <div className="flex -space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full opacity-80"
                      style={{ backgroundColor: "rgba(212, 175, 55, 0.8)" }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full opacity-60"
                      style={{ backgroundColor: "rgba(30, 74, 140, 0.8)" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sombra/reflejo debajo de la tarjeta */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-6 rounded-full blur-2xl"
              style={{
                background: "radial-gradient(ellipse, rgba(212, 175, 55, 0.3) 0%, transparent 70%)",
              }}
            />
          </motion.div>
        </div>

        {/* Badge final */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse" 
              style={{ backgroundColor: "var(--kadi-gold)" }} 
            />
            <span className="text-white/40 text-[10px] tracking-wider">
              PROCESAMIENTO SEGURO · 3D SECURE · MERCADO PAGO
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}