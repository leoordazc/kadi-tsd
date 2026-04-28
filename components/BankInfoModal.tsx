"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface BankInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export default function BankInfoModal({ isOpen, onClose, total }: BankInfoModalProps) {
  const clabe = "012 180 01524771608 9";
  const cuenta = "152 477 1608";
  const [referencia, setReferencia] = useState<string>("");
  const [folioCompleto, setFolioCompleto] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const telefono = "5573382923";

  // Generar folio al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setCargando(true);
      fetch('/api/folio?tipo=transferencia')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const folioNum = data.folio.toString().padStart(5, '0');
            setReferencia(`KADI-${folioNum}`);
            setFolioCompleto(`KADI-${folioNum}`);
          } else {
            // Fallback: usar timestamp
            setReferencia(`KADI-${Date.now()}`);
            setFolioCompleto(`KADI-${Date.now()}`);
          }
        })
        .catch(() => {
          setReferencia(`KADI-${Date.now()}`);
          setFolioCompleto(`KADI-${Date.now()}`);
        })
        .finally(() => setCargando(false));
    }
  }, [isOpen]);

  const mensajeWhatsApp = encodeURIComponent(
    `Hola, ya realicé el pago por transferencia para mi pedido de KADI.\n\nFolio: ${folioCompleto}\nTotal: $${total.toLocaleString()}\n\nAdjunto el comprobante. Mi nombre y pieza adquirida son:`
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Datos copiados al portapapeles");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-light mb-4">💸 Transferencia BBVA</h3>
        
        {cargando ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-white/40">Beneficiario:</span>
                <span className="text-white/80">Leonardo Farid O. C.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Cuenta:</span>
                <span className="text-white/80 font-mono">{cuenta}</span>
                <button onClick={() => copyToClipboard(cuenta)} className="text-[#ef4444] text-xs">Copiar</button>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">CLABE:</span>
                <span className="text-white/80 font-mono">{clabe}</span>
                <button onClick={() => copyToClipboard(clabe)} className="text-[#ef4444] text-xs">Opción</button>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Folio:</span>
                <span className="text-white/80 font-mono font-bold text-[#ef4444]">{folioCompleto}</span>
                <button onClick={() => copyToClipboard(folioCompleto)} className="text-[#ef4444] text-xs">Copiar</button>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 mt-2">
                <span className="text-white/40">Total a pagar:</span>
                <span className="text-white/90 font-bold">${total.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-white/30 mt-4">
              Realiza la transferencia y envía el comprobante con tu <strong>Folio: {folioCompleto}</strong>, nombre y pieza adquirida.
            </p>

            {/* Botones de envío */}
            <div className="flex flex-col gap-3 mt-4">
              <a
                href={`mailto:ventas.kaditsd@gmail.com.mx?subject=Pago KADI - Folio ${folioCompleto}&body=Adjunto%20mi%20comprobante%20de%20pago.%0A%0AFolio:%20${folioCompleto}%0ATotal:%20$${total.toLocaleString()}%0A%0AMi%20nombre:%20%0APieza%20adquirida:%20`}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>Enviar por Gmail</span>
              </a>

              <a
                href={`https://wa.me/${telefono}?text=${mensajeWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.18-2.585-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.17-.252-.145-.588-.33-.847-.524-.971-.73-1.527-1.308-2.017-2.122-.122-.202-.182-.434-.182-.666 0-.233.08-.433.222-.576.113-.113.252-.15.385-.15.074 0 .143.006.208.018.107.019.215.07.307.158.266.256.624.689.847 1.044.091.144.054.306-.016.423-.093.156-.169.267-.264.424-.059.098-.133.177-.2.27-.089.125-.068.2.024.354.273.446.714.948 1.166 1.255.143.098.245.148.393.172.147.024.271-.019.369-.09.151-.111.34-.398.436-.539.096-.142.202-.141.35-.085.475.174.858.382 1.074.551.12.094.193.188.232.286.039.099.023.198-.018.285z"/>
                </svg>
                <span>Enviar por WhatsApp</span>
              </a>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full bg-white/10 text-white/70 py-2 rounded-lg mt-4 hover:bg-white/20 transition"
        >
          Cerrar
        </button>
      </motion.div>
    </div>
  );
}