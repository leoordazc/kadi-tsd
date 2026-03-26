"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface Perfil {
  id: string;
  email: string;
  nombre?: string;
  telefono?: string;
  direccion?: string;
}

interface Pedido {
  id: string;
  fecha: string;
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
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: ""
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
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
      // Crear perfil si no existe
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
      .order('fecha', { ascending: false });
    
    setPedidos(data || []);
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
      case 'pendiente': return 'text-yellow-400 bg-yellow-400/10';
      case 'pagado': return 'text-blue-400 bg-blue-400/10';
      case 'enviado': return 'text-purple-400 bg-purple-400/10';
      case 'entregado': return 'text-green-400 bg-green-400/10';
      case 'cancelado': return 'text-red-400 bg-red-400/10';
      default: return 'text-white/40 bg-white/5';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente de pago';
      case 'pagado': return 'Pago confirmado';
      case 'enviado': return 'Enviado';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
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
          <h2 className="text-xl font-light text-white/90 mb-6">Historial de pedidos</h2>
          
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
                  className="border border-white/10 rounded-lg p-4 hover:border-[#ef4444]/30 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white/90 font-medium">
                        Pedido #{pedido.id.slice(0, 8)}
                      </p>
                      <p className="text-white/30 text-xs">
                        {new Date(pedido.fecha).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1 rounded-full ${getEstadoColor(pedido.estado)}`}>
                        {getEstadoTexto(pedido.estado)}
                      </span>
                      <p className="text-white/90 font-light mt-1">${pedido.total.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {pedido.numero_guia && (
                    <div className="mt-2 text-xs text-white/30">
                      📦 Guía: {pedido.numero_guia}
                    </div>
                  )}
                  
                  <button className="mt-3 text-[#ef4444] text-xs hover:text-white transition">
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}