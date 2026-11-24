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
  const [requiereFactura, setRequiereFactura] = useState(false);

  // 👇 NUEVOS ESTADOS PARA LOS DATOS DEL COMPRADOR
  const [datosComprador, setDatosComprador] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    cp: "",
  });
  const [erroresForm, setErroresForm] = useState<{ [key: string]: string }>({});

  // Autocompletar si el usuario ya inició sesión
  useEffect(() => {
    if (user) {
      setDatosComprador(prev => ({
        ...prev,
        email: prev.email || user.email || "",
        nombre: prev.nombre || user.user_metadata?.full_name || "",
      }));
    }
  }, [user]);

  // Cálculos de envío e IVA
  const subtotal = totalPrice;
  const cantidadProductos = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const tieneTransmision = cartItems.some(item => item.precio >= 5000);
  
  let costoEnvio = 0;
  if (subtotal >= 15000) {
      costoEnvio = 0;
  } else if (tieneTransmision || subtotal >= 3000 || cantidadProductos >= 3) {
      costoEnvio = 700;
  } else {
      costoEnvio = 300;
  }

  const iva = requiereFactura ? (subtotal + costoEnvio) * 0.16 : 0;
  const granTotal = subtotal + costoEnvio + iva;

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};
    if (!datosComprador.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!datosComprador.email.trim() || !/\S+@\S+\.\S+/.test(datosComprador.email)) nuevosErrores.email = "Correo inválido";
    if (!datosComprador.telefono.trim() || datosComprador.telefono.length < 10) nuevosErrores.telefono = "Teléfono inválido (mín. 10 dígitos)";
    if (!datosComprador.direccion.trim()) nuevosErrores.direccion = "La dirección es obligatoria";
    if (!datosComprador.cp.trim() || datosComprador.cp.length < 5) nuevosErrores.cp = "C.P. inválido";

    setErroresForm(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const crearObtenerPedido = async (): Promise<{ id: string; folio: string } | null> => {
    if (pedidoId && folio) return { id: pedidoId, folio };

    try {
      const res = await fetch('/api/folio?tipo=transferencia');
      const data = await res.json();

      if (!data.success) {
        alert('Error al generar el folio');
        return null;
      }

      const nuevoFolio = data.folio_completo;

      const pedido = {
        // 👇 GUARDAMOS LOS DATOS DEL FORMULARIO
        user_id: user?.id || 'anonymous', 
        user_email: datosComprador.email,
        nombre_cliente: datosComprador.nombre,
        telefono_cliente: datosComprador.telefono,
        direccion_envio: datosComprador.direccion,
        codigo_postal: datosComprador.cp,
        
        total: Number(granTotal),
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
        const customerEmail = datosComprador.email || 'contacto@kaditsd.com.mx';
        const customerPhone = datosComprador.telefono || '5500000000';

        await fetch('/api/fb-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: 'Purchase',
            eventId: uniqueEventId,
            eventSourceUrl: 'https://www.kaditsd.com.mx/checkout',
            eventData: {
              value: Number(granTotal),
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
      console.error("Error al crear pedido:", error);
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
      const itemsParaMP = cartItems.map((item) => ({
        nombre: item.nombre,
        quantity: item.quantity,
        precio: item.precio,
      }));

      if (costoEnvio > 0) itemsParaMP.push({ nombre: "Costo de envío", quantity: 1, precio: costoEnvio });
      if (requiereFactura && iva > 0) itemsParaMP.push({ nombre: "IVA (16%)", quantity: 1, precio: iva });

      const preferenceRes = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsParaMP,
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
      `• ${item.quantity}x ${item.nombre} - $${(item.precio * item.quantity).toLocaleString()}`
    ).join('%0A');

    const mensaje = encodeURIComponent(
      `Hola, quiero realizar un pedido en KADI TS&D.%0A%0A` +
      `📦 **PRODUCTOS:**%0A${productosResumen}%0A%0A` +
      `💰 **TOTAL A PAGAR:** $${granTotal.toLocaleString()}%0A%0A` + 
      `📋 **DATOS DEL CLIENTE:**%0A` +
      `Nombre: ${datosComprador.nombre}%0A` +
      `Email: ${datosComprador.email}%0A` +
      `Teléfono: ${datosComprador.telefono}%0A` +
      `Dirección: ${datosComprador.direccion}, C.P. ${datosComprador.cp}%0A%0A` +
      `📋 **FOLIO:** ${pedido.folio}`
    );

    window.open(`https://wa.me/5573382923?text=${mensaje}`, "_blank");
    setGuardando(false);
    onClose();
  };

  const handleCheckout = async () => {
    if (!aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }
    
    // 👇 VALIDAMOS EL FORMULARIO ANTES DE AVANZAR
    if (!validarFormulario()) {
      alert("Por favor, completa todos los datos de envío correctamente.");
      return;
    }

    if (paymentMethod === "transferencia") await handleTransferencia();
    else if (paymentMethod === "tarjeta") await handleCardPayment();
    else if (paymentMethod === "whatsapp") await handleWhatsApp();
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
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-light text-white/90">Tu carrito</h2>
              <button onClick={handleClose} className="text-white/40 hover:text-white/60">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-white/40 mt-20">
                  <p className="text-6xl mb-4">🛒</p>
                  <p>Tu carrito está vacío</p>
                  <button onClick={handleClose} className="mt-4 hover:underline" style={{ color: "var(--kadi-gold)" }}>Ver catálogo</button>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={`cart-${item.id}-${index}`} className="border-b border-white/10 pb-3">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-white/90 text-sm font-medium">{item.nombre}</h4>
                        <p className="text-white/30 text-xs">${item.precio.toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-xs hover:text-red-300">Eliminar</button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-white/10 rounded-full text-white/60">-</button>
                      <span className="text-white/80 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-white/10 rounded-full text-white/60">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-white/5 p-6">
                
                {/* 👇 NUEVO FORMULARIO DE DATOS DEL COMPRADOR */}
                <div className="mb-6 space-y-3">
                  <h3 className="text-sm font-medium text-white/90 mb-2">Datos de envío</h3>
                  
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre completo *"
                      value={datosComprador.nombre}
                      onChange={(e) => setDatosComprador({ ...datosComprador, nombre: e.target.value })}
                      className="w-full bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)]"
                    />
                    {erroresForm.nombre && <span className="text-red-400 text-[10px]">{erroresForm.nombre}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="email"
                        placeholder="Correo *"
                        value={datosComprador.email}
                        onChange={(e) => setDatosComprador({ ...datosComprador, email: e.target.value })}
                        className="w-full bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)]"
                      />
                      {erroresForm.email && <span className="text-red-400 text-[10px]">{erroresForm.email}</span>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="WhatsApp *"
                        value={datosComprador.telefono}
                        onChange={(e) => setDatosComprador({ ...datosComprador, telefono: e.target.value })}
                        className="w-full bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)]"
                      />
                      {erroresForm.telefono && <span className="text-red-400 text-[10px]">{erroresForm.telefono}</span>}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Dirección completa (Calle, número, colonia, ciudad) *"
                      value={datosComprador.direccion}
                      onChange={(e) => setDatosComprador({ ...datosComprador, direccion: e.target.value })}
                      className="w-full bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)]"
                    />
                    {erroresForm.direccion && <span className="text-red-400 text-[10px]">{erroresForm.direccion}</span>}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Código Postal *"
                      value={datosComprador.cp}
                      onChange={(e) => setDatosComprador({ ...datosComprador, cp: e.target.value })}
                      className="w-full bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)]"
                    />
                    {erroresForm.cp && <span className="text-red-400 text-[10px]">{erroresForm.cp}</span>}
                  </div>
                </div>
                {/* FIN FORMULARIO */}

                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white/60"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-white/60"><span>Envío estimado</span><span>{costoEnvio === 0 ? "Gratis" : `$${costoEnvio.toLocaleString()}`}</span></div>
                  {requiereFactura && <div className="flex justify-between text-white/60"><span>IVA (16%)</span><span>${iva.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-white font-medium pt-2 border-t border-white/10">
                    <span>Total a pagar</span>
                    <span className="text-xl" style={{ color: "var(--kadi-gold)" }}>${granTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input type="checkbox" checked={requiereFactura} onChange={(e) => setRequiereFactura(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md transition-all cursor-pointer" style={{ backgroundColor: requiereFactura ? "var(--kadi-gold)" : "transparent", borderColor: requiereFactura ? "var(--kadi-gold)" : "rgba(255,255,255,0.2)" }} />
                      <svg className="absolute w-3 h-3 text-white left-1 top-1 pointer-events-none transition-opacity" style={{ opacity: requiereFactura ? 1 : 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-xs text-white/50 leading-relaxed group-hover:text-white/70 transition">Requiero factura fiscal (se sumará el 16% de IVA al total).</span>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="text-white/40 text-xs block mb-2">Método de pago</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border border-white/10 rounded-lg p-2 text-white/80 text-sm focus:outline-none transition" style={{ backgroundColor: "rgba(15, 18, 21, 0.6)", borderColor: "rgba(212, 175, 55, 0.2)" }}>
                    <option value="tarjeta">💳 Tarjeta (Mercado Pago)</option>
                    <option value="transferencia">🏦 Transferencia BBVA</option>
                    <option value="whatsapp">📱 Coordinar por WhatsApp</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md transition-all cursor-pointer" style={{ backgroundColor: aceptaTerminos ? "var(--kadi-gold)" : "transparent", borderColor: aceptaTerminos ? "var(--kadi-gold)" : "rgba(255,255,255,0.2)" }} />
                      <svg className="absolute w-3 h-3 text-white left-1 top-1 pointer-events-none transition-opacity" style={{ opacity: aceptaTerminos ? 1 : 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-xs text-white/50 leading-relaxed group-hover:text-white/70 transition">
                      Acepto los <button type="button" onClick={(e) => { e.stopPropagation(); onOpenLegal?.(); }} className="hover:underline transition-colors" style={{ color: "var(--kadi-gold)" }}>términos y condiciones</button> del servicio, incluyendo la política de garantía y devoluciones.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={guardando || !aceptaTerminos}
                  className={`w-full py-3 rounded-lg font-medium transition ${!aceptaTerminos ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'text-white'}`}
                  style={!aceptaTerminos ? {} : { background: "linear-gradient(90deg, var(--kadi-blue), var(--kadi-blue-bright))", boxShadow: "0 8px 20px rgba(30, 74, 140, 0.3)" }}
                >
                  {!aceptaTerminos ? "☑️ Acepta los términos para continuar" : guardando ? "Procesando..." : "Proceder al pago"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
      <BankInfoModal
        isOpen={showBankModal}
        onClose={() => { setShowBankModal(false); setPedidoId(null); setFolio(null); }}
        total={granTotal}
        folio={folio || undefined}
      />
    </AnimatePresence>
  );
}