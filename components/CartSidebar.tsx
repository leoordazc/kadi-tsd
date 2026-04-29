"use client";

import { useState } from "react";
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
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  totalPrice,
  user,
}: CartSidebarProps) {
  const [paymentMethod, setPaymentMethod] = useState("transferencia");
  const [showBankModal, setShowBankModal] = useState(false);
  const [folio, setFolio] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // ============================================
  // FUNCIÓN ÚNICA PARA GUARDAR PEDIDO
  // ============================================
  const guardarPedido = async (metodo: string, folioGenerado: string) => {
    if (cartItems.length === 0) {
      alert('No hay productos en el carrito');
      return false;
    }

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
      folio: folioGenerado,
      metodo_pago: metodo,
      status: 'pendiente_pago',
      created_at: new Date().toISOString()
    };

    console.log('📤 Pedido a guardar:', JSON.stringify(pedido, null, 2));

    try {
      const { error } = await supabase
        .from('pedidos')
        .insert(pedido);

      if (error) {
        console.error('❌ Error detallado:', error);
        alert(`Error al guardar: ${error.message}`);
        return false;
      }

      console.log('✅ Pedido guardado con folio:', folioGenerado);
      return true;
    } catch (err) {
      console.error('❌ Excepción:', err);
      alert('Error inesperado al guardar el pedido');
      return false;
    }
  };

  // ============================================
  // GENERAR FOLIO Y GUARDAR PEDIDO
  // ============================================
  const generarFolioYGuardar = async (metodo: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/folio?tipo=transferencia');
      const data = await res.json();

      if (!data.success) {
        alert('Error al generar el folio');
        return null;
      }

      const folioGenerado = data.folio_completo;
      const guardado = await guardarPedido(metodo, folioGenerado);

      if (guardado) {
        setFolio(folioGenerado);
        return folioGenerado;
      }
      return null;
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pago');
      return null;
    }
  };

  // ============================================
  // MANEJAR PAGO CON TRANSFERENCIA
  // ============================================
  const handleTransferencia = async () => {
    setGuardando(true);
    const folioGenerado = await generarFolioYGuardar('transferencia');
    if (folioGenerado) {
      setShowBankModal(true);
    }
    setGuardando(false);
  };

  // ============================================
  // MANEJAR PAGO CON TARJETA
  // ============================================
  const handleCardPayment = async () => {
    setGuardando(true);

    const folioGenerado = await generarFolioYGuardar('tarjeta');
    if (!folioGenerado) {
      setGuardando(false);
      return;
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
          external_reference: folioGenerado,
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
  // MANEJAR PAGO CON WHATSAPP (con detalles del pedido)
  // ============================================
  const handleWhatsApp = async () => {
    setGuardando(true);

    // Generar resumen de productos para WhatsApp
    const productosResumen = cartItems.map(item => 
      `• ${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toLocaleString()}`
    ).join('%0A');

    const mensaje = encodeURIComponent(
      `Hola, quiero realizar un pedido en KADI TS&D.%0A%0A` +
      `📦 **PRODUCTOS:**%0A${productosResumen}%0A%0A` +
      `💰 **TOTAL:** $${totalPrice.toLocaleString()}%0A%0A` +
      `📋 **DATOS DEL CLIENTE:**%0A` +
      `Nombre: ${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Cliente'}%0A` +
      `Email: ${user?.email || 'No especificado'}%0A%0A` +
      `🔗 Pedido generado desde la web.`
    );

    window.open(`https://wa.me/5573382923?text=${mensaje}`, "_blank");
    setGuardando(false);
    onClose(); // Cerrar carrito después de enviar
  };

  // ============================================
  // CHECKOUT PRINCIPAL
  // ============================================
  const handleCheckout = async () => {
    if (paymentMethod === "transferencia") {
      await handleTransferencia();
    } else if (paymentMethod === "tarjeta") {
      await handleCardPayment();
    } else if (paymentMethod === "whatsapp") {
      await handleWhatsApp();
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] border-l border-white/5 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-light text-white/90">Tu carrito</h2>
              <button onClick={onClose} className="text-white/40 hover:text-white/60">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-white/40 mt-20">
                  <p className="text-6xl mb-4">🛒</p>
                  <p>Tu carrito está vacío</p>
                  <button onClick={onClose} className="mt-4 text-[#ef4444] hover:underline">
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

            {cartItems.length > 0 && (
              <div className="border-t border-white/5 p-6">
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

                <button
                  onClick={handleCheckout}
                  disabled={guardando}
                  className="w-full bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white py-3 rounded-lg font-medium hover:from-[#ef4444]/90 hover:to-[#f97316]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? "Procesando..." : "Proceder al pago"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
      <BankInfoModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        total={totalPrice}
        folio={folio || undefined}
      />
    </AnimatePresence>
  );
}