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
  user?: any; // Agregar usuario para asociar el pedido
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

  const handleCardPayment = async () => {
  setGuardando(true);
  
  // 1. Generar folio
  const res = await fetch('/api/folio?tipo=transferencia');
  const data = await res.json();
  
  if (!data.success) {
    alert('Error al generar el folio');
    setGuardando(false);
    return;
  }
  
  // 2. Guardar pedido en Supabase
  const pedido = {
    user_id: user?.id || null,
    user_email: user?.email || 'anonimo',
    total: totalPrice,
    items: cartItems.map(item => ({
      id: item.id,
      nombre: item.nombre,
      codigo_caja: item.codigo_caja,
      cantidad: item.quantity,
      precio: item.precio,
      tipo: item.tipo
    })),
    folio: data.folio_completo,
    metodo_pago: 'tarjeta',
    status: 'pendiente_pago',
    created_at: new Date().toISOString()
  };

  const { error } = await supabase.from('pedidos').insert(pedido);
  
  if (error) {
    console.error('Error guardando pedido:', error);
    alert('Error al guardar el pedido');
    setGuardando(false);
    return;
  }
  
  // 3. Redirigir a Mercado Pago
  const preferenceRes = await fetch("/api/create-preference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: cartItems.map((item) => ({
        nombre: item.nombre,
        quantity: item.quantity,
        precio: item.precio,
      })),
      external_reference: data.folio_completo, // 👈 Enviar folio a Mercado Pago
    }),
  });
  
  const preferenceData = await preferenceRes.json();
  window.location.href = preferenceData.init_point;
};

  // Función para guardar el pedido en Supabase
  const guardarPedido = async (folioGenerado: string) => {
    const pedido = {
      user_id: user?.id || null,
      user_email: user?.email || 'anonimo',
      total: totalPrice,
      items: cartItems.map(item => ({
        id: item.id,
        nombre: item.nombre,
        codigo_caja: item.codigo_caja,
        cantidad: item.quantity,
        precio: item.precio,
        tipo: item.tipo
      })),
      folio: folioGenerado,
      metodo_pago: paymentMethod,
      status: 'pendiente_pago',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('pedidos')
      .insert(pedido);

    if (error) {
      console.error('Error guardando pedido:', error);
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (paymentMethod === "transferencia") {
      setGuardando(true);
      
      // 1. Generar folio
      const res = await fetch('/api/folio?tipo=transferencia');
      const data = await res.json();
      
      if (data.success) {
        setFolio(data.folio_completo);
        
        // 2. Guardar pedido en Supabase
        const guardado = await guardarPedido(data.folio_completo);
        
        if (guardado) {
          // 3. Mostrar modal con el folio
          setShowBankModal(true);
        } else {
          alert('Error al guardar el pedido. Por favor intenta de nuevo.');
        }
      } else {
        alert('Error al generar el folio. Por favor intenta de nuevo.');
      }
      
      setGuardando(false);
    } else if (paymentMethod === "tarjeta") {
      handleCardPayment();
    } else if (paymentMethod === "whatsapp") {
      const message = encodeURIComponent(
        `Hola, quiero pagar mi pedido de KADI. Total: $${totalPrice.toLocaleString()}`
      );
      window.open(`https://wa.me/5573382923?text=${message}`, "_blank");
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
                    <option value="transferencia">Pago en BBVA (transferencia / depósito)</option>
                    <option value="tarjeta">Tarjeta de crédito/débito</option>
                    <option value="whatsapp">Coordinar por WhatsApp</option>
                  </select>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={guardando}
                  className="w-full bg-[#ef4444] text-white py-3 rounded-lg hover:bg-[#ef4444]/90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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