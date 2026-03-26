"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

interface ConsultaStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToNIA: (consulta: any) => void;
}

// Lista de piezas comunes
const piezas = [
  "Transmisión completa",
  "Diferencial",
  "Transeje",
  "Molote",
  "Bronces",
  "Baleros",
  "Flecha deslizable",
  "Flecha de mando",
  "Engrane de primera",
  "Engrane de segunda",
  "Engrane de tercera",
  "Engrane de cuarta",
  "Engrane de quinta",
  "Engrane de reversa",
  "Rodamientos",
  "Horquillas",
  "Horquilla de Clutch",
  "Seguros",
  "Collarín hidráulico",
  "Piñón y corona",
  "Satélites",
  "Retén de piñón",
  "Cojinetes",
  "Sincronizador",
];

// Marcas comunes
const marcas = [
  "Toyota", "Nissan", "Ford", "Chevrolet", "Volkswagen", 
  "Honda", "Mazda", "Mitsubishi", "Renault", "Seat",
  "Suzuki", "Hyundai", "Kia", "Dodge", "Mercedes-Benz"
];

// Modelos por marca
const modelosPorMarca: Record<string, string[]> = {
  "Toyota": ["Hilux", "Hiace", "Tacoma", "Corolla"],
  "Nissan": ["NP300", "D21", "D22", "Frontier", "Tsuru", "Sentra", "Versa", "March"],
  "Ford": ["Ranger", "F-150", "F-250", "Focus", "Fiesta", "Escape", "ZF", "F-350"],
  "Chevrolet": ["S10", "S10 Max", "Silverado", "Aveo", "Spark", "Tornado", "Matiz"],
  "Volkswagen": ["Vento", "Gol", "Saveiro", "Amarok", "Jetta A4", "Polo", "Jetta A3", "Lupo"],
  "Honda": ["Civic", "Accord", "Pilot"],
  "Mazda": ["BT-50", "Mazda3", "Mazda6", "MX-5"],
  "Mitsubishi": ["L200", "Montero", "Lancer"],
  "Renault": ["Duster", "Sandero", "Logan", "Kangoo"],
  "Seat": ["Ibiza", "Córdoba", "León", "Altea"]
};

