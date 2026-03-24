"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import PaymentSection from "@/components/PaymentSection";
import ProductRecommendations from "@/components/ProductRecommendations";
import dynamic from 'next/dynamic';
import NIASearchBar from "@/components/NIA/NIASearchBar";
import Counter from "@/components/Counter";
import ServiceCard from "@/components/ServiceCard";
import RefaccionesSearch from "@/components/RefaccionesSearch";
import TipsKadi from "@/components/TipsKadi";
import LoginModal from "@/components/LoginModal";
import CartSidebar from "@/components/CartSidebar";
import LegalSidebar from "@/components/LegalSidebar";
import { supabase } from "@/lib/supabase";


// Tipos para los mensajes
interface Message {
    role: 'user' | 'assistant';
    content: string;
    products?: any[];
}

const Globe3D = dynamic(() => import('@/components/Globe3D'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-black rounded-xl flex items-center justify-center border border-white/5">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
        <div className="text-white/30 text-sm">Inicializando visualización 3D...</div>
      </div>
    </div>
  )
});

// ===== GENERAR PUNTOS FIJOS PARA EVITAR ERRORES DE HIDRATACIÓN =====
const puntosLuz = [...Array(30)].map(() => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 5,
  opacity: 0.1 + Math.random() * 0.1,
}));

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "NIA interfaz v2.0\nKADI transmission systems\n\nSistema listo. ¿En qué puedo ayudarte?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  // Estados para autenticación
const [user, setUser] = useState<any>(null);


// Efecto para cargar el usuario al montar la página
useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    getUser();

    // Escuchar cambios en la autenticación
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
    });

    return () => {
        listener?.subscription.unsubscribe();
    };
}, []);

  // Estados para modales y funcionalidades
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  // Función para manejar catálogo
  const handleCatalogClick = () => {
    window.location.href = "/catalogo";
  };

  // Función para rastrear paquete
  const handleTrackPackage = () => {
    if (trackingNumber) {
      console.log("Rastreando:", trackingNumber);
      setIsTrackingOpen(false);
      setTrackingNumber("");
    }
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const particulasCaida = [...Array(40)].map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 5 + Math.random() * 10,
    delay: Math.random() * 5,
    tamaño: 1 + Math.random() * 3,
    opacity: 0.3 + Math.random() * 0.4,
    color: Math.random() > 0.5 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(249, 115, 22, 0.6)',
  }));
  // Carrito
const [cartItems, setCartItems] = useState<any[]>([]);

const addToCart = (product: any) => {
  setCartItems((prev) => {
    const exists = prev.find((item) => item.id === product.id);
    if (exists) {
      return prev.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...prev, { ...product, quantity: 1 }];
  });
};

const removeFromCart = (id: string) => {
  setCartItems((prev) => prev.filter((item) => item.id !== id));
};

