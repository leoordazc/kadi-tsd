"use client";

import { motion } from "framer-motion";

interface BankInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export default function BankInfoModal({ isOpen, onClose, total }: BankInfoModalProps) {
  const clabe = "0123 4567 8901 2345 67";
  const cuenta = "1234 5678 9012";
  const referencia = `KADI-${Date.now()}`;

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
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">Cuenta:</span>
            <span className="text-white/80 font-mono">{cuenta}</span>
            <button onClick={() => copyToClipboard(cuenta)} className="text-[#ef4444] text-xs">Copiar</button>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">CLABE:</span>
            <span className="text-white/80 font-mono">{clabe}</span>
            <button onClick={() => copyToClipboard(clabe)} className="text-[#ef4444] text-xs">Copiar</button>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Referencia:</span>
            <span className="text-white/80 font-mono">{referencia}</span>
            <button onClick={() => copyToClipboard(referencia)} className="text-[#ef4444] text-xs">Copiar</button>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 mt-2">
            <span className="text-white/40">Total a pagar:</span>
            <span className="text-white/90 font-bold">${total.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-xs text-white/30 mt-4">
          Realiza la transferencia y envía el comprobante a <strong>hola@kadi.mx</strong> para confirmar tu pedido.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#ef4444] text-white py-2 rounded-lg mt-4 hover:bg-[#ef4444]/80 transition"
        >
          Entendido
        </button>
      </motion.div>
    </div>
  );
}

Fix BankInfoModal completo
