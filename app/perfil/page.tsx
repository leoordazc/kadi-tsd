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

interface Pedido {
  id: string;
  folio: string;
  created_at: string;
  total: number;
  status: 'pendiente_pago' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
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
  const [editando, setEditando] = useState<string | null>(null);
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

    setPedidos(data || []);
  };

  const actualizarPerfil = async (campo: string, valor: string) => {
    if (!user) return;

    const nuevoFormData = { ...formData, [campo]: valor };

    const { error } = await supabase
      .from('perfiles')
      .update({
        ...nuevoFormData,
        updated_at: new Date()
      })
      .eq('user_id', user.id);

    if (!error) {
      setPerfil({ ...perfil, ...nuevoFormData } as Perfil);
      setFormData(nuevoFormData);
      setEditando(null);
    } else {
      alert("Error al actualizar perfil");
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendiente_pago':
        return { text: 'Pendiente de pago', color: 'bg-yellow-500/10 text-yellow-400' };
      case 'pagado':
        return { text: 'Pago confirmado', color: 'bg-blue-500/10 text-blue-400' };
      case 'enviado':
        return { text: 'Enviado', color: 'bg-purple-500/10 text-purple-400' };
      case 'entregado':
        return { text: 'Entregado', color: 'bg-green-500/10 text-green-400' };
      case 'cancelado':
        return { text: 'Cancelado', color: 'bg-red-500/10 text-red-400' };
      default:
        return { text: status, color: 'bg-white/5 text-white/40' };
    }
  };

  const getMetodoPagoTexto = (metodo: string) => {
    switch (metodo) {
      case 'transferencia': return '🏦 Transferencia BBVA';
      case 'tarjeta': return '💳 Tarjeta (Mercado Pago)';
      case 'whatsapp': return '📱 WhatsApp';
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.span className="text-[#ef4444] text-xl group-hover:-translate-x-1 transition-transform">
                ←
              </motion.span>
              <span className="text-white/70 group-hover:text-white text-sm">Volver al inicio</span>
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

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Grid principal: 2 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ===== COLUMNA IZQUIERDA (SIDEBAR) ===== */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Tarjeta de perfil con avatar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-6 text-center"
            >
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#0f2b5c] to-[#1e4a8c] flex items-center justify-center mb-4 shadow-lg shadow-[#0f2b5c]/30">
                <span className="text-white text-3xl font-light">
                  {perfil?.nombre?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              
              <h2 className="text-xl font-medium text-white/90 mb-1">
                {perfil?.nombre || 'Sin nombre'}
              </h2>
              <p className="text-white/40 text-sm mb-4">{user?.email}</p>
              
              {/* Fecha de registro */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-white/30 text-xs">
                  Miembro desde {new Date(user?.created_at).toLocaleDateString('es-MX', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </motion.div>

            {/* Menú lateral (navegación) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-2"
            >
              {[
                { id: 'info', icon: '👤', label: 'Información personal' },
                { id: 'seguridad', icon: '🔒', label: 'Seguridad' },
                { id: 'pedidos', icon: '📦', label: 'Historial de pedidos' },
                { id: 'garantias', icon: '🛡️', label: 'Garantías' },
              ].map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </motion.div>

            {/* Tarjeta de seguridad */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#4ade80]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-white/70 text-xs font-medium">Cuenta protegida</span>
              </div>
              <p className="text-white/30 text-xs leading-relaxed">
                Tu cuenta está protegida con encriptación SSL. Solo tú puedes ver tu información.
              </p>
            </motion.div>
          </div>

          {/* ===== COLUMNA DERECHA (CONTENIDO) ===== */}
          <div className="lg:col-span-2 space-y-6">

            {/* ===== SECCIÓN: INFORMACIÓN PERSONAL ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-light text-white/90">Información personal</h2>
                <p className="text-white/40 text-xs mt-1">Administra tus datos de contacto y envío</p>
              </div>

              <div className="divide-y divide-white/5">
                {/* Email (no editable) */}
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider">Email</p>
                      <p className="text-white/80 text-sm">{user?.email}</p>
                    </div>
                  </div>
                  <span className="text-white/20 text-xs">Verificado</span>
                </div>

                {/* Nombre */}
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    {editando === 'nombre' ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        onBlur={() => actualizarPerfil('nombre', formData.nombre)}
                        autoFocus
                        className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-[#ef4444]"
                      />
                    ) : (
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">Nombre</p>
                        <p className="text-white/80 text-sm">{perfil?.nombre || 'No especificado'}</p>
                      </div>
                    )}
                  </div>
                  {editando !== 'nombre' && (
                    <button
                      onClick={() => setEditando('nombre')}
                      className="text-[#ef4444] text-xs hover:text-white transition"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    {editando === 'telefono' ? (
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        onBlur={() => actualizarPerfil('telefono', formData.telefono)}
                        autoFocus
                        className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-[#ef4444]"
                      />
                    ) : (
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">Teléfono</p>
                        <p className="text-white/80 text-sm">{perfil?.telefono || 'No especificado'}</p>
                      </div>
                    )}
                  </div>
                  {editando !== 'telefono' && (
                    <button
                      onClick={() => setEditando('telefono')}
                      className="text-[#ef4444] text-xs hover:text-white transition"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {/* Dirección */}
                <div className="flex items-start justify-between p-5">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    {editando === 'direccion' ? (
                      <textarea
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        onBlur={() => actualizarPerfil('direccion', formData.direccion)}
                        autoFocus
                        rows={2}
                        className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-[#ef4444]"
                      />
                    ) : (
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">Dirección de envío</p>
                        <p className="text-white/80 text-sm">{perfil?.direccion || 'No especificada'}</p>
                      </div>
                    )}
                  </div>
                  {editando !== 'direccion' && (
                    <button
                      onClick={() => setEditando('direccion')}
                      className="text-[#ef4444] text-xs hover:text-white transition"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ===== SECCIÓN: HISTORIAL DE PEDIDOS ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-light text-white/90">Historial de pedidos</h2>
                  <p className="text-white/40 text-xs mt-1">{pedidos.length} pedidos realizados</p>
                </div>
                <span className="text-3xl">📦</span>
              </div>

              {pedidos.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-white/40 mb-4">Aún no tienes pedidos</p>
                  <Link
                    href="/catalogo"
                    className="inline-block px-6 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition text-sm"
                  >
                    Explorar catálogo
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {pedidos.map((pedido) => {
                    const statusInfo = getStatusInfo(pedido.status);
                    
                    return (
                      <div key={pedido.id}>
                        {/* Cabecera del pedido */}
                        <button
                          onClick={() => setExpandidoId(expandidoId === pedido.id ? null : pedido.id)}
                          className="w-full p-5 hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <span className="text-lg">📄</span>
                              </div>
                              <div>
                                <p className="text-white/90 font-medium text-sm">
                                  {pedido.folio || pedido.id.slice(0, 8)}
                                </p>
                                <p className="text-white/40 text-xs">
                                  {new Date(pedido.created_at).toLocaleDateString('es-MX', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-white/90 font-light text-lg">
                                  ${pedido.total.toLocaleString()}
                                </p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </span>
                              </div>
                              <motion.span
                                animate={{ rotate: expandidoId === pedido.id ? 180 : 0 }}
                                className="text-white/30"
                              >
                                ▼
                              </motion.span>
                            </div>
                          </div>
                        </button>

                        {/* Detalles expandidos */}
                        <AnimatePresence>
                          {expandidoId === pedido.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-black/40 overflow-hidden"
                            >
                              <div className="p-5 space-y-4">
                                {/* Método de pago */}
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-white/40">Método de pago</span>
                                  <span className="text-white/70">{getMetodoPagoTexto(pedido.metodo_pago)}</span>
                                </div>

                                {/* Productos */}
                                <div>
                                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Productos</p>
                                  <div className="space-y-2">
                                    {pedido.items?.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm bg-white/5 rounded-lg p-3">
                                        <div>
                                          <p className="text-white/80">{item.nombre}</p>
                                          <p className="text-white/30 text-xs">Cantidad: {item.cantidad}</p>
                                        </div>
                                        <p className="text-white/60">${(item.precio * item.cantidad).toLocaleString()}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Número de guía */}
                                {pedido.numero_guia && (
                                  <div className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-3">
                                    <span className="text-white/40">Número de guía</span>
                                    <span className="text-white/70 font-mono">{pedido.numero_guia}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}