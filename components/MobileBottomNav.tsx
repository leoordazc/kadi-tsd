"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

interface MobileBottomNavProps {
  onOpenCart: () => void;
  onOpenNia: () => void;
  onOpenLogin: () => void;
}

export default function MobileBottomNav({ onOpenCart, onOpenNia, onOpenLogin }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const [user, setUser] = useState<any>(null);

  // Estados para la animación de NIA
  const [niaView, setNiaView] = useState<"icon" | "text">("icon");
  const [reduceMotion, setReduceMotion] = useState(false);

  // Verificar sesión del usuario
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Verificar preferencia de movimiento reducido
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Lógica del ciclo de animación de NIA (10s total)
  useEffect(() => {
    if (reduceMotion) return;

    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;

    const runCycle = () => {
      // 1. A los 6 segundos, cambia a texto
      timeout1 = setTimeout(() => {
        setNiaView("text");

        // 2. A los 3 segundos de mostrar el texto (segundo 9), vuelve al icono
        timeout2 = setTimeout(() => {
          setNiaView("icon");
        }, 3000);
      }, 6000);
    };

    runCycle(); // Iniciar ciclo
    const interval = setInterval(runCycle, 10000); // Repetir cada 10s

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearInterval(interval);
    };
  }, [reduceMotion]);

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Helper para el estado activo
  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t backdrop-blur-xl flex items-center justify-around pb-[env(safe-area-inset-bottom)]"
      style={{
        backgroundColor: "rgba(15, 18, 21, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        height: "calc(65px + env(safe-area-inset-bottom))",
      }}
    >
      {/* 1. NIA (Animado) */}
      <button
        onClick={onOpenNia}
        className="flex flex-col items-center justify-center w-full h-full space-y-1 touch-manipulation"
        aria-label="Abrir chat de NIA"
      >
        <div className="relative flex items-center justify-center w-7 h-7">
          <AnimatePresence mode="wait">
            {niaView === "icon" ? (
              <motion.div
                key="icon"
                initial={reduceMotion ? false : { rotate: -180, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={reduceMotion ? {} : { rotate: 180, scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="text-[var(--kadi-gold)]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M12 7v6"></path>
                  <path d="M9 10h6"></path>
                </svg>
              </motion.div>
            ) : (
              <motion.span
                key="text"
                initial={reduceMotion ? false : { rotate: -180, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={reduceMotion ? {} : { rotate: 180, scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="text-sm font-bold text-[var(--kadi-gold)] tracking-wider"
              >
                NIA
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className="text-[10px] font-medium text-white/50">NIA</span>
      </button>

      {/* 2. Ingresar / Mi Cuenta */}
      {user ? (
        <Link
          href="/perfil"
          className="flex flex-col items-center justify-center w-full h-full space-y-1 touch-manipulation"
          aria-label="Mi cuenta"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive("/perfil") ? "text-[var(--kadi-gold)]" : "text-white/50"}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className={`text-[10px] font-medium ${isActive("/perfil") ? "text-[var(--kadi-gold)]" : "text-white/50"}`}>Mi cuenta</span>
        </Link>
      ) : (
        <button
          onClick={onOpenLogin}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 touch-manipulation"
          aria-label="Ingresar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span className="text-[10px] font-medium text-white/50">Ingresar</span>
        </button>
      )}

      {/* 3. Catálogo */}
      <Link
        href="/catalogo"
        className="flex flex-col items-center justify-center w-full h-full space-y-1 touch-manipulation"
        aria-label="Catálogo"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive("/catalogo") ? "text-[var(--kadi-gold)]" : "text-white/50"}>
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span className={`text-[10px] font-medium ${isActive("/catalogo") ? "text-[var(--kadi-gold)]" : "text-white/50"}`}>Catálogo</span>
      </Link>

      {/* 4. Seguimiento */}
      <Link
        href="/seguimiento"
        className="flex flex-col items-center justify-center w-full h-full space-y-1 touch-manipulation"
        aria-label="Seguimiento"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive("/seguimiento") ? "text-[var(--kadi-gold)]" : "text-white/50"}>
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
        <span className={`text-[10px] font-medium ${isActive("/seguimiento") ? "text-[var(--kadi-gold)]" : "text-white/50"}`}>Seguimiento</span>
      </Link>

      {/* 5. Carrito */}
      <button
        onClick={onOpenCart}
        className="flex flex-col items-center justify-center w-full h-full space-y-1 touch-manipulation relative"
        aria-label="Abrir carrito"
      >
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#ef4444] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#0f1215]">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium text-white/50">Carrito</span>
      </button>
    </nav>
  );
}