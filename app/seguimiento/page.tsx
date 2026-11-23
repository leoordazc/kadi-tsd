"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Pedido {
  id: string;
  folio: string;
  created_at: string;
  total: number;
  status: string; // Cambiado a status para coincidir con tu tabla
  metodo_pago: string;
  numero_guia: string;
  paqueteria?: string;
  items: any[];
}

export default function SeguimientoPage() {
  const [busqueda, setBusqueda] = useState("");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buscarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setLoading(true);
    setError("");
    setPedido(null);

    // Buscamos por número de guía O por folio de pedido
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .or(`numero_guia.eq.${busqueda.trim()},folio.eq.${busqueda.trim()}`)
      .single();

    if (error || !data) {
      setError("No encontramos un pedido con ese número de guía o folio. Verifica los datos.");
    } else {
      setPedido(data);
    }
    setLoading(false);
  };

  const getEstadoInfo = (status: string) => {
    // Estados basados en el nuevo flujo de KADI
    const estados: Record<string, { label: string; color: string; bg: string; step: number; icon: string }> = {
      pendiente_pago: { label: "Pendiente de pago", color: "text-yellow-400", bg: "bg-yellow-400/10", step: 1, icon: "💳" },
      en_preparacion: { label: "En preparación (CEDIS)", color: "text-blue-400", bg: "bg-blue-400/10", step: 2, icon: "📦" },
      en_paqueteria: { label: "Entregado a paquetería", color: "text-purple-400", bg: "bg-purple-400/10", step: 3, icon: "🚚" },
      entregado: { label: "Entregado al cliente", color: "text-green-400", bg: "bg-green-400/10", step: 4, icon: "✅" },
      cancelado: { label: "Cancelado", color: "text-red-400", bg: "bg-red-400/10", step: 0, icon: "❌" }
    };
    return estados[status] || estados.pendiente_pago;
  };

  return (
    <main className="min-h-screen text-white pb-20" style={{ backgroundColor: "var(--bg-primary)" }}>
      
      {/* Header Minimalista */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5" style={{ backgroundColor: "rgba(15, 18, 21, 0.75)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="text-sm">Volver al inicio</span>
          </Link>
          <h1 className="text-lg font-light text-white/90">Seguimiento de pedidos</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Formulario de búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-8 mb-8"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📦</div>
            <h2 className="text-xl font-light text-white/90">Rastrear mi pedido</h2>
            <p className="text-white/40 text-sm mt-1">Ingresa tu número de guía o folio de pedido</p>
          </div>

          <form onSubmit={buscarPedido} className="space-y-4">
            <div>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej: KADI-00001 o 123456789"
                className="w-full rounded-lg p-3 text-white/90 placeholder-white/30 focus:outline-none transition"
                style={{
                  backgroundColor: "rgba(15, 18, 21, 0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--kadi-gold)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white transition disabled:opacity-50"
              style={{
                background: "linear-gradient(90deg, var(--kadi-blue), var(--kadi-blue-bright))",
                boxShadow: "0 8px 20px rgba(30, 74, 140, 0.3)",
              }}
            >
              {loading ? "Buscando..." : "Buscar pedido"}
            </button>
          </form>
        </motion.div>

        {/* Errores */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center mb-8"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Resultados */}
        {pedido && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            {/* Info del pedido */}
            <div className="p-6 border-b border-white/5 bg-white/5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-white/90 font-medium text-lg">Pedido {pedido.folio || pedido.id.slice(0, 8)}</h3>
                  <p className="text-white/40 text-xs mt-1">
                    Fecha: {new Date(pedido.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoInfo(pedido.status).bg} ${getEstadoInfo(pedido.status).color}`}>
                  {getEstadoInfo(pedido.status).label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                <div>
                  <p className="text-white/40 text-xs">Total</p>
                  <p className="text-white/90 text-lg">${pedido.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Método de pago</p>
                  <p className="text-white/80">{pedido.metodo_pago || "No especificado"}</p>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            {pedido.status !== 'cancelado' && (
              <div className="px-6 py-8">
                <div className="flex justify-between mb-3 text-xs font-medium text-white/50">
                  <span className={getEstadoInfo(pedido.status).step >= 1 ? "text-white" : ""}>Pago</span>
                  <span className={getEstadoInfo(pedido.status).step >= 2 ? "text-white" : ""}>Preparación</span>
                  <span className={getEstadoInfo(pedido.status).step >= 3 ? "text-white" : ""}>Paquetería</span>
                  <span className={getEstadoInfo(pedido.status).step >= 4 ? "text-white" : ""}>Entregado</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(getEstadoInfo(pedido.status).step / 4) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, var(--kadi-blue), var(--kadi-gold))",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Datos de envío (Solo si ya está en paquetería o entregado) */}
            {(pedido.status === 'en_paqueteria' || pedido.status === 'entregado') && (
              <div className="p-6 pt-0">
                <div 
                  className="rounded-xl p-5 border"
                  style={{ 
                    backgroundColor: "rgba(212, 175, 55, 0.05)", 
                    borderColor: "rgba(212, 175, 55, 0.2)" 
                  }}
                >
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: "var(--kadi-gold)" }}>
                    <span>🚚</span> Información de envío
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/40 text-xs mb-1">Paquetería</p>
                      <p className="text-white/90 font-medium">{pedido.paqueteria || "No especificada"}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">Número de guía</p>
                      <p className="text-white/90 font-mono bg-black/40 px-2 py-1 rounded inline-block">
                        {pedido.numero_guia || "Pendiente"}
                      </p>
                    </div>
                  </div>
                  
                  {pedido.numero_guia && (
                    <p className="text-xs text-white/40 mt-4">
                      * Puedes usar este número en la página oficial de {pedido.paqueteria || "la paquetería"} para rastrear tu envío.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Ayuda */}
            <div className="p-6 border-t border-white/5 text-center">
              <p className="text-white/30 text-xs mb-2">¿Tienes dudas sobre tu pedido?</p>
              <a
                href={`https://wa.me/525573382923?text=Hola, tengo una duda sobre mi pedido ${pedido.folio || pedido.id.slice(0, 8)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
                style={{ color: "var(--kadi-gold)" }}
              >
                Contactar a soporte por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}