const updateQuantity = (id: string, quantity: number) => {
  setCartItems((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    )
  );
};

  // Mouse move effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  // Scroll suave del contenedor de mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Para evitar errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      
      if (data.type === 'product_recommendations') {
        setMessages((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: data.message,
            products: data.products
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <main 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden"
    >  
      {/* ===== FONDO NEGRO SÓLIDO (SIN EFECTOS) ===== */}
<div className="fixed inset-0 bg-black pointer-events-none" />

     {/* ===== HEADER GLASSMORPHISM (estilo premium) ===== */}
<header className="sticky top-0 z-50 h-[70px] backdrop-blur-xl bg-black/75 border-b border-white/5">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
    <div className="flex items-center justify-between h-full relative">
      
      {/* ===== LADO IZQUIERDO (utilería) ===== */}
      <div className="flex items-center gap-3">
        {/* Ícono de menú (3 rayas) */}
        <button 
          onClick={() => setIsLegalOpen(true)}
          className="text-white/70 hover:text-[#D4AF37] transition-all duration-300"
          title="Información Legal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        
        {/* Ubicación minimalista */}
        <div className="hidden lg:flex items-center gap-1 text-white/50 text-xs">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Ojo de Agua</span>
        </div>
      </div>

      {/* ===== LOGO CENTRADO ===== */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <motion.img
          src="/logo.png"
          alt="KADI TSyD"
          className="h-12 w-auto cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.location.href = "/"}
        />
      </div>

      {/* ===== LADO DERECHO - 4 BOTONES (compactos) ===== */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Account */}
        {user ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/40 hidden md:block truncate max-w-[80px]">
              {user.email?.split('@')[0]}
            </span>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
              }}
              className="text-white/70 hover:text-[#D4AF37] transition-colors"
              title="Cerrar sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsLoginOpen(true)}
            className="text-white/70 hover:text-[#D4AF37] transition-all duration-300"
            title="Ingresar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>
        )}

        {/* Catálogo */}
        <button 
          onClick={handleCatalogClick}
          className="text-white/70 hover:text-[#D4AF37] transition-all duration-300"
          title="Catálogo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
        </button>

        {/* Seguimiento */}
        <button 
          onClick={() => setIsTrackingOpen(true)}
          className="text-white/70 hover:text-[#D4AF37] transition-all duration-300"
          title="Seguimiento"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>

        {/* Carrito */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative text-white/70 hover:text-[#D4AF37] transition-all duration-300"
          title="Carrito"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full text-[8px] text-white flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)]">
  {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
</span>
        </button>
      </div>
    </div>
  </div>
</header>

      {/* ===== BUSCADOR NIA ===== */}
      <NIASearchBar onSearch={(query) => console.log("Buscando:", query)} />

      {/* ===== HERO: INGENIERÍA QUE MUEVE TU INVERSIÓN ===== */}
<section className="relative z-10 min-h-[80vh] flex items-center overflow-hidden">
  
  {/* Fondo negro sólido */}
  <div className="absolute inset-0 bg-black" />
  
  {/* Luces de acento sutiles (efecto tenue) */}
  <div className="absolute top-20 left-1/4 w-64 h-64 bg-white/3 rounded-full blur-3xl" />
  <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />

  <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      
      {/* COLUMNA IZQUIERDA (TEXTO) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          <span className="text-white">INGENIERÍA QUE</span>
          <br />
          <span className="text-[#ef4444]">MUEVE TU INVERSIÓN</span>
        </h1>

        <p className="text-xl text-white/60 max-w-lg">
          Piezas originales verificadas por técnicos especialistas.
          <span className="block text-white/40 text-lg mt-2">
            Transmisiones manuales y diferenciales con trazabilidad total.
          </span>
        </p>

        {/* Botón CTA con efecto glow */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group px-8 py-4 bg-[#ef4444] text-white font-bold rounded-lg overflow-hidden shadow-lg shadow-[#ef4444]/20"
        >
          <span className="relative z-10">📞 CONSULTAR STOCK TÉCNICO</span>
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ x: "-100%", opacity: 0 }}
            whileHover={{ x: 0, opacity: 0.2 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        {/* BARRA DE CONFIANZA */}
        <div className="pt-8 flex flex-wrap gap-6">
          {[
            { icon: "🛡️", title: "Garantía KADI", desc: "Piezas verificadas" },
            { icon: "📦", title: "Envío Seguro", desc: "Trazabilidad Ojo de Agua" },
            { icon: "⚙️", title: "Soporte Experto", desc: "Asesoría pre-compra" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-white/60 text-xl">{item.icon}</span>
              </div>
              <div>
                <p className="text-white/90 font-medium text-sm">{item.title}</p>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* COLUMNA DERECHA (IMAGEN) */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative flex justify-center items-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full max-w-md"
        >
          <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src="/transmision-hero.png.png" 
              alt="Transmisión manual reconstruida" 
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div
            animate={{ scale: [1, 0.95, 1], opacity: [0.3, 0.2, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-4/5 h-4 bg-black/30 blur-xl rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  </div>
</section>

      {/* ===== SERVICIOS ===== */}
      <section className="relative z-10 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-light text-white/90 mb-2">¿Qué necesitas hoy?</h2>
            <p className="text-white/40 text-sm">Tres formas de mantener tu vehículo en movimiento</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard 
              icon="🔧"
              title="VENTA DE UNIDADES"
              description="Transmisiones y diferenciales listos para instalar. Verificadas en banco de pruebas con garantía de 12 meses."
              cta="VER CATÁLOGO"
              color="#ef4444"
              delay={0.1}
            />
            <ServiceCard 
              icon="⚙️"
              title="REPARACIÓN ESPECIALIZADA"
              description="Reconstrucción mayor con limpieza por ultrasonido, ajuste de tolerancias y reemplazo de componentes críticos."
              cta="COTIZAR REPARACIÓN"
              color="#4ade80"
              delay={0.2}
            />
            <ServiceCard 
              icon="🛡️"
              title="MANTENIMIENTO PREVENTIVO"
              description="Cambio de aceite sintético, inspección de retenes, soportes y juego en flechas. Alarga la vida de tu inversión."
              cta="AGENDAR CITA"
              color="#60a5fa"
              delay={0.3}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/20 text-xs mt-8"
          >
            * Todos los servicios incluyen diagnóstico previo y garantía por escrito
          </motion.p>
        </div>
      </section>

      {/* ===== REFACCIONES ===== */}
      <RefaccionesSearch
    onSearch={(query) => console.log("Buscando refacción:", query)}
    onAddToCart={addToCart}
/>

      {/* ===== AUTORIDAD ===== */}
      <section className="relative z-10 py-24 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        
        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-light text-white/90 mb-4">
              15 años <span className="text-[#4ade80]">liderando</span> la distribución
            </h2>
            <p className="text-xl text-white/40">La confianza de miles de talleres en México</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              { value: 15000, suffix: "+", label: "TRANSMISIONES VENDIDAS", desc: "En los últimos 4 años" },
              { value: 98, suffix: "%", label: "CLIENTES SATISFECHOS", desc: "Encuestas post-venta" },
              { value: 24, suffix: "/7", label: "SOPORTE CON NIA", desc: "Respuesta en menos de 2 minutos" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#4ade80]/30 transition-all duration-500"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
              >
                <div className="text-5xl font-light text-[#4ade80] mb-2">
                  <Counter value={item.value} suffix={item.suffix} />
                </div>
                <div className="text-sm text-white/40 tracking-wider">{item.label}</div>
                <div className="mt-4 text-xs text-white/20">{item.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* CARRUSEL DE MARCAS */}
          <div className="mb-24">
            <h3 className="text-sm text-white/30 mb-8 tracking-widest text-center">MARCAS QUE CONFÍAN EN KADI</h3>
            
            <div className="relative overflow-hidden">
              <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
              <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
              
              <motion.div
                className="flex gap-16 items-center"
                animate={{ x: [0, -1920] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear", repeatType: "loop" }}
              >
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-16 items-center">
                    {["TOYOTA", "NISSAN", "FORD", "CHEVY", "VW", "HONDA", "MAZDA", "HYUNDAI"].map((brand, i) => (
                      <motion.div
                        key={`${setIndex}-${i}`}
                        className="text-2xl font-light text-white/20 hover:text-[#4ade80]/70 transition-colors cursor-default whitespace-nowrap"
                        whileHover={{ scale: 1.1 }}
                      >
                        {brand}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* CÓMO FUNCIONA NIA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Consulta", desc: "Habla con NIA sobre tu vehículo" },
              { step: "02", title: "Recomendación", desc: "IA analiza compatibilidad y stock" },
              { step: "03", title: "Entrega", desc: "Recibe tu transmisión en 24h" }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative border border-white/5 rounded-xl p-6 backdrop-blur-sm bg-white/5"
              >
                <div className="text-6xl font-light text-white/5 mb-4">{step.step}</div>
                <h4 className="text-xl text-white/90 mb-2">{step.title}</h4>
                <p className="text-white/40">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TIPS KADI ===== */}
      <TipsKadi onTipClick={(tip) => console.log("Tip seleccionado:", tip.title)} />

      {/* ===== GLOBO 3D ===== */}
      <section className="relative z-10 py-24 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-light text-white/90 mb-3">
              Red de <span className="text-[#ef4444]">Distribución</span>
            </h2>
            <p className="text-white/40 text-sm tracking-widest">COBERTURA NACIONAL · ENTREGA 24H</p>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#ef4444] to-transparent mx-auto mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative -ml-20 lg:-ml-40"
            >
              <div className="relative overflow-visible">
                <Globe3D />
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none lg:block hidden" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:pl-12 space-y-8"
            >
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-white/30 tracking-wider mb-2">COBERTURA</div>
                  <div className="text-6xl font-light text-[#ef4444]">32</div>
                  <div className="text-lg text-white/40">estados de México</div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-light text-white/90">24h</div>
                    <div className="text-xs text-white/30 tracking-wider">ENTREGA PROMEDIO</div>
                  </div>
                  <div>
                    <div className="text-3xl font-light text-white/90">100%</div>
                    <div className="text-xs text-white/30 tracking-wider">RASTREABLE</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex items-center space-x-1 text-[10px] text-white/20">
                  <span>PEDIDO</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[#ef4444]">●</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span>EMPAQUE</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[#ef4444]">●</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span>ENVÍO</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[#ef4444]">●</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span>ENTREGA</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                {["✅ Envío gratis a todo México", "✅ Seguro incluido contra daños", "✅ Rastreo en tiempo real", "✅ Garantía de satisfacción"].map((beneficio, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center space-x-3 text-sm text-white/40"
                  >
                    <span>{beneficio}</span>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="pt-6"
              >
                <button className="group relative px-8 py-4 bg-transparent border border-[#ef4444]/30 hover:border-[#ef4444]/60 transition-all w-full lg:w-auto">
                  <span className="text-[#ef4444] text-sm tracking-widest group-hover:text-[#ef4444]/90">
                    VER ZONAS DE COBERTURA
                  </span>
                  <div className="absolute inset-0 border border-[#ef4444]/10 group-hover:border-[#ef4444]/30 -top-[2px] -left-[2px] -right-[2px] -bottom-[2px] transition-all" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== PAGOS ===== */}
      <PaymentSection />

      {/* ===== FAQ ===== */}
      <section className="relative z-10 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-light text-white/90 mb-8">Preguntas frecuentes sobre transmisiones</h2>
          
          <div className="grid gap-4">
            {[
              { q: "¿Dónde comprar transmisiones automotrices en CDMX?", a: "KADI TS&D ofrece el mejor catálogo de transmisiones en CDMX. Trabajamos con talleres aliados en toda la ciudad para entrega rápida y segura." },
              { q: "¿Cómo saber si mi transmisión es compatible?", a: "Nuestra IA NIA te ayuda a verificar compatibilidad. Solo necesitas marca, modelo y año de tu vehículo." },
              { q: "¿Qué garantía ofrecen en transmisiones?", a: "Manejamos 24 meses en nuevas, 12 meses en reconstruidas y 3 meses en usadas. Todas con respaldo de taller." },
              { q: "¿Cuánto cuesta reconstruir una transmisión?", a: "Los precios varían según el modelo. Desde $15,000 para transmisiones estándar hasta $25,000 para modelos especializados. Cotiza con NIA." }
            ].map((item, i) => (
              <details key={i} className="group border border-white/5 rounded-lg">
                <summary className="flex items-center justify-between p-4 cursor-pointer">
                  <span className="text-white/70">{item.q}</span>
                  <span className="text-[#4ade80] group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="p-4 pt-0 text-white/40">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-white/90 mb-4">KADI TS&D</h5>
              <p className="text-sm text-white/30">Transmisiones y diferenciales con inteligencia artificial</p>
            </div>
            <div>
              <h5 className="text-white/90 mb-4">Contacto</h5>
              <p className="text-sm text-white/30">hola@kadi.mx</p>
              <p className="text-sm text-white/30">+52 55 1234 5678</p>
            </div>
            <div>
              <h5 className="text-white/90 mb-4">Ubicación</h5>
              <p className="text-sm text-white/30">CDMX · Monterrey · Guadalajara</p>
            </div>
            <div>
              <h5 className="text-white/90 mb-4">Legal</h5>
              <p className="text-sm text-white/30">Términos · Privacidad</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
            © 2026 KADI TRANSMISSION SYSTEMS. TODOS LOS DERECHOS RESERVADOS.
          </div>
        </div>
      </footer>

      {/* ===== MODALES (siempre al final) ===== */}
      <AnimatePresence>
        {isTrackingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsTrackingOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-light mb-4">Rastrear envío</h3>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Número de guía"
                className="w-full bg-black/60 border border-white/10 rounded-lg p-3 mb-4 text-white/90"
              />
              <button
                onClick={handleTrackPackage}
                className="w-full bg-[#ef4444] text-white py-3 rounded-lg hover:bg-[#ef4444]/90"
              >
                Rastrear
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal 
    isOpen={isLoginOpen} 
    onClose={() => setIsLoginOpen(false)} 
    onLoginSuccess={() => {
        // Actualizar el usuario después de login exitoso
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }}
/>
     <CartSidebar
  isOpen={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  cartItems={cartItems}
  updateQuantity={updateQuantity}
  removeFromCart={removeFromCart}
  totalPrice={cartItems.reduce((acc, item) => acc + item.precio * item.quantity, 0)}
/>


      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(74, 222, 128, 0.15);
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(74, 222, 128, 0.25);
        }
      `}</style>
    </main>
  );
}