export default function ConsultaStockModal({ isOpen, onClose }: ConsultaStockModalProps) {
  const { addToCart } = useCart();
  const [pieza, setPieza] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [variante, setVariante] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);

  const modelosDisponibles = marca ? modelosPorMarca[marca] || [] : [];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pieza || !marca || !modelo || !anio) return;
    
    setBuscando(true);
    setResultados([]);
    
    // Construir la consulta a Supabase
    let query = supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .gt('stock', 0);
    
    // Filtrar por pieza (búsqueda en nombre o descripción)
    if (pieza) {
      query = query.or(`nombre.ilike.%${pieza}%,descripcion.ilike.%${pieza}%`);
    }
    
    // Filtrar por marca
    if (marca) {
      query = query.contains('marca_vehiculo', [marca.toLowerCase()]);
    }
    
    // Filtrar por modelo
    if (modelo) {
      query = query.contains('modelo_vehiculo', [modelo.toLowerCase()]);
    }
    
    // Filtrar por año
    if (anio) {
      const añoNum = parseInt(anio);
      query = query.lte('año_inicio', añoNum).gte('año_fin', añoNum);
    }
    
    // Filtrar por variante (buscar en descripción)
    if (variante) {
      query = query.ilike('descripcion', `%${variante}%`);
    }
    
    const { data, error } = await query.limit(8);
    
    setBuscando(false);
    if (error) {
      console.error("Error en búsqueda:", error);
    } else {
      setResultados(data || []);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-hidden bg-black rounded-2xl border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black border-b border-white/10 px-6 py-5">
              <h2 className="text-2xl font-light text-white/90 mb-1">📦 Consultar Stock Técnico</h2>
              <p className="text-white/40 text-sm">Completa los datos para encontrar tu pieza</p>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 py-5">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Pieza */}
                <div>
                  <label className="text-white/40 text-xs block mb-1">Pieza *</label>
                  <select
                    value={pieza}
                    onChange={(e) => setPieza(e.target.value)}
                    required
                    className="w-full bg-black/80 border border-white/10 rounded-lg p-3 text-white/80 text-sm focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                  >
                    <option value="">Selecciona una pieza</option>
                    {piezas.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Marca */}
                <div>
                  <label className="text-white/40 text-xs block mb-1">Marca *</label>
                  <select
                    value={marca}
                    onChange={(e) => {
                      setMarca(e.target.value);
                      setModelo("");
                    }}
                    required
                    className="w-full bg-black/80 border border-white/10 rounded-lg p-3 text-white/80 text-sm focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                  >
                    <option value="">Selecciona una marca</option>
                    {marcas.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Modelo */}
                <div>
                  <label className="text-white/40 text-xs block mb-1">Modelo *</label>
                  <select
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    required
                    disabled={!marca}
                    className="w-full bg-black/80 border border-white/10 rounded-lg p-3 text-white/80 text-sm focus:outline-none focus:border-[#ef4444]/50 transition-colors disabled:opacity-50"
                  >
                    <option value="">Selecciona un modelo</option>
                    {modelosDisponibles.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Año */}
                <div>
                  <label className="text-white/40 text-xs block mb-1">Año *</label>
                  <input
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    placeholder="Ej: 2015"
                    required
                    className="w-full bg-black/80 border border-white/10 rounded-lg p-3 text-white/80 text-sm placeholder-white/30 focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                  />
                </div>

                {/* Variante */}
                <div>
                  <label className="text-white/40 text-xs block mb-1">Variante (opcional)</label>
                  <input
                    type="text"
                    value={variante}
                    onChange={(e) => setVariante(e.target.value)}
                    placeholder="Ej: 4x4, Diesel, Gasolina, 2.7L"
                    className="w-full bg-black/80 border border-white/10 rounded-lg p-3 text-white/80 text-sm placeholder-white/30 focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                  />
                </div>

                {/* Botón de búsqueda */}
                <button
                  type="submit"
                  disabled={buscando}
                  className="w-full bg-[#ef4444] text-white py-3 rounded-lg hover:bg-[#ef4444]/90 transition disabled:opacity-50"
                >
                  {buscando ? "Buscando..." : "Buscar pieza"}
                </button>
              </form>

              {/* Resultados */}
              {buscando && (
                <div className="mt-6 text-center py-8">
                  <div className="inline-block w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                  <p className="text-white/40 text-sm mt-2">Buscando en inventario...</p>
                </div>
              )}

              {resultados.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-white/50 text-sm mb-4">Resultados encontrados ({resultados.length})</h3>
                  <div className="space-y-4">
                    {resultados.map((producto) => (
                      <div
                        key={producto.id}
                        className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border border-white/5 p-4 hover:border-[#ef4444]/30 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white/90 font-medium">{producto.nombre}</h4>
                            <p className="text-white/30 text-xs">Código: {producto.codigo_caja}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            producto.tipo === 'Reconstruida' ? 'bg-green-500/20 text-green-400' :
                            producto.tipo === 'Nueva' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {producto.tipo}
                          </span>
                        </div>

                        {producto.descripcion && (
                          <p className="text-white/40 text-xs mt-2 line-clamp-2">
                            {producto.descripcion}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <p className="text-white/30 text-[10px]">Precio</p>
                            <p className="text-white/90 text-lg font-light">${producto.precio.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/30 text-[10px]">Stock</p>
                            <p className={`text-sm ${producto.stock > 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {producto.stock} uds
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            addToCart(producto);
                            onClose();
                          }}
                          className="mt-3 w-full bg-[#ef4444] text-white py-2 rounded-lg text-sm hover:bg-[#ef4444]/90 transition"
                        >
                          Agregar al carrito
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!buscando && resultados.length === 0 && (pieza || marca || modelo) && (
                <div className="mt-6 text-center py-8">
                  <p className="text-white/40 text-sm">No encontramos productos con estos criterios</p>
                  <p className="text-white/20 text-xs mt-2">Intenta con otros datos o contacta a NIA directamente</p>
                </div>
              )}

              {/* Botón cancelar */}
              <div className="mt-4">
                <button
                  onClick={onClose}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 text-white/70 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}