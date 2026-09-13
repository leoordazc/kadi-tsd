"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BankInfoModal from "./BankInfoModal";
import { supabase } from "@/lib/supabase";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  totalPrice: number;
  user?: any;
  onLoginRequired?: () => void; // Abre login desde el carrito
  onOpenLegal?: () => void;     // Abre el modal legal (términos y condiciones)
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  totalPrice,
  user,
  onLoginRequired,
  onOpenLegal,
}: CartSidebarProps) {
  const [paymentMethod, setPaymentMethod] = useState("transferencia");
  const [showBankModal, setShowBankModal] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // ============================================
  // CREAR O OBTENER EL PEDIDO (SOLO UNA VEZ)
  // ============================================
  const crearObtenerPedido = async (): Promise<{ id: string; folio: string } | null> => {
    if (pedidoId && folio) {
      console.log('📦 Usando pedido existente:', { id: pedidoId, folio });
      return { id: pedidoId, folio };
    }

    try {
      const res = await fetch('/api/folio?tipo=transferencia');
      const data = await res.json();

      if (!data.success) {
        alert('Error al generar el folio');
        return null;
      }

      const nuevoFolio = data.folio_completo;
      console.log('📝 Nuevo folio generado:', nuevoFolio);

      const pedido = {
        user_id: user?.id || null,
        user_email: user?.email || 'anonimo',
        total: Number(totalPrice),
        items: cartItems.map(item => ({
          id: item.id,
          nombre: item.nombre,
          codigo_caja: item.codigo_caja || '',
          cantidad: Number(item.quantity),
          precio: Number(item.precio),
          tipo: item.tipo || 'N/A'
        })),
        folio: nuevoFolio,
        metodo_pago: paymentMethod,
        status: 'pendiente_pago',
        acepta_terminos: aceptaTerminos, // 👈 Guardamos la aceptación
        created_at: new Date().toISOString()
      };

      const { data: pedidoCreado, error } = await supabase
        .from('pedidos')
        .insert(pedido)
        .select('id, folio')
        .single();

      if (error) {
        console.error('❌ Error al crear pedido:', error);
        alert(`Error al crear pedido: ${error.message}`);
        return null;
      }

      setPedidoId(pedidoCreado.id);
      setFolio(pedidoCreado.folio);
      console.log('✅ Pedido creado:', pedidoCreado);
      
      return { id: pedidoCreado.id, folio: pedidoCreado.folio };

    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al crear el pedido');
      return null;
    }
  };

  // ============================================
  // ACTUALIZAR MÉTODO DE PAGO DEL PEDIDO
  // ============================================
  const actualizarMetodoPago = async (nuevoMetodo: string) => {
    if (!pedidoId) return false;

    const { error } = await supabase
      .from('pedidos')
      .update({ metodo_pago: nuevoMetodo })
      .eq('id', pedidoId);

    if (error) {
      console.error('❌ Error al actualizar método de pago:', error);
      return false;
    }
    
    console.log(`✅ Método de pago actualizado a: ${nuevoMetodo}`);
    return true;
  };

  // ============================================
  // MANEJAR PAGO CON TRANSFERENCIA
  // ============================================
  const handleTransferencia = async () => {
    setGuardando(true);
    
    const pedido = await crearObtenerPedido();
    if (!pedido) {
      setGuardando(false);
      return;
    }
    
    if (paymentMethod !== 'transferencia') {
      await actualizarMetodoPago('transferencia');
    }
    
    setShowBankModal(true);
    setGuardando(false);
  };

  // ============================================
  // MANEJAR PAGO CON TARJETA
  // ============================================
  const handleCardPayment = async () => {
    setGuardando(true);
    
    const pedido = await crearObtenerPedido();
    if (!pedido) {
      setGuardando(false);
      return;
    }
    
    if (paymentMethod !== 'tarjeta') {
      await actualizarMetodoPago('tarjeta');
    }
    
    try {
      const preferenceRes = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            nombre: item.nombre,
            quantity: item.quantity,
            precio: item.precio,
          })),
          external_reference: pedido.folio,
        }),
      });

      const preferenceData = await preferenceRes.json();

      if (preferenceData.error) {
        alert('Error al crear la preferencia de pago');
        setGuardando(false);
        return;
      }

      window.location.href = preferenceData.init_point;
    } catch (error) {
      console.error('Error en Mercado Pago:', error);
      alert('Error al procesar el pago con tarjeta');
      setGuardando(false);
    }
  };

  // ============================================
  // MANEJAR WHATSAPP
  // ============================================
  const handleWhatsApp = async () => {
    setGuardando(true);
    
    const pedido = await crearObtenerPedido();
    if (!pedido) {
      setGuardando(false);
      return;
    }
    
    if (paymentMethod !== 'whatsapp') {
      await actualizarMetodoPago('whatsapp');
    }
    
    const productosResumen = cartItems.map(item => 
      `• ${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toLocaleString()}`
    ).join('%0A');

    const mensaje = encodeURIComponent(
      `Hola, quiero realizar un pedido en KADI TS&D.%0A%0A` +
      `📦 **PRODUCTOS:**%0A${productosResumen}%0A%0A` +
      `💰 **TOTAL:** $${totalPrice.toLocaleString()}%0A%0A` +
      `📋 **FOLIO:** ${pedido.folio}%0A%0A` +
      `📋 **DATOS DEL CLIENTE:**%0A` +
      `Nombre: ${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Cliente'}%0A` +
      `Email: ${user?.email || 'No especificado'}`
    );

    window.open(`https://wa.me/5573382923?text=${mensaje}`, "_blank");
    setGuardando(false);
    onClose();
  };

  // ============================================
  // CHECKOUT PRINCIPAL
  // ============================================
  const handleCheckout = async () => {
    // 1. Verificar login
    if (!user) {
      onClose();
      onLoginRequired?.();
      return;
    }

    // 2. Verificar aceptación de términos
    if (!aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    // 3. Continuar con el pago
    if (paymentMethod === "transferencia") {
      await handleTransferencia();
    } else if (paymentMethod === "tarjeta") {
      await handleCardPayment();
    } else if (paymentMethod === "whatsapp") {
      await handleWhatsApp();
    }
  };

  // Limpiar estado cuando se cierra el carrito
  const handleClose = () => {
    setPedidoId(null);
    setFolio(null);
    setShowBankModal(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] border-l border-white/5 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-light text-white/90">Tu carrito</h2>
              <button onClick={handleClose} className="text-white/40 hover:text-white/60">
                ✕
              </button>
            </div>

            {/* Contenido (lista de productos) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-white/40 mt-20">
                  <p className="text-6xl mb-4">🛒</p>
                  <p>Tu carrito está vacío</p>
                  <button onClick={handleClose} className="mt-4 text-[#ef4444] hover:underline">
                    Ver catálogo
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={`cart-${item.id}-${index}`} className="border-b border-white/10 pb-3">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-white/90 text-sm font-medium">{item.nombre}</h4>
                        <p className="text-white/30 text-xs">${item.precio.toLocaleString()}</p>
                        {item.codigo_caja && (
                          <p className="text-white/20 text-[10px]">Código: {item.codigo_caja}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-white/10 rounded-full text-white/60"
                      >
                        -
                      </button>
                      <span className="text-white/80 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-white/10 rounded-full text-white/60"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ===== SECCIÓN DE PAGO ===== */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/5 p-6">
                {/* Banner de registro (solo si no hay usuario) */}
                {!user && (
                  <div className="mb-3 p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-[#ef4444] text-sm">🔒</span>
                      <div>
                        <p className="text-white/70 text-xs font-medium">
                          Regístrate o inicia sesión para comprar
                        </p>
                        <button
                          onClick={() => {
                            onClose();
                            onLoginRequired?.();
                          }}
                          className="text-[#ef4444] text-xs hover:underline"
                        >
                          Crear cuenta →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mb-4">
                  <span className="text-white/40">Total:</span>
                  <span className="text-xl text-white/90">${totalPrice.toLocaleString()}</span>
                </div>

                <div className="mb-4">
                  <label className="text-white/40 text-xs block mb-2">Método de pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white/80 text-sm"
                  >
                    <option value="transferencia">🏦 Transferencia BBVA</option>
                    <option value="tarjeta">💳 Tarjeta de crédito/débito</option>
                    <option value="whatsapp">📱 Coordinar por WhatsApp</option>
                  </select>
                </div>

                {/* ===== CASILLA DE TÉRMINOS Y CONDICIONES ===== */}
                <div className="mb-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={aceptaTerminos}
                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-[#ef4444] checked:border-[#ef4444] transition-all cursor-pointer"
                      />
                      <svg 
                        className="absolute w-3 h-3 text-white left-1 top-1 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs text-white/50 leading-relaxed group-hover:text-white/70 transition">
                      Acepto los{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLegal?.();
                        }}
                        className="text-[#ef4444] hover:text-[#f97316] underline transition-colors"
                      >
                        términos y condiciones
                      </button>
                      {" "}del servicio, incluyendo la política de garantía y devoluciones.
                    </span>
                  </label>
                </div>

                {/* ===== BOTÓN DE PAGO ===== */}
                <button
                  onClick={handleCheckout}
                  disabled={guardando || !user || !aceptaTerminos}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    !user || !aceptaTerminos
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white hover:from-[#ef4444]/90 hover:to-[#f97316]/90'
                  }`}
                >
                  {!user
                    ? "🔒 Inicia sesión para comprar"
                    : !aceptaTerminos
                      ? "☑️ Acepta los términos para continuar"
                      : guardando
                        ? "Procesando..."
                        : "Proceder al pago"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
      <BankInfoModal
        isOpen={showBankModal}
        onClose={() => {
          setShowBankModal(false);
          setPedidoId(null);
          setFolio(null);
        }}
        total={totalPrice}
        folio={folio || undefined}
      />
    </AnimatePresence>
  );
}