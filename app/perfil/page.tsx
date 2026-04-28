"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Perfil {
  id: string;
  email: string;
  nombre?: string;
  telefono?: string;
  direccion?: string;
}

// Actualiza la interfaz Pedido - cambia 'fecha' por 'created_at'
interface Pedido {
  id: string;
  folio: string;
  created_at: string;  // 👈 Cambiado de 'fecha' a 'created_at'
  total: number;
  estado: 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
  metodo_pago: string;
  numero_guia?: string;
  items: any[];
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: ""
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUser(user);
      await cargarPerfil(user.id);
      await cargarPedidos(user.id);
      setLoading(false);
    };
    getUser();
  }, []);

  const cargarPerfil = async (userId: string) => {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setPerfil(data);
      setFormData({
        nombre: data.nombre || "",
        telefono: data.telefono || "",
        direccion: data.direccion || ""
      });
    } else {
      const { data: newPerfil } = await supabase
        .from('perfiles')
        .insert({ user_id: userId, email: user.email })
        .select()
        .single();
      if (newPerfil) setPerfil(newPerfil);
    }
  };

  const cargarPedidos = async (userId: string) => {
  const { data } = await supabase
    .from('pedidos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (data) {
    // Mapear los datos para asegurar que 'created_at' existe
    const pedidosMapeados = data.map(pedido => ({
      ...pedido,
      created_at: pedido.created_at || pedido.fecha || new Date().toISOString()
    }));
    setPedidos(pedidosMapeados);
  }
};

  const actualizarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('perfiles')
      .update({
        nombre: formData.nombre,
        telefono: formData.telefono,
        direccion: formData.direccion,
        updated_at: new Date()
      })
      .eq('user_id', user.id);

    if (!error) {
      setPerfil({ ...perfil, ...formData } as Perfil);
      setEditando(false);
      alert("Perfil actualizado correctamente");
    } else {
      alert("Error al actualizar perfil");
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-400';
      case 'pagado': return 'bg-blue-500/20 text-blue-400';
      case 'enviado': return 'bg-purple-500/20 text-purple-400';
      case 'entregado': return 'bg-green-500/20 text-green-400';
      case 'cancelado': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/5 text-white/40';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '⏳ Pendiente de pago';
      case 'pagado': return '✅ Pago confirmado';
      case 'enviado': return '📦 Enviado';
      case 'entregado': return '🏠 Entregado';
      case 'cancelado': return '❌ Cancelado';
      default: return estado;
    }
  };

  const getMetodoPagoTexto = (metodo: string) => {
    switch (metodo) {
      case 'transferencia': return '🏦 Transferencia BBVA';
      case 'tarjeta': return '💳 Tarjeta (Mercado Pago)';
      case 'whatsapp': return '📱 Coordinar por WhatsApp';
      default: return metodo;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-light">Mi <span className="text-[#ef4444]">Perfil</span></h1>
            <button
              onClick={cerrarSesion}
              className="text-white/70 hover:text-red-400 transition-colors text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Información del usuario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-light text-white/90">Información personal</h2>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="text-[#ef4444] text-sm hover:text-white transition"
              >
                Editar perfil
              </button>
            )}
          </div>

          {editando ? (
            <form onSubmit={actualizarPerfil} className="space-y-4">
              <div>
                <label className="text-white/40 text-xs block mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/80"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs block mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/80"
                  placeholder="55 1234 5678"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs block mb-1">Dirección de envío</label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  rows={3}
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/80"
                  placeholder="Calle, número, colonia, ciudad, código postal"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/80 transition"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditando(false);
                    setFormData({
                      nombre: perfil?.nombre || "",
                      telefono: perfil?.telefono || "",
                      direccion: perfil?.direccion || ""
                    });
                  }}
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/40">Email</span>
                <span className="text-white/80">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Nombre</span>
                <span className="text-white/80">{perfil?.nombre || "No especificado"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Teléfono</span>
                <span className="text-white/80">{perfil?.telefono || "No especificado"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Dirección</span>
                <span className="text-white/80 text-right max-w-[60%]">
                  {perfil?.direccion || "No especificada"}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Historial de pedidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-6"
        >
          <h2 className="text-xl font-light text-white/90 mb-6">📦 Historial de pedidos</h2>
          
          {pedidos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40">Aún no tienes pedidos</p>
              <Link
                href="/catalogo"
                className="inline-block mt-4 text-[#ef4444] hover:text-white transition"
              >
                Comenzar a comprar →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="border border-white/10 rounded-lg overflow-hidden hover:border-[#ef4444]/30 transition"
                >
                  {/* Cabecera del pedido */}
                  <div className="p-4 cursor-pointer" onClick={() => setExpandidoId(expandidoId === pedido.id ? null : pedido.id)}>
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-white/90 font-medium">
                            📄 {pedido.folio || pedido.id.slice(0, 8)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoColor(pedido.estado)}`}>
                            {getEstadoTexto(pedido.estado)}
                          </span>
                        </div>
                        <p className="text-white/30 text-xs mt-1">
  {pedido.created_at ? new Date(pedido.created_at).toLocaleDateString('es-MX') : 'Fecha no disponible'}
</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/90 font-light text-xl">
  ${(pedido.total || 0).toLocaleString()}
</p>
                        <p className="text-white/30 text-xs">
                          {getMetodoPagoTexto(pedido.metodo_pago)}
                        </p>
                      </div>
                      <motion.button
                        animate={{ rotate: expandidoId === pedido.id ? 180 : 0 }}
                        className="text-white/40 hover:text-white transition"
                      >
                        ▼
                      </motion.button>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  <AnimatePresence>
                    {expandidoId === pedido.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 bg-black/40"
                      >
                        <div className="p-4 space-y-4">
                          {/* Productos */}
                          <div>
                            <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">
                              Productos
                            </h4>
                            <div className="space-y-2">
                              {pedido.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-white/70">
                                    {item.cantidad}x {item.nombre}
                                  </span>
                                  <span className="text-white/50">
                                    ${(item.precio * item.cantidad).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Número de guía */}
                          {pedido.numero_guia && (
                            <div className="border-t border-white/10 pt-3">
                              <span className="text-white/30 text-xs">Número de guía:</span>
                              <p className="text-white/70 text-sm font-mono">{pedido.numero_guia}</p>
                            </div>
                          )}

                          {/* Botones de acción según estado */}
                          <div className="flex gap-3 pt-2">
                            {pedido.estado === 'pendiente' && (
                              <button
                                onClick={() => window.location.href = `/pago/${pedido.id}`}
                                className="text-sm bg-[#ef4444] text-white px-4 py-1.5 rounded-lg hover:bg-[#ef4444]/80 transition"
                              >
                                Completar pago
                              </button>
                            )}
                            
                            {pedido.estado === 'entregado' && (
                              <button
                                onClick={() => window.open(`/garantia/${pedido.id}`, '_blank')}
                                className="text-sm bg-white/10 border border-white/10 px-4 py-1.5 rounded-lg hover:bg-white/20 transition"
                              >
                                Registrar garantía
                              </button>
                            )}

                            {pedido.numero_guia && (
                              <button
                                onClick={() => window.open(`https://www.omnibus.com.mx/rastreo/${pedido.numero_guia}`, '_blank')}
                                className="text-sm bg-white/10 border border-white/10 px-4 py-1.5 rounded-lg hover:bg-white/20 transition"
                              >
                                📦 Rastrear envío
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}