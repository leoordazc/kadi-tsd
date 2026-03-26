"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Pedido {
  id: string;
  fecha: string;
  total: number;
  estado: string;
  metodo_pago: string;
  numero_guia: string;
  paqueteria?: string;
  items: any[];
}

// URLs de rastreo por paquetería
const urlsRastreo: Record<string, string> = {
  "omnibus": "https://www.omnibusdemexico.com.mx/rastreo?numero_guia=",
  "estafeta": "https://www.estafeta.com/rastreo?numero_guia=",
  "dhl": "https://www.dhl.com/mx-es/home/tracking.html?tracking-id=",
  "fedex": "https://www.fedex.com/apps/fedextrack/?tracknumbers=",
  "redpack": "https://www.redpack.com.mx/rastreo/?guia=",
  "mercadoenvios": "https://www.mercadolibre.com.mx/envios/tracking?id=",
  "default": "https://www.omnibusdemexico.com.mx/rastreo?numero_guia="
};

const nombresPaqueteria: Record<string, string> = {
  "omnibus": "Ómnibus de México",
  "estafeta": "Estafeta",
  "dhl": "DHL",
  "fedex": "FedEx",
  "redpack": "Redpack",
  "mercadoenvios": "Mercado Envíos",
  "default": "Paquetería"
};

export default function SeguimientoPage() {
  const [numeroGuia, setNumeroGuia] = useState("");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [iframeLoading, setIframeLoading] = useState(true);

  const buscarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroGuia.trim()) return;

    setLoading(true);
    setError("");
    setPedido(null);

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('numero_guia', numeroGuia.trim())
      .single();

    if (error || !data) {
      setError("No encontramos un pedido con ese número de guía");
    } else {
      setPedido(data);
      setIframeLoading(true);
    }
    setLoading(false);
  };

  const getTrackingUrl = (guia: string, paqueteria?: string) => {
    const baseUrl = urlsRastreo[paqueteria || 'default'] || urlsRastreo.default;
    return `${baseUrl}${guia}`;
  };

  const getPaqueteriaNombre = (paqueteria?: string) => {
    return nombresPaqueteria[paqueteria || 'default'];
  };

  const getEstadoInfo = (estado: string) => {
    const estados: Record<string, { label: string; color: string; bg: string; step: number }> = {
      pendiente: { label: "Pendiente de pago", color: "text-yellow-400", bg: "bg-yellow-400/10", step: 1 },
      pagado: { label: "Pago confirmado", color: "text-blue-400", bg: "bg-blue-400/10", step: 2 },
      enviado: { label: "En camino", color: "text-purple-400", bg: "bg-purple-400/10", step: 3 },
      entregado: { label: "Entregado", color: "text-green-400", bg: "bg-green-400/10", step: 4 },
      cancelado: { label: "Cancelado", color: "text-red-400", bg: "bg-red-400/10", step: 0 }
    };
    return estados[estado] || estados.pendiente;
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/75 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.span className="text-[#ef4444] text-xl group-hover:-translate-x-1 transition-transform">
                ←
              </motion.span>
              <span className="text-white/70 group-hover:text-white">Volver al inicio</span>
            </Link>
            <h1 className="text-2xl font-light">Seguimiento de <span className="text-[#ef4444]">pedidos</span></h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Formulario de búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-8 mb-8"
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📦</div>
            <h2 className="text-xl font-light">Rastrear mi pedido</h2>
            <p className="text-white/40 text-sm mt-1">Ingresa tu número de guía para ver el estado</p>
          </div>

          <form onSubmit={buscarPedido} className="space-y-4">
            <div>
              <label className="text-white/40 text-xs block mb-1">Número de guía</label>
              <input
                type="text"
                value={numeroGuia}
                onChange={(e) => setNumeroGuia(e.target.value)}
                placeholder="Ej: KADI-12345 o 123456789"
                className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/80 placeholder-white/30 focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ef4444] text-white py-3 rounded-lg hover:bg-[#ef4444]/90 transition disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Rastrear pedido"}
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

        {/* Resultados con iframe incrustado */}
        {pedido && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden"
          >
            {/* Info del pedido */}
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-white/90 font-medium">Pedido #{pedido.id.slice(0, 8)}</h3>
                  <p className="text-white/30 text-xs">{new Date(pedido.fecha).toLocaleDateString('es-MX')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${getEstadoInfo(pedido.estado).bg} ${getEstadoInfo(pedido.estado).color}`}>
                  {getEstadoInfo(pedido.estado).label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40 text-xs">Número de guía</p>
                  <p className="text-white/80 font-mono">{pedido.numero_guia}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Paquetería</p>
                  <p className="text-white/80">{getPaqueteriaNombre(pedido.paqueteria)}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Total</p>
                  <p className="text-white/80">${pedido.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Método de pago</p>
                  <p className="text-white/80">{pedido.metodo_pago || "No especificado"}</p>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            {pedido.estado !== 'cancelado' && (
              <div className="px-6 pt-4">
                <div className="flex justify-between mb-2 text-xs text-white/40">
                  <span>Pendiente</span>
                  <span>Pagado</span>
                  <span>Enviado</span>
                  <span>Entregado</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(getEstadoInfo(pedido.estado).step / 4) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#ef4444] to-[#f97316]"
                  />
                </div>
              </div>
            )}

            {/* IFRAME DE RASTREO */}
            <div className="p-6">
              <div className="bg-black/40 rounded-lg overflow-hidden border border-white/10">
                <div className="bg-black/60 px-4 py-2 border-b border-white/10 flex justify-between items-center">
                  <span className="text-white/50 text-xs">Rastreo en tiempo real</span>
                  <span className="text-white/30 text-xs">{getPaqueteriaNombre(pedido.paqueteria)}</span>
                </div>
                
                {iframeLoading && (
                  <div className="h-[500px] flex items-center justify-center bg-black/40">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                      <p className="text-white/40 text-sm">Cargando información de rastreo...</p>
                    </div>
                  </div>
                )}
                
                <iframe
                  src={getTrackingUrl(pedido.numero_guia, pedido.paqueteria)}
                  className={`w-full h-[500px] border-0 ${iframeLoading ? 'hidden' : 'block'}`}
                  title="Rastreo de paquetería"
                  onLoad={() => setIframeLoading(false)}
                  onError={() => setIframeLoading(false)}
                />
              </div>
            </div>

            {/* Ayuda */}
            <div className="p-6 pt-0 text-center border-t border-white/10">
              <p className="text-white/30 text-xs mb-2">¿Problemas con tu envío?</p>
              <button
                onClick={() => window.open("https://wa.me/5215512345678", "_blank")}
                className="text-[#ef4444] text-sm hover:text-white transition"
              >
                Contactar a soporte 📱
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}