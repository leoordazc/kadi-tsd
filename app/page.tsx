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
import Link from "next/link";
import Image from "next/image";
import LocationWidget from "@/components/LocationWidget";
import { useCart } from "@/context/CartContext";
import NIAChat from "@/components/NIA/NIAChat";
import AboutModal from "@/components/AboutModal";
import NovedadesKadi from "@/components/NovedadesKadi";
import { useRouter } from "next/navigation";
import ReferenciasCarrusel from "@/components/ReferenciasCarrusel";
import HeroKadiStyle from "@/components/HeroKadiStyle";
import ServiciosCarrusel from "@/components/ServiciosCarrusel";
import PuntosLuz from "@/components/PuntosLuz";   // ← Cuando lo crees, descomenta esta línea

// Tipos para los mensajes
interface Message {
    role: 'user' | 'assistant';
    content: string;
    products?: any[];
}

const Globe3D = dynamic(() => import('@/components/Globe3D'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-[400px] rounded-xl flex items-center justify-center border border-white/5"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--kadi-gold)", borderTopColor: "transparent" }}
        />
        <div className="text-white/30 text-sm">Inicializando visualización 3D...</div>
      </div>
    </div>
  )
});

export default function Home() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, totalPrice } = useCart();

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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const router = useRouter();

  const handleCatalogClick = () => {
    window.location.href = "/catalogo";
  };

  const handleStockConsulta = (consulta: any) => {
    setInput(consulta.textoConsulta);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen text-white relative overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      />

      {/* ===== PARTÍCULAS AISLADAS (no rompen la hidratación) ===== */}
      {/* <PuntosLuz /> */}

      <header
        className="sticky top-0 z-50 h-[56px] backdrop-blur-xl border-b border-white/5"
        style={{ backgroundColor: 'rgba(15, 18, 21, 0.75)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
          <div className="flex items-center justify-between h-full relative">

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsLegalOpen(true)}
                className="text-white/70 hover:text-[#D4AF37] transition-all duration-300"
                title="Información Legal"
              >
                <svg className="w-4 h-4 block sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <span className="hidden sm:block text-white/50 hover:text-white/90 transition-colors duration-300 text-xs font-light tracking-wide uppercase">
                  Legal
                </span>
              </button>

              <LocationWidget />
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Image
                src="/logo.png"
                alt="KADI TSyD"
                width={120}
                height={40}
                priority
                className="h-8 sm:h-10 w-auto cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => window.location.href = "/"}
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-3">

              {user ? (
                <Link
                  href="/perfil"
                  className="text-white/70 hover:text-[#D4AF37] transition-all duration-300"
                  title="Mi perfil"
                >
                  <svg className="w-4 h-4 block sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="hidden sm:block text-white/50 hover:text-white/90 transition-colors duration-300 text-xs font-light tracking-wide uppercase">
                    {user.email?.split('@')[0] || 'Perfil'}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="text-white/70 hover:text-[#D4AF37] transition-all duration-300"
                  title="Ingresar"
                >
                  <svg className="w-4 h-4 block sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="hidden sm:block text-white/50 hover:text-white/90 transition-colors duration-300 text-xs font-light tracking-wide uppercase">
                    Ingresar
                  </span>
                </button>
              )}

              <button
                onClick={handleCatalogClick}
                className="text-white/70 hover:text-[#D4AF37] transition-all duration-300"
                title="Catálogo"
              >
                <svg className="w-4 h-4 block sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
                <span className="hidden sm:block text-white/50 hover:text-white/90 transition-colors duration-300 text-xs font-light tracking-wide uppercase">
                  Catálogo
                </span>
              </button>

              <button
                onClick={() => window.location.href = "/seguimiento"}
                className="text-white/70 hover:text-[#D4AF37] transition-all duration-300"
                title="Seguimiento"
              >
                <svg className="w-4 h-4 block sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:block text-white/50 hover:text-white/90 transition-colors duration-300 text-xs font-light tracking-wide uppercase">
                  Seguimiento
                </span>
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-white/70 hover:text-[#D4AF37] transition-all duration-300"
                title="Carrito"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#ef4444] rounded-full text-[7px] text-white flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                  {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <NIASearchBar onSearch={(query) => console.log("Buscando:", query)} />

      <HeroKadiStyle onConoceKadi={() => setIsAboutOpen(true)} />

      <ServiciosCarrusel />

      <RefaccionesSearch
        onSearch={(query) => console.log("Buscando refacción:", query)}
        onAddToCart={addToCart}
      />

      <NovedadesKadi />

      <ReferenciasCarrusel />

      <section
        className="relative z-10 py-24 border-t border-white/5 overflow-hidden"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-light text-white/90 mb-3">
              Red de <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #1e4a8c, #2a5ca8, #D4AF37)",
                }}
              >
                Distribución
              </span>
            </h2>
            <p className="text-white/40 text-sm tracking-widest">COBERTURA NACIONAL · ENTREGA 2-3 días hábiles</p>
            <div
              className="w-12 h-px mx-auto mt-6"
              style={{
                background: "linear-gradient(to right, transparent, var(--kadi-gold), transparent)",
              }}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative -ml-8 lg:-ml-16"
            >
              <div className="relative overflow-visible">
                <Globe3D />
                <div
                  className="absolute top-0 right-0 w-32 h-full pointer-events-none lg:block hidden"
                  style={{
                    background: "linear-gradient(to left, var(--bg-primary), transparent)",
                  }}
                />
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
                  <div
                    className="text-6xl font-light"
                    style={{ color: "var(--kadi-blue-bright)" }}
                  >
                    32
                  </div>
                  <div className="text-lg text-white/40">estados de México</div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-light text-white/90">24h</div>
                    <div className="text-xs text-white/30 tracking-wider">ENTREGA PROMEDIO EN FLETERA</div>
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
                  <span style={{ color: "var(--kadi-gold)" }}>●</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span>EMPAQUE</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span style={{ color: "var(--kadi-gold)" }}>●</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span>ENVÍO</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span style={{ color: "var(--kadi-gold)" }}>●</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span>ENTREGA</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {[
                  "✅ Envío gratis a todo México",
                  "✅ Seguro incluido contra daños",
                  "✅ Rastreo en tiempo real",
                  "✅ Garantía de satisfacción"
                ].map((beneficio, i) => (
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
                <button
                  className="group relative px-8 py-4 bg-transparent transition-all w-full lg:w-auto"
                  style={{
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.3)";
                  }}
                >
                  <span
                    className="text-sm tracking-widest transition-all"
                    style={{ color: "var(--kadi-gold)" }}
                  >
                    VER ZONAS DE COBERTURA
                  </span>
                  <div
                    className="absolute -top-[2px] -left-[2px] -right-[2px] -bottom-[2px] transition-all pointer-events-none"
                    style={{ border: "1px solid rgba(212, 175, 55, 0.1)" }}
                  />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <PaymentSection />

      {/* ===== FAQ CON H1 Y SCHEMA PARA SEO ===== */}
      <section className="relative z-10 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-light text-white/90 mb-8">
            Preguntas frecuentes sobre transmisiones
          </h2>

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
                  <span className="group-open:rotate-45 transition-transform" style={{ color: "var(--kadi-gold)" }}>+</span>
                </summary>
                <div className="p-4 pt-0 text-white/40">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="relative z-10 border-t border-white/5"
        style={{ backgroundColor: 'rgba(15, 18, 21, 0.4)' }}
      >
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            <div>
              <h5 className="text-white/90 mb-4">KADI TS&D</h5>
              <p className="text-sm text-white/30">Transmisiones manuales y diferenciales</p>
            </div>

            <div>
              <h5 className="text-white/90 mb-4">Contacto</h5>
              <a
                href="mailto:ventas.kaditsd@gmail.com.mx?subject=Contacto desde KADI TS&D"
                className="text-sm text-white/30 hover:text-[#D4AF37] transition-colors duration-300 block mb-2"
              >
                ventas.kaditsd@gmail.com.mx
              </a>
              <a
                href="https://wa.me/5573382923?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20KADI%20TS&D"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/30 hover:text-[#D4AF37] transition-colors duration-300 block"
              >
                +52 55 7338 2923
              </a>

              <div className="flex gap-4 mt-4">
                <a
                  href="https://www.facebook.com/share/1CpLsJJzAs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-[#D4AF37] transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h5 className="text-white/90 mb-4">Ubicación</h5>
              <p className="text-sm text-white/30">CEDIS en Acolman Edo. de México 55870</p>
            </div>

            <div>
              <h5 className="text-white/90 mb-4">Legal</h5>
              <button
                onClick={() => setIsLegalOpen(true)}
                className="text-sm text-white/30 hover:text-[#D4AF37] transition-colors duration-300 block"
              >
                📜 Términos · Privacidad
              </button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
            © 2026 KADI TRANSMISIÓNES MANUALES & DIFERENCIALES. TODOS LOS DERECHOS RESERVADOS.
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isTrackingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(15, 18, 21, 0.8)" }}
            onClick={() => setIsTrackingOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="rounded-2xl border border-white/5 p-8 max-w-md w-full"
              style={{
                background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-light mb-4">Rastrear envío</h3>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Número de guía"
                className="w-full rounded-lg p-3 mb-4 text-white/90 focus:outline-none"
                style={{
                  backgroundColor: "rgba(15, 18, 21, 0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <button
                onClick={handleTrackPackage}
                className="w-full text-white py-3 rounded-lg transition"
                style={{
                  background: "linear-gradient(90deg, var(--kadi-blue), var(--kadi-blue-bright))",
                }}
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
          supabase.auth.getUser().then(({ data }) => setUser(data.user));
        }}
      />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        totalPrice={totalPrice}
        user={user}
        onLoginRequired={() => setIsLoginOpen(true)}
        onOpenLegal={() => setIsLegalOpen(true)}
      />

      <LegalSidebar isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.15);
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.25);
        }
      `}</style>
    </main>
  );
}