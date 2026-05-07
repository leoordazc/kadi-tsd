"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function PaymentSection() {
  const [selectedMethod, setSelectedMethod] = useState<string>("tarjeta");

  const paymentMethods = [
    { id: "tarjeta", name: "Tarjeta", icon: "💳", description: "Crédito / Débito" },
    { id: "transferencia", name: "Transferencia", icon: "🏦", description: "SPEI / BBVA" },
    { id: "oxxo", name: "OXXO", icon: "🏪", description: "Efectivo" },
    { id: "whatsapp", name: "WhatsApp", icon: "💬", description: "Coordinar" },
  ];

  const financingPlans = [
    { meses: 3, interes: "Sin intereses", destacado: false },
    { meses: 6, interes: "Sin intereses", destacado: false },
    { meses: 12, interes: "Sin intereses", destacado: true },
    { meses: 18, interes: "7% de interés", destacado: false },
  ];

  return (
    <section className="relative z-10 py-20 border-t border-white/5 bg-black">
      <div className="max-w-6xl mx-auto px-8">
        
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-light text-white/90 mb-3">
            Métodos de <span className="text-[#ef4444]">pago</span>
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#ef4444] to-transparent mx-auto" />
        </motion.div>

        {/* Grid de métodos de pago */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {paymentMethods.map((method, idx) => (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedMethod(method.id)}
              className={`group p-5 rounded-xl border transition-all ${
                selectedMethod === method.id
                  ? "border-[#ef4444] bg-[#ef4444]/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="text-3xl mb-2">{method.icon}</div>
              <div className="text-white/80 text-sm font-medium">{method.name}</div>
              <div className="text-white/30 text-xs">{method.description}</div>
            </motion.button>
          ))}
        </div>

        {/* Tarjeta de prueba (solo visual) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-white/10">
            <div className="text-white/40 text-xs mb-4 tracking-wider">TARJETA DE PRUEBA</div>
            <div className="font-mono text-white/80 text-lg tracking-wider mb-4">
              4242 4242 4242 4242
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <div className="text-white/30 text-xs">Titular</div>
                <div className="text-white/60">KADI TS&D</div>
              </div>
              <div className="text-right">
                <div className="text-white/30 text-xs">Vence</div>
                <div className="text-white/60">12/28</div>
              </div>
              <div className="text-right">
                <div className="text-white/30 text-xs">CVV</div>
                <div className="text-white/60">123</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <span className="text-[#ef4444] text-xs">✓ Entorno de pruebas</span>
            </div>
          </div>
        </motion.div>

        {/* Planes de financiamiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <h3 className="text-white/60 text-sm mb-6 tracking-wider">PLANES DE FINANCIAMIENTO</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {financingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                className={`relative p-4 rounded-xl border ${
                  plan.destacado
                    ? "border-[#ef4444] bg-[#ef4444]/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {plan.destacado && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#ef4444] rounded-full text-[9px] text-white font-bold whitespace-nowrap">
                    RECOMENDADO
                  </div>
                )}
                <div className="text-xl font-light text-white/80">{plan.meses} meses</div>
                <div className={`text-xs ${plan.interes === "Sin intereses" ? "text-[#ef4444]" : "text-white/40"}`}>
                  {plan.interes}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Información de seguridad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
        >
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="text-white/80 text-sm font-medium">Seguridad garantizada</div>
              <div className="text-white/30 text-xs">Certificación PCI DSS Nivel 1 · Encriptación AES-256</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="text-white/80 text-sm font-medium">Sin comisiones ocultas</div>
              <div className="text-white/30 text-xs">Transferencia SPEI · Facturación automática · Tokenización</div>
            </div>
          </div>
        </motion.div>

        {/* Badge final */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 bg-[#ef4444] rounded-full animate-pulse" />
            <span className="text-white/30 text-[10px] tracking-wider">PROCESAMIENTO SEGURO · 3D SECURE</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}