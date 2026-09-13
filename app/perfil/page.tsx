"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Reclamacion {
  id: string;
  folio_pedido: string;
  producto_nombre: string;
  producto_codigo?: string;
  tipo_producto?: string;
  fecha_compra: string;
  fecha_inicio_garantia: string;
  fecha_fin_garantia: string;
  fecha_reclamacion: string;
  fecha_resolucion?: string;
  motivo: string;
  descripcion: string;
  status: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada' | 'resuelta';
  resolucion?: string;
}

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

type SeccionActiva = 'info' | 'seguridad' | 'pedidos' | 'garantias';

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>('info');
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: ""
  });

  // Estado para reclamaciones
  const [reclamaciones, setReclamaciones] = useState<Reclamacion[]>([]);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [nuevaReclamacion, setNuevaReclamacion] = useState({
    pedido_id: '',
    folio_pedido: '',
    producto_nombre: '',
    producto_codigo: '',
    tipo_producto: '',
    motivo: '',
    descripcion: ''
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
      await cargarReclamaciones(user.id);
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

  const cargarReclamaciones = async (userId: string) => {
    const { data } = await supabase
      .from('reclamaciones_garantia')
      .select('*')
      .eq('user_id', userId)
      .order('fecha_reclamacion', { ascending: false });

    setReclamaciones(data || []);
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

  // ============================================
  // HELPERS
  // ============================================

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendiente_pago': return { text: 'Pendiente de pago', color: 'bg-yellow-500/10 text-yellow-400' };
      case 'pagado': return { text: 'Pago confirmado', color: 'bg-blue-500/10 text-blue-400' };
      case 'enviado': return { text: 'Enviado', color: 'bg-purple-500/10 text-purple-400' };
      case 'entregado': return { text: 'Entregado', color: 'bg-green-500/10 text-green-400' };
      case 'cancelado': return { text: 'Cancelado', color: 'bg-red-500/10 text-red-400' };
      default: return { text: status, color: 'bg-white/5 text-white/40' };
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

  const getReclamacionStatusInfo = (status: string) => {
    switch (status) {
      case 'pendiente': return { text: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-400' };
      case 'en_revision': return { text: 'En revisión', color: 'bg-blue-500/10 text-blue-400' };
      case 'aprobada': return { text: 'Aprobada', color: 'bg-green-500/10 text-green-400' };
      case 'rechazada': return { text: 'Rechazada', color: 'bg-red-500/10 text-red-400' };
      case 'resuelta': return { text: 'Resuelta', color: 'bg-purple-500/10 text-purple-400' };
      default: return { text: status, color: 'bg-white/5 text-white/40' };
    }
  };

  const calcularFechaFinGarantia = (fechaCompra: string, tipo: string) => {
    const fecha = new Date(fechaCompra);
    const meses = tipo === 'Nueva' ? 3 : tipo === 'Reconstruida' ? 3 : 1;
    fecha.setMonth(fecha.getMonth() + meses);
    return fecha.toISOString().split('T')[0];
  };

  const garantiaVigente = (fechaFin: string) => {
    return new Date(fechaFin) >= new Date();
  };

  // ============================================
  // CREAR RECLAMACIÓN
  // ============================================

  const crearReclamacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const pedidoSeleccionado = pedidos.find(p => p.id === nuevaReclamacion.pedido_id);
    if (!pedidoSeleccionado) {
      alert('Selecciona un pedido');
      return;
    }

    const item = pedidoSeleccionado.items?.[0];
    const fechaCompra = pedidoSeleccionado.created_at;
    const fechaFin = calcularFechaFinGarantia(fechaCompra, item?.tipo || 'Nueva');

    if (!garantiaVigente(fechaFin)) {
      alert('⚠️ La garantía de este producto ha vencido.');
      return;
    }

    const { error } = await supabase
      .from('reclamaciones_garantia')
      .insert({
        user_id: user.id,
        user_email: user.email,
        pedido_id: pedidoSeleccionado.id,
        folio_pedido: pedidoSeleccionado.folio,
        producto_nombre: item?.nombre || 'Producto',
        producto_codigo: item?.codigo_caja || '',
        tipo_producto: item?.tipo || 'Nueva',
        fecha_compra: fechaCompra,
        fecha_inicio_garantia: fechaCompra,
        fecha_fin_garantia: fechaFin,
        motivo: nuevaReclamacion.motivo,
        descripcion: nuevaReclamacion.descripcion,
        status: 'pendiente'
      });

    if (error) {
      alert('Error al crear la reclamación: ' + error.message);
      return;
    }

    alert('✅ Reclamación enviada. Te contactaremos pronto.');
    setMostrandoFormulario(false);
    setNuevaReclamacion({
      pedido_id: '',
      folio_pedido: '',
      producto_nombre: '',
      producto_codigo: '',
      tipo_producto: '',
      motivo: '',
      descripcion: ''
    });
    await cargarReclamaciones(user.id);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ===== COLUMNA IZQUIERDA (SIDEBAR) ===== */}
          <div className="lg:col-span-1 space-y-6">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-6 text-center"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#0f2b5c] to-[#1e4a8c] flex items-center justify-center mb-4 shadow-lg shadow-[#0f2b5c]/30">
                <span className="text-white text-3xl font-light">
                  {perfil?.nombre?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              
              <h2 className="text-xl font-medium text-white/90 mb-1">
                {perfil?.nombre || 'Sin nombre'}
              </h2>
              <p className="text-white/40 text-sm mb-4">{user?.email}</p>
              
              <div className="pt-4 border-t border-white/5">
                <p className="text-white/30 text-xs">
                  Miembro desde {new Date(user?.created_at).toLocaleDateString('es-MX', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </motion.div>

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
                  onClick={() => setSeccionActiva(item.id as SeccionActiva)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm ${
                    seccionActiva === item.id
                      ? 'bg-[#ef4444]/10 text-white border border-[#ef4444]/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </motion.div>
          </div>

          {/* ===== COLUMNA DERECHA (CONTENIDO DINÁMICO) ===== */}
          <div className="lg:col-span-2 space-y-6">

            <AnimatePresence mode="wait">
              
              {/* ===== SECCIÓN: INFORMACIÓN PERSONAL ===== */}
              {seccionActiva === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden"
                >
                  <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-light text-white/90">Información personal</h2>
                    <p className="text-white/40 text-xs mt-1">Administra tus datos de contacto y envío</p>
                  </div>

                  <div className="divide-y divide-white/5">
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
                      <span className="text-[#4ade80] text-xs">✓ Verificado</span>
                    </div>

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
              )}

              {/* ===== SECCIÓN: SEGURIDAD ===== */}
              {seccionActiva === 'seguridad' && (
                <motion.div
                  key="seguridad"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                      <h2 className="text-xl font-light text-white/90">Estado de la cuenta</h2>
                      <p className="text-white/40 text-xs mt-1">Tu cuenta está protegida</p>
                    </div>

                    <div className="divide-y divide-white/5">
                      <div className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#4ade80]/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white/80 text-sm font-medium">Encriptación SSL</p>
                            <p className="text-white/40 text-xs">Todos tus datos están protegidos</p>
                          </div>
                        </div>
                        <span className="text-[#4ade80] text-xs">Activo</span>
                      </div>

                      <div className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#4ade80]/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white/80 text-sm font-medium">Email verificado</p>
                            <p className="text-white/40 text-xs">{user?.email}</p>
                          </div>
                        </div>
                        <span className="text-[#4ade80] text-xs">Verificado</span>
                      </div>

                      <div className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white/80 text-sm font-medium">Contraseña</p>
                            <p className="text-white/40 text-xs">Se recomienda cambiarla cada 6 meses</p>
                          </div>
                        </div>
                        <button className="text-[#ef4444] text-xs hover:text-white transition">
                          Cambiar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                      <h2 className="text-xl font-light text-white/90">Sesiones activas</h2>
                      <p className="text-white/40 text-xs mt-1">Dispositivos conectados a tu cuenta</p>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💻</span>
                          <div>
                            <p className="text-white/80 text-sm font-medium">Este dispositivo</p>
                            <p className="text-white/40 text-xs">Última sesión: ahora mismo</p>
                          </div>
                        </div>
                        <span className="text-[#4ade80] text-xs">Activa</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== SECCIÓN: HISTORIAL DE PEDIDOS ===== */}
              {seccionActiva === 'pedidos' && (
                <motion.div
                  key="pedidos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
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

                            <AnimatePresence>
                              {expandidoId === pedido.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="bg-black/40 overflow-hidden"
                                >
                                  <div className="p-5 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-white/40">Método de pago</span>
                                      <span className="text-white/70">{getMetodoPagoTexto(pedido.metodo_pago)}</span>
                                    </div>

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
              )}

              {/* ===== SECCIÓN: GARANTÍAS ===== */}
              {seccionActiva === 'garantias' && (
                <motion.div
                  key="garantias"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                      <h2 className="text-xl font-light text-white/90">Garantías KADI</h2>
                      <p className="text-white/40 text-xs mt-1">Información sobre nuestras políticas</p>
                    </div>

                    <div className="p-6 space-y-6">
                      <div>
                        <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                          <span>🔧</span> Garantía de productos
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70 text-sm">Transmisiones nuevas</span>
                            <span className="text-[#4ade80] text-sm font-medium">3 meses</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70 text-sm">Transmisiones reconstruidas</span>
                            <span className="text-[#4ade80] text-sm font-medium">3 meses</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70 text-sm">Transmisiones usadas</span>
                            <span className="text-[#4ade80] text-sm font-medium">1 mes</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70 text-sm">Diferenciales</span>
                            <span className="text-[#4ade80] text-sm font-medium">3 meses</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                          <span>✅</span> ¿Qué cubre la garantía?
                        </h3>
                        <ul className="space-y-2 text-sm text-white/60">
                          <li className="flex gap-2"><span className="text-[#4ade80]">✓</span> Defectos de fabricación</li>
                          <li className="flex gap-2"><span className="text-[#4ade80]">✓</span> Fallas mecánicas internas</li>
                          <li className="flex gap-2"><span className="text-[#4ade80]">✓</span> Reemplazo de piezas defectuosas</li>
                          <li className="flex gap-2"><span className="text-[#4ade80]">✓</span> Diagnóstico en nuestros talleres</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                          <span>❌</span> ¿Qué NO cubre la garantía?
                        </h3>
                        <ul className="space-y-2 text-sm text-white/60">
                          <li className="flex gap-2"><span className="text-red-400">✗</span> Daños por instalación incorrecta</li>
                          <li className="flex gap-2"><span className="text-red-400">✗</span> Uso inadecuado o sobrecarga</li>
                          <li className="flex gap-2"><span className="text-red-400">✗</span> Falta de mantenimiento</li>
                          <li className="flex gap-2"><span className="text-red-400">✗</span> Modificaciones no autorizadas</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* ===== MIS RECLAMACIONES ===== */}
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-light text-white/90">Mis reclamaciones</h2>
                        <p className="text-white/40 text-xs mt-1">{reclamaciones.length} reclamaciones registradas</p>
                      </div>
                      <button
                        onClick={() => setMostrandoFormulario(true)}
                        className="bg-[#ef4444] text-white px-4 py-2 rounded-lg text-xs hover:bg-[#ef4444]/90 transition"
                      >
                        + Nueva reclamación
                      </button>
                    </div>

                    {reclamaciones.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-white/40 text-sm">No has realizado ninguna reclamación</p>
                        <p className="text-white/20 text-xs mt-2">Si tienes un problema con un producto, puedes reclamar tu garantía aquí.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {reclamaciones.map((rec) => {
                          const vigente = garantiaVigente(rec.fecha_fin_garantia);
                          const statusInfo = getReclamacionStatusInfo(rec.status);

                          return (
                            <div key={rec.id} className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-white/90 font-medium text-sm">{rec.folio_pedido}</p>
                                  <p className="text-white/40 text-xs">{rec.producto_nombre}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <p className="text-white/30">Fecha de compra</p>
                                  <p className="text-white/60">{new Date(rec.fecha_compra).toLocaleDateString('es-MX')}</p>
                                </div>
                                <div>
                                  <p className="text-white/30">Vigencia garantía</p>
                                  <p className={vigente ? 'text-[#4ade80]' : 'text-red-400'}>
                                    {new Date(rec.fecha_fin_garantia).toLocaleDateString('es-MX')} {vigente ? '(Vigente)' : '(Vencida)'}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-white/30">Motivo</p>
                                  <p className="text-white/60">{rec.motivo}</p>
                                </div>
                              </div>

                              {rec.resolucion && (
                                <div className="mt-3 p-3 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-lg">
                                  <p className="text-[#4ade80] text-xs font-medium mb-1">Resolución:</p>
                                  <p className="text-white/70 text-xs">{rec.resolucion}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ===== FORMULARIO DE NUEVA RECLAMACIÓN (MODAL) ===== */}
      <AnimatePresence>
        {mostrandoFormulario && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => setMostrandoFormulario(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-xl font-light text-white/90 mb-4">Nueva reclamación de garantía</h3>
              
              <form onSubmit={crearReclamacion} className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs block mb-1">Pedido</label>
                  <select
                    value={nuevaReclamacion.pedido_id}
                    onChange={(e) => {
                      const pedido = pedidos.find(p => p.id === e.target.value);
                      setNuevaReclamacion({
                        ...nuevaReclamacion,
                        pedido_id: e.target.value,
                        folio_pedido: pedido?.folio || '',
                        producto_nombre: pedido?.items?.[0]?.nombre || '',
                        producto_codigo: pedido?.items?.[0]?.codigo_caja || '',
                        tipo_producto: pedido?.items?.[0]?.tipo || 'Nueva'
                      });
                    }}
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/80 text-sm focus:outline-none focus:border-[#ef4444]"
                  >
                    <option value="">Selecciona un pedido</option>
                    {pedidos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.folio} - {p.items?.[0]?.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/40 text-xs block mb-1">Motivo</label>
                  <select
                    value={nuevaReclamacion.motivo}
                    onChange={(e) => setNuevaReclamacion({ ...nuevaReclamacion, motivo: e.target.value })}
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/80 text-sm focus:outline-none focus:border-[#ef4444]"
                  >
                    <option value="">Selecciona el motivo</option>
                    <option value="Falla mecánica">Falla mecánica</option>
                    <option value="Pieza defectuosa">Pieza defectuosa</option>
                    <option value="No funciona correctamente">No funciona correctamente</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/40 text-xs block mb-1">Descripción del problema</label>
                  <textarea
                    value={nuevaReclamacion.descripcion}
                    onChange={(e) => setNuevaReclamacion({ ...nuevaReclamacion, descripcion: e.target.value })}
                    required
                    rows={4}
                    placeholder="Describe el problema con el mayor detalle posible..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/80 text-sm focus:outline-none focus:border-[#ef4444] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#ef4444] text-white py-3 rounded-lg text-sm hover:bg-[#ef4444]/90 transition"
                  >
                    Enviar reclamación
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrandoFormulario(false)}
                    className="px-6 bg-white/5 border border-white/10 text-white/70 py-3 rounded-lg text-sm hover:bg-white/10 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}