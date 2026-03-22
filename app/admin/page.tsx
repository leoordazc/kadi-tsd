"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para modales y tooltips
  const [showStockBajoModal, setShowStockBajoModal] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Cálculos para dashboard
  const topProductos = [...productos]
    .sort((a, b) =>
      (b.precio - b.costo_interno) -
      (a.precio - a.costo_interno)
    )
    .slice(0, 5);

  const margenTotal = productos.reduce(
    (acc, p) => acc + ((p.precio - p.costo_interno) * p.stock), 0
  );

  const maxMargen = topProductos.length > 0
    ? Math.max(...topProductos.map(p => p.precio - p.costo_interno))
    : 1;

  const valorInventario = productos.reduce(
    (acc, p) => acc + (p.precio * p.stock), 0
  );

  const stockBajo = productos.filter(p => p.stock <= 2);
  const stockBajoCount = stockBajo.length;

  const mejorProducto = productos.length > 0
    ? productos.reduce((prev, current) =>
        (current.precio - current.costo_interno) >
        (prev.precio - prev.costo_interno)
          ? current
          : prev
      )
    : null;

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_caja?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const preparePage = async () => {
      const sessionActive = await checkSession();
      if (sessionActive) {
        fetchProductos();
      }
    };
    preparePage();
  }, []);

  async function fetchProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProductos(data);
    }
    setLoading(false);
  }

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
      return false;
    } else {
      setSessionChecked(true);
      return true;
    }
  }

  async function actualizarProducto(id: string, campo: string, valor: any) {
    try {
      const { error } = await supabase
        .from("productos")
        .update({ [campo]: valor })
        .eq("id", id);

      if (error) {
        console.error('Error actualizando:', error);
      } else {
        await fetchProductos();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }

  // Manejador para hover en textos largos
  const handleMouseEnter = (e: React.MouseEvent, productName: string) => {
    setHoveredProduct(productName);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredProduct(null);
  };

  if (!sessionChecked) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
          <div className="text-white/30 text-sm">VERIFICANDO ACCESO...</div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
          <div className="text-white/30 text-sm">CARGANDO INVENTARIO...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      
      {/* Fondo tecnológico */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4ade80]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#60a5fa]/5 rounded-full blur-3xl" />
        
        {/* Líneas de circuito */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 L0 0 0 40" stroke="#4ade80" strokeWidth="0.5" fill="none" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Tooltip flotante */}
      <AnimatePresence>
        {hoveredProduct && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed z-50 bg-black/90 backdrop-blur-xl border border-[#4ade80]/30 rounded-lg px-4 py-2 shadow-2xl"
            style={{
              left: tooltipPosition.x + 20,
              top: tooltipPosition.y - 40,
              pointerEvents: 'none'
            }}
          >
            <p className="text-sm text-white/90 whitespace-nowrap">{hoveredProduct}</p>
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-black/90 border-r border-b border-[#4ade80]/30 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Stock Bajo */}
      <AnimatePresence>
        {showStockBajoModal && (
          <>
            {/* Fondo blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStockBajoModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 cursor-pointer"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
            >
              <div className="bg-black/90 backdrop-blur-xl border border-[#4ade80]/30 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-light text-white/90">⚠️ STOCK BAJO</h3>
                  <button
                    onClick={() => setShowStockBajoModal(false)}
                    className="text-white/30 hover:text-white/50"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scroll">
                  {stockBajo.map(p => (
                    <div key={p.id} className="border border-white/5 rounded-lg p-4 bg-white/5">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-white/90">{p.nombre}</h4>
                          <p className="text-sm text-white/30">{p.codigo_caja}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-[#f472b6] font-bold">{p.stock} UNIDADES</div>
                          <div className="text-xs text-white/20">mínimo recomendado: 3</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowStockBajoModal(false)}
                    className="px-4 py-2 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] rounded-lg hover:bg-[#4ade80]/20 transition-colors"
                  >
                    CERRAR
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 border border-[#4ade80]/30 rounded-lg flex items-center justify-center">
                <span className="text-[#4ade80] text-xl">K</span>
              </div>
              <div>
                <h1 className="text-xl font-light tracking-widest text-white/90">
                  ADMIN
                </h1>
                <p className="text-xs text-white/30 tracking-wider">
                  KADI TRANSMISSION SYSTEMS
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse" />
                <span className="text-xs text-white/30">SISTEMA ACTIVO</span>
              </div>
              <div className="text-sm text-white/40">
                {new Date().toLocaleTimeString('es-MX')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
        
        {/* Dashboard de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/5 rounded-lg p-6 backdrop-blur-sm"
          >
            <div className="text-sm text-white/30 mb-2 tracking-wider">MARGEN POTENCIAL</div>
            <div className="text-3xl font-light text-[#4ade80]">
              ${margenTotal.toLocaleString()}
            </div>
            <div className="text-xs text-white/20 mt-2">+12.5% vs mes anterior</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/5 rounded-lg p-6 backdrop-blur-sm"
          >
            <div className="text-sm text-white/30 mb-2 tracking-wider">VALOR INVENTARIO</div>
            <div className="text-3xl font-light text-[#60a5fa]">
              ${valorInventario.toLocaleString()}
            </div>
            <div className="text-xs text-white/20 mt-2">{productos.length} productos</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/5 rounded-lg p-6 backdrop-blur-sm cursor-pointer group"
            onClick={() => setShowStockBajoModal(true)}
            whileHover={{ scale: 1.02, borderColor: '#f472b6' }}
          >
            <div className="text-sm text-white/30 mb-2 tracking-wider flex items-center justify-between">
              <span>STOCK BAJO</span>
              <span className="text-xs text-white/20 group-hover:text-white/50 transition-colors">click para ver →</span>
            </div>
            <div className="text-3xl font-light text-[#f472b6]">
              {stockBajoCount}
            </div>
            <div className="text-xs text-white/20 mt-2">productos por reabastecer</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/5 rounded-lg p-6 backdrop-blur-sm"
          >
            <div className="text-sm text-white/30 mb-2 tracking-wider">MÁS RENTABLE</div>
            <div 
              className="text-xl font-light text-[#c084fc] truncate cursor-help"
              onMouseEnter={(e) => mejorProducto && handleMouseEnter(e, mejorProducto.nombre)}
              onMouseLeave={handleMouseLeave}
            >
              {mejorProducto?.nombre || 'N/A'}
            </div>
            <div className="text-xs text-white/20 mt-2">
              ${mejorProducto ? (mejorProducto.precio - mejorProducto.costo_interno).toLocaleString() : '0'} margen
            </div>
          </motion.div>
        </div>

        {/* Top 5 y búsqueda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top 5 más rentables */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white/5 border border-white/5 rounded-lg p-6 backdrop-blur-sm"
          >
            <h2 className="text-sm text-white/30 mb-4 tracking-wider flex items-center">
              <span className="w-1 h-4 bg-[#4ade80] mr-2" />
              TOP 5 RENTABLES
            </h2>
            
            <div className="space-y-4">
              {topProductos.map((p, index) => {
                const margen = p.precio - p.costo_interno;
                const porcentaje = (margen / maxMargen) * 100;
                
                return (
                  <div key={p.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span 
                        className="text-white/70 truncate max-w-[150px] cursor-help"
                        onMouseEnter={(e) => handleMouseEnter(e, p.nombre)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {index + 1}. {p.nombre}
                      </span>
                      <span className="text-[#4ade80]">${margen.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentaje}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-[#4ade80] to-[#60a5fa]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Búsqueda y acciones rápidas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white/5 border border-white/5 rounded-lg p-6 backdrop-blur-sm"
          >
            <h2 className="text-sm text-white/30 mb-4 tracking-wider flex items-center">
              <span className="w-1 h-4 bg-[#60a5fa] mr-2" />
              GESTIÓN RÁPIDA
            </h2>

            <div className="relative mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto por nombre, código o categoría..."
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white/70 placeholder-white/20 focus:outline-none focus:border-[#4ade80]/50 transition-colors"
              />
              <span className="absolute right-3 top-3 text-white/20">⌘</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="text-xs text-white/30 mb-1">TOTAL PRODUCTOS</div>
                <div className="text-2xl font-light text-white/70">{productos.length}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="text-xs text-white/30 mb-1">PRECIO PROMEDIO</div>
                <div className="text-2xl font-light text-white/70">
                  ${(productos.reduce((acc, p) => acc + p.precio, 0) / productos.length || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lista de productos expandible */}
        <div className="space-y-3">
          <h2 className="text-sm text-white/30 mb-4 tracking-wider flex items-center">
            <span className="w-1 h-4 bg-[#f472b6] mr-2" />
            INVENTARIO COMPLETO ({productosFiltrados.length})
          </h2>

          <AnimatePresence>
            {productosFiltrados.map((item, index) => {
              const margen = item.precio - item.costo_interno;
              const isExpanded = expandedId === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/5 rounded-lg overflow-hidden backdrop-blur-sm"
                >
                  {/* Cabecera del producto */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-4 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${item.stock > 0 ? 'bg-[#4ade80]' : 'bg-red-500'}`} />
                        <div>
                          <h3 
                            className="font-medium text-white/90 cursor-help"
                            onMouseEnter={(e) => handleMouseEnter(e, item.nombre)}
                            onMouseLeave={handleMouseLeave}
                          >
                            {item.nombre}
                          </h3>
                          <div className="flex items-center space-x-3 text-xs text-white/30">
                            <span>{item.codigo_caja}</span>
                            <span>•</span>
                            <span>Stock: {item.stock}</span>
                            <span>•</span>
                            <span>${item.precio.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`text-sm ${margen > 0 ? 'text-[#4ade80]' : 'text-red-500'}`}>
                          ${margen.toLocaleString()}
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          className="text-white/30"
                        >
                          ▼
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/5"
                      >
                        <div className="p-4 space-y-4">
                          {/* Grid de campos básicos */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-xs text-white/30 block mb-1">PRECIO</label>
                              <input
                                type="number"
                                value={item.precio}
                                onChange={(e) => actualizarProducto(item.id, "precio", Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white/70"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/30 block mb-1">COSTO</label>
                              <input
                                type="number"
                                value={item.costo_interno}
                                onChange={(e) => actualizarProducto(item.id, "costo_interno", Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white/70"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/30 block mb-1">STOCK</label>
                              <input
                                type="number"
                                value={item.stock}
                                onChange={(e) => actualizarProducto(item.id, "stock", Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white/70"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/30 block mb-1">TIPO</label>
                              <select
                                value={item.tipo}
                                onChange={(e) => actualizarProducto(item.id, "tipo", e.target.value)}
                                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white/70"
                              >
                                <option value="Reconstruida">Reconstruida</option>
                                <option value="Usada">Usada</option>
                                <option value="Nueva">Nueva</option>
                              </select>
                            </div>
                          </div>

                          {/* Checkboxes */}
                          <div className="flex space-x-6">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={item.activo}
                                onChange={(e) => actualizarProducto(item.id, "activo", e.target.checked)}
                                className="w-4 h-4 bg-black border border-white/10 rounded"
                              />
                              <span className="text-sm text-white/50">Activo</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={item.envio_24h}
                                onChange={(e) => actualizarProducto(item.id, "envio_24h", e.target.checked)}
                                className="w-4 h-4 bg-black border border-white/10 rounded"
                              />
                              <span className="text-sm text-white/50">Envío 24h</span>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(74, 222, 128, 0.2);
          border-radius: 2px;
        }
      `}</style>
    </main>
  );
}