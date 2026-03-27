"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BankInfoModal from "./BankInfoModal";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  totalPrice: number;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  totalPrice,
}: CartSidebarProps) {
  const [paymentMethod, setPaymentMethod] = useState("transferencia");
  const [showBankModal, setShowBankModal] = useState(false);

  const handleCardPayment = async () => {
    const res = await fetch("/api/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems.map((item) => ({
          nombre: item.nombre,
          quantity: item.quantity,
          precio: item.precio,
        })),
      }),
    });
    const data = await res.json();
    window.location.href = data.init_point;
  };

  const handleCheckout = () => {
    if (paymentMethod === "transferencia") {
      setShowBankModal(true);
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

                {paymentMethod === "transferencia" && (
                  <div className="mt-2 p-3 bg-black/40 border border-white/10 rounded-lg text-xs text-white/60">
                    🏦 <strong>BBVA</strong><br />
                    Cuenta: 1234 5678 9012<br />
                    CLABE: 0123 4567 8901 2345 67<br />
                    Referencia: <strong>KADI-{Date.now()}</strong><br />
                    Envía tu comprobante a hola@kadi.mx para confirmar tu pedido.
                  </div>
                )}

                {paymentMethod === "tarjeta" && (
                  <div className="mt-2 p-3 bg-black/40 border border-white/10 rounded-lg text-xs text-white/60">
                    💳 <strong>Pago con tarjeta</strong><br />
                    Serás redirigido a Mercado Pago para completar el pago de forma segura.
                  </div>
                )}

                {paymentMethod === "whatsapp" && (
                  <div className="mt-2 p-3 bg-black/40 border border-white/10 rounded-lg text-xs text-white/60">
                    📱 <strong>Coordinar por WhatsApp</strong><br />
                    Te contactaremos para acordar el método de pago y envío.
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#ef4444] text-white py-3 rounded-lg hover:bg-[#ef4444]/90 transition mt-4"
                >
                  Proceder al pago
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
      />
    </AnimatePresence>
  );
}