"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useRef } from "react";

export default function PaymentSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Valores para el efecto 3D con movimiento del mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !isHovering) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const paymentMethods = [
    {
      id: "visa",
      name: "Visa",
      icon: "💳",
      gradient: "from-blue-900/30 to-blue-600/20",
      color: "#1a1f71",
    },
    {
      id: "mastercard",
      name: "Mastercard",
      icon: "💳",
      gradient: "from-red-900/30 to-orange-600/20",
      color: "#eb001b",
    },
    {
      id: "amex",
      name: "American Express",
      icon: "💳",
      gradient: "from-blue-800/30 to-cyan-600/20",
      color: "#2e77bb",
    },
    {
      id: "oxxo",
      name: "OXXO",
      icon: "🏪",
      gradient: "from-purple-900/30 to-purple-600/20",
      color: "#662483",
    },
    {
      id: "transferencia",
      name: "Transferencia",
      icon: "🏦",
      gradient: "from-green-900/30 to-green-600/20",
      color: "#4ade80",
    },
  ];

  const financingPlans = [
    {
      meses: 3,
      interes: "Sin intereses",
      icon: "✨",
      destacado: false,
      color: "from-blue-500/10 to-transparent",
    },
    {
      meses: 6,
      interes: "Sin intereses",
      icon: "✨",
      destacado: false,
      color: "from-blue-500/10 to-transparent",
    },
    {
      meses: 12,
      interes: "Sin intereses",
      icon: "⭐",
      destacado: true,
      color: "from-[#4ade80]/20 to-transparent",
    },
    {
      meses: 18,
      interes: "7% de interés",
      icon: "📊",
      destacado: false,
      color: "from-orange-500/10 to-transparent",
    },
  ];

  return (
    <section className="relative z-10 py-24 border-t border-white/5 bg-gradient-to-b from-black via-black/95 to-black">
      {/* Fondo tecnológico */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4ade80]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#60a5fa]/5 rounded-full blur-3xl" />
        
        {/* Líneas de circuito */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M10 10 L90 10 M90 10 L90 90 M90 90 L10 90 M10 90 L10 10" stroke="#4ade80" strokeWidth="0.5" fill="none" />
            <circle cx="10" cy="10" r="2" fill="#4ade80" />
            <circle cx="90" cy="90" r="2" fill="#60a5fa" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-8 relative z-10">
        
        {/* Encabezado de sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-light text-white/90 mb-3">
            Infraestructura <span className="text-[#4ade80]">financiera</span>
          </h2>
          <p className="text-white/40 text-sm tracking-widest">
            PROCESAMIENTO SEGURO · TECNOLOGÍA BANCARIA
          </p>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#4ade80] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Grid de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQUIERDA: Tarjeta 3D interactiva */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="text-sm text-white/30 mb-4 tracking-widest flex items-center space-x-2">
              <span className="w-1 h-1 bg-[#4ade80] rounded-full" />
              <span>PROCESADOR SEGURO</span>
            </div>
            
            {/* Contenedor de la tarjeta con efecto 3D */}
            <div
              ref={cardRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => {
                setIsHovering(false);
                mouseX.set(0);
                mouseY.set(0);
              }}
              onMouseMove={handleMouseMove}
              className="relative w-full aspect-[1.6/1] perspective-1000"
            >
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-full"
              >
                {/* Tarjeta principal */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-6 shadow-2xl border border-white/10 backdrop-blur-sm">
                  
                  {/* Brillo metálico */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  
                  {/* Patrón de líneas (tecnológico) */}
                  <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M20 0 L0 0 0 20" stroke="white" strokeWidth="0.5" fill="none" />
                    </pattern>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Chip de la tarjeta (más realista) */}
                  <div className="absolute top-6 left-6">
                    <div className="w-12 h-9 bg-gradient-to-br from-yellow-400/40 to-yellow-600/40 rounded-md border border-yellow-500/30 flex items-center justify-center">
                      <div className="w-8 h-5 bg-gradient-to-br from-yellow-300/30 to-yellow-500/30 rounded-sm" />
                    </div>
                  </div>
                  
                  {/* Número de tarjeta con efecto de relieve */}
                  <div className="absolute top-20 left-6 right-6">
                    <div className="text-white/40 text-xs mb-2 tracking-widest">NÚMERO DE TARJETA</div>
                    <div className="font-mono text-xl text-white/90 tracking-[0.3em] relative">
                      4242  4242  4242  4242
                      {/* Efecto de relieve */}
                      <div className="absolute inset-0 text-white/20 blur-sm">4242  4242  4242  4242</div>
                    </div>
                  </div>
                  
                  {/* Nombre y fecha con efecto metálico */}
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <div className="text-white/30 text-xs mb-1 tracking-widest">TITULAR</div>
                      <div className="text-white/70 text-sm relative">
                        KADI TS&D
                        <div className="absolute inset-0 text-white/20 blur-[1px]">KADI TS&D</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/30 text-xs mb-1 tracking-widest">VENCE</div>
                      <div className="text-white/70 text-sm relative">
                        12/28
                        <div className="absolute inset-0 text-white/20 blur-[1px]">12/28</div>
                      </div>
                    </div>
                  </div>

                  {/* Banda magnética simulada (solo visible en hover) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovering ? 0.1 : 0 }}
                    className="absolute inset-x-0 top-1/2 h-8 bg-gradient-to-r from-transparent via-white to-transparent blur-xl"
                  />

                  {/* Logo de la tarjeta con efecto 3D */}
                  <motion.div
                    key={selectedPlan}
                    initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="absolute top-6 right-6"
                  >
                    <div className="text-3xl font-bold text-white/90 relative">
                      {selectedPlan === "visa" && "VISA"}
                      {selectedPlan === "mastercard" && "MC"}
                      {selectedPlan === "amex" && "AMEX"}
                      {!selectedPlan && "💳"}
                      <div className="absolute inset-0 text-white/20 blur-md">
                        {selectedPlan === "visa" && "VISA"}
                        {selectedPlan === "mastercard" && "MC"}
                        {selectedPlan === "amex" && "AMEX"}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Métodos de pago con estilo tecnológico */}
            <div className="mt-8 grid grid-cols-5 gap-3">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPlan(method.id)}
                  className={`relative p-3 rounded-lg border transition-all overflow-hidden group ${
                    selectedPlan === method.id
                      ? "border-[#4ade80] bg-[#4ade80]/5"
                      : "border-white/5 bg-white/5 hover:border-white/20"
                  }`}
                >
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className={`text-2xl mb-1 bg-gradient-to-br ${method.gradient} bg-clip-text text-transparent`}>
                    {method.icon}
                  </div>
                  <div className="text-[10px] text-white/40">{method.name}</div>
                </motion.button>
              ))}
            </div>

            {/* Indicador de seguridad */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center space-x-2 text-xs text-white/20"
            >
              <span className="w-1 h-1 bg-[#4ade80] rounded-full" />
              <span>PCI DSS NIVEL 1 · ENCRIPTACIÓN AES-256</span>
            </motion.div>
          </motion.div>

          {/* COLUMNA DERECHA: Facilidades de pago (estilo tecnológico) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="text-sm text-white/30 mb-4 tracking-widest flex items-center space-x-2">
              <span className="w-1 h-1 bg-[#60a5fa] rounded-full" />
              <span>PLANES DE FINANCIAMIENTO</span>
            </div>

            {/* Planes con estilo de terminal */}
            <div className="grid grid-cols-2 gap-4">
              {financingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative p-6 rounded-xl border ${
                    plan.destacado
                      ? "border-[#4ade80] bg-gradient-to-br from-[#4ade80]/5 to-transparent"
                      : "border-white/5 bg-gradient-to-br from-white/5 to-transparent"
                  } overflow-hidden group`}
                >
                  {/* Efecto de escaneo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {plan.destacado && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-3 left-4 px-2 py-1 bg-[#4ade80] rounded-full text-[10px] text-black font-bold"
                    >
                      RECOMENDADO
                    </motion.div>
                  )}
                  
                  <div className="text-3xl mb-3 opacity-70">{plan.icon}</div>
                  <div className="text-2xl font-light text-white/90 mb-1">
                    {plan.meses} <span className="text-sm text-white/30">meses</span>
                  </div>
                  <div className={`text-sm ${
                    plan.interes === "Sin intereses" 
                      ? "text-[#4ade80]" 
                      : "text-white/40"
                  }`}>
                    {plan.interes}
                  </div>
                  
                  {/* Barra de progreso tecnológica */}
                  <div className="mt-4 h-px w-full bg-white/5 relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-[#4ade80] to-[#60a5fa]"
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${(plan.meses / 24) * 100}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mensaje de confianza con estilo tecnológico */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 border border-white/5 rounded-xl bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden"
            >
              {/* Línea de tiempo tecnológica */}
              <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-[#4ade80] to-transparent" />
              <div className="absolute top-0 right-0 w-20 h-px bg-gradient-to-l from-[#60a5fa] to-transparent" />
              
              <div className="flex items-start space-x-4 relative">
                <div className="text-3xl">🔒</div>
                <div>
                  <h4 className="text-white/90 mb-2">Infraestructura segura</h4>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Todos los pagos procesados con encriptación bancaria de 256 bits. 
                    Certificación PCI DSS Nivel 1.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Beneficios en grid tecnológico */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                "Sin comisiones ocultas",
                "Pago en OXXO",
                "Transferencia SPEI",
                "Facturación automática",
                "3D Secure",
                "Tokenización"
              ].map((beneficio, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center space-x-2 text-white/30 group"
                >
                  <span className="text-[#4ade80] text-xs">✓</span>
                  <span className="text-xs group-hover:text-white/40 transition-colors">{beneficio}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Badge tecnológico inferior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-3 text-xs border border-white/5 rounded-full px-6 py-3 bg-black/50 backdrop-blur-sm">
            <span className="w-1 h-1 bg-[#4ade80] rounded-full animate-pulse" />
            <span className="text-white/30 tracking-widest">PROCESAMIENTO EN TIEMPO REAL</span>
            <span className="w-1 h-1 bg-[#60a5fa] rounded-full animate-pulse" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}