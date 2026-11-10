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
  onLoginRequired?: () => void;
  onOpenLegal?: () => void;
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
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [showBankModal, setShowBankModal] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  
  // 👇 NUEVO ESTADO PARA EL IVA
  const [requiereFactura, setRequiereFactura] = useState(false);

  // 👇 CÁLCULOS FINANCIEROS (Movidos aquí para que el return los pueda leer)
  const subtotal = totalPrice;
  const costoEnvio = subtotal >= 15000 ? 0 : 450; // $450 promedio del rango
  const iva = requiereFactura ? (subtotal + costoEnvio) * 0.16 : 0;
  const granTotal = subtotal + costoEnvio + iva;

  const crearObtenerPedido = async (): Promise<{ id: string; folio: string } | null> => {
    if (pedidoId && folio) {
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

      const pedido = {
        user_id: user?.id || null,
        user_email: user?.email || 'invitado@kaditsd.com.mx', // 👈 Cambiado para invitados
        total: Number(granTotal), // 👈 Enviamos el Gran Total con IVA y Envío
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
        acepta_terminos: aceptaTerminos,
        created_at: new Date().toISOString()
      };

      const { data: pedidoCreado, error } = await supabase
        .from('pedidos')
        .insert(pedido)
        .select('id, folio')
        .single();

      if (error) {
        alert(`Error al crear pedido: ${error.message}`);
        return null;
      }

      setPedidoId(pedidoCreado.id);
      setFolio(pedidoCreado.folio);

      // Meta Ads Tracking
      try {
        const uniqueEventId = `order_${nuevoFolio}`;
        const customerEmail = user?.email || 'contacto@kaditsd.com.mx';
        const customerPhone = user?.user_metadata?.phone || '5500000000';

        await fetch('/api/fb-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: 'Purchase',
            eventId: uniqueEventId,
            eventSourceUrl: 'https://www.kaditsd.com.mx/checkout',
            eventData: {
              value: Number(granTotal), // 👈 Valor real para Meta
              currency: 'MXN',
              content_ids: cartItems.map(item => item.codigo_caja || item.id),
              content_type: 'product',
              num_items: cartItems.length,
              order_id: nuevoFolio
            },
            userData: {
              email: customerEmail,
              phone: customerPhone,
              external_id: user?.id || null
            }
          })
        });
      } catch (err) {
        console.error('⚠️ Error enviando evento a Meta:', err);
      }
      
      return { id: pedidoCreado.id, folio: pedidoCreado.folio };

    } catch (error) {
      alert('Error al crear el pedido');
      return null;
    }
  };

  const actualizarMetodoPago = async (nuevoMetodo: string) => {
    if (!pedidoId) return false;
    const { error } = await supabase.from('pedidos').update({ metodo_pago: nuevoMetodo }).eq('id', pedidoId);
    return !error;
  };

  const handleTransferencia = async () => {
    setGuardando(true);
    const pedido = await crearObtenerPedido();
    if (!pedido) { setGuardando(false); return; }
    if (paymentMethod !== 'transferencia') await actualizarMetodoPago('transferencia');
    setShowBankModal(true);
    setGuardando(false);
  };

  const handleCardPayment = async () => {
    setGuardando(true);
    const pedido = await crearObtenerPedido();
    if (!pedido) { setGuardando(false); return; }
    if (paymentMethod !== 'tarjeta') await actualizarMetodoPago('tarjeta');
    
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
      alert('Error al procesar el pago con tarjeta');
      setGuardando(false);
    }
  };

  const handleWhatsApp = async () => {
    setGuardando(true);
    const pedido = await crearObtenerPedido();
    if (!pedido) { setGuardando(false); return; }
    if (paymentMethod !== 'whatsapp') await actualizarMetodoPago('whatsapp');
    
    const productosResumen = cartItems.map(item => 
      `• ${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toLocaleString()}`
    ).join('%0A');

    const mensaje = encodeURIComponent(
      `Hola, quiero realizar un pedido en KADI TS&D.%0A%0A` +
      `📦 **PRODUCTOS:**%0A${productosResumen}%0A%0A` +
      `💰 **TOTAL:** $${granTotal.toLocaleString()}%0A%0A` +
      `📋 **FOLIO:** ${pedido.folio}%0A%0A` +
      `📋 **DATOS DEL CLIENTE:**%0A` +
      `Nombre: ${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Cliente'}%0A` +
      `Email: ${user?.email || 'No especificado'}`
    );

    window.open(`https://wa.me/5573382923?text=${mensaje}`, "_blank");
    setGuardando(false);
    onClose();
  };

  const handleCheckout = async () => {
    // 👈 QUITAMOS EL BLOQUEO DE LOGIN AQUÍ
    if (!aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    if (paymentMethod === "transferencia") {
      await handleTransferencia();
    } else if (paymentMethod === "tarjeta") {
      await handleCardPayment();
    } else if (paymentMethod === "whatsapp") {
      await handleWhatsApp();
    }
  };

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
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(15, 18, 21, 0.6)" }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/5 shadow-2xl flex flex-col"
            style={{
              background: "linear-gradient(to bottom, var(--bg-card) 0%, var(--bg-card-hover) 100%)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-light text-white/90">Tu carrito</h2>
              <button onClick={handleClose} className="text-white/40 hover:text-white/60">
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-white/40 mt-20">
                  <p className="text-6xl mb-4">🛒</p>
                  <p>Tu carrito está vacío</p>
                  <button 
                    onClick={handleClose} 
                    className="mt-4 hover:underline transition-colors"
                    style={{ color: "var(--kadi-gold)" }}
                  >
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

            {/* SECCIÓN DE PAGO */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/5 p-6">
                
                {/* DESGLOSE FINANCIERO */}
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Envío estimado</span>
                    <span>{costoEnvio === 0 ? "Gratis" : `$${costoEnvio.toLocaleString()}`}</span>
                  </div>
                  {requiereFactura && (
                    <div className="flex justify-between text-white/60">
                      <span>IVA (16%)</span>
                      <span>${iva.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-medium pt-2 border-t border-white/10">
                    <span>Total a pagar</span>
                    <span className="text-xl" style={{ color: "var(--kadi-gold)" }}>${granTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* CHECKBOX DE FACTURA */}
                <div className="mb-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={requiereFactura}
                        onChange={(e) => setRequiereFactura(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md transition-all cursor-pointer"
                        style={{
                          backgroundColor: requiereFactura ? "var(--kadi-gold)" : "transparent",
                          borderColor: requiereFactura ? "var(--kadi-gold)" : "rgba(255,255,255,0.2)",
                        }}
                      />
                      <svg 
                        className="absolute w-3 h-3 text-white left-1 top-1 pointer-events-none transition-opacity"
                        style={{ opacity: requiereFactura ? 1 : 0 }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs text-white/50 leading-relaxed group-hover:text-white/70 transition">
                      Requiero factura fiscal (se sumará el 16% de IVA al total).
                    </span>
                  </label>
                </div>

                {/* MÉTODO DE PAGO */}
                <div className="mb-4">
                  <label className="text-white/40 text-xs block mb-2">Método de pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-white/10 rounded-lg p-2 text-white/80 text-sm focus:outline-none transition"
                    style={{
                      backgroundColor: "rgba(15, 18, 21, 0.6)",
                      borderColor: "rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    <option value="tarjeta">💳 Tarjeta (Mercado Pago)</option>
                    <option value="transferencia">🏦 Transferencia BBVA</option>
                    <option value="whatsapp">📱 Coordinar por WhatsApp</option>
                  </select>
                </div>

                {/* CASILLA DE TÉRMINOS */}
                <div className="mb-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={aceptaTerminos}
                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md transition-all cursor-pointer"
                        style={{
                          backgroundColor: aceptaTerminos ? "var(--kadi-gold)" : "transparent",
                          borderColor: aceptaTerminos ? "var(--kadi-gold)" : "rgba(255,255,255,0.2)",
                        }}
                      />
                      <svg 
                        className="absolute w-3 h-3 text-white left-1 top-1 pointer-events-none transition-opacity"
                        style={{ opacity: aceptaTerminos ? 1 : 0 }}
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
                        className="hover:underline transition-colors"
                        style={{ color: "var(--kadi-gold)" }}
                      >
                        términos y condiciones
                      </button>
                      {" "}del servicio, incluyendo la política de garantía y devoluciones.
                    </span>
                  </label>
                </div>

                {/* BOTÓN DE PAGO */}
                <button
                  onClick={handleCheckout}
                  disabled={guardando || !aceptaTerminos}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    !aceptaTerminos
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'text-white'
                  }`}
                  style={
                    !aceptaTerminos
                      ? {}
                      : {
                          background: "linear-gradient(90deg, var(--kadi-blue), var(--kadi-blue-bright))",
                          boxShadow: "0 8px 20px rgba(30, 74, 140, 0.3)",
                        }
                  }
                >
                  {!aceptaTerminos
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
        total={granTotal}
        folio={folio || undefined}
      />
    </AnimatePresence>
  );
}