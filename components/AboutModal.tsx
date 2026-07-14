"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[90vh] overflow-hidden bg-black rounded-2xl border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black border-b border-white/10 px-6 py-5 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-light text-white/90">📖 Conoce <span className="text-[#ef4444]">KADI</span></h2>
                  <p className="text-white/40 text-sm">Transmisiones &amp; Soporte Digital</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white/80 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 py-6 space-y-8">
              
              {/* NUESTRA HISTORIA */}
              <section>
                <h3 className="text-[#ef4444] text-sm font-medium tracking-wider mb-3">📌 NUESTRA HISTORIA</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  KADI TS&amp;D (Transmisiones &amp; Soporte Digital) nació de una visión clara: revolucionar y profesionalizar el mercado de la tracción automotriz en México a través de la tecnología. Combinando la rigurosidad de la ingeniería con años de experiencia técnica en el diagnóstico, reparación y reconstrucción de transmisiones <span className="text-white/80">100% manuales (estándar)</span> y diferenciales, decidimos romper con el esquema tradicional de los talleres y refaccionarias convencionales.
                </p>
                <p className="text-white/60 text-sm leading-relaxed mt-3">
                  Comenzamos operando en centros de distribución físicos, pero entendimos que el futuro de la mecánica especializada exige velocidad, precisión y cobertura. Por ello, evolucionamos hacia un modelo <span className="text-white/80">100% Digital e-Commerce</span>, centralizando nuestras operaciones logísticas y de ingeniería en nuestro centro de distribución a puerta cerrada en <span className="text-white/80">Acolman, Estado de México</span>, desde donde reparamos, atendemos y despachamos a talleres de todo el país.
                </p>
              </section>

              {/* NUESTRA MISIÓN */}
              <section>
                <h3 className="text-[#ef4444] text-sm font-medium tracking-wider mb-3">🎯 NUESTRA MISIÓN</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Proporcionar a mecánicos, talleres y entusiastas del motor soluciones definitivas en transmisiones estándar y diferenciales, ya sea a través de la venta de unidades completamente verificadas o mediante nuestro servicio especializado de reparación. Nos dedicamos a eliminar la incertidumbre mecánica, respaldando nuestro trabajo con un diagnóstico inteligente y soporte de nivel ingeniería.
                </p>
              </section>

              {/* NUESTROS PILARES Y COMPROMISO */}
              <section>
                <h3 className="text-[#ef4444] text-sm font-medium tracking-wider mb-3">🛡️ NUESTROS PILARES Y COMPROMISO</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white/80 text-sm font-medium">Especialización Premium (Solo Estándar y Diferenciales)</h4>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Hemos decidido ser maestros en nuestro rubro. Nos enfocamos exclusivamente en sistemas de tracción mecánica pura. No trabajamos transmisiones automáticas ni CVT. Ya sea que compres una unidad de nuestro catálogo o nos confíes la reparación de la tuya, cada componente que sale de nuestro banco de trabajo es rigurosamente inspeccionado bajo estrictas tolerancias de equipo original (OEM).
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white/80 text-sm font-medium">Operación e-Commerce de Vanguardia</h4>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Al operar exclusivamente en línea y sin los costos fijos de un mostrador tradicional, transferimos ese ahorro directamente a nuestros clientes. Garantizamos precios competitivos de almacén y una logística de envío terrestre rápida y asegurada a nivel nacional.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white/80 text-sm font-medium">Compromiso Inquebrantable de Garantía</h4>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Creemos firmemente en la calidad de nuestras reparaciones y en las piezas que vendemos. Por ello, nuestro trabajo cuenta con un respaldo de Garantía por Escrito, gestionada de forma transparente a través de nuestro sistema de folios digitales. Si está firmado por KADI, tienes la certeza de que responderemos.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white/80 text-sm font-medium">Innovación Digital</h4>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Desarrollamos herramientas de software propietarias y bases de datos robustas para que tu experiencia sea impecable. Desde nuestro catálogo inteligente hasta la asistencia técnica de <span className="text-[#ef4444]">NIA</span> (nuestra Inteligencia Artificial integrada), ponemos la tecnología del futuro al servicio de tu taller.
                    </p>
                  </div>
                </div>
              </section>

              {/* OPERACIÓN LOGÍSTICA */}
              <section>
                <h3 className="text-[#ef4444] text-sm font-medium tracking-wider mb-3">📍 OPERACIÓN LOGÍSTICA</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  <span className="text-white/80">Origen de Despacho y Taller Central:</span> Centro de Distribución (CEDIS) a puerta cerrada, Acolman, Estado de México. (Operación exclusiva en línea para recepción de reparaciones y envíos a todo México).
                </p>
                <p className="text-white/60 text-sm leading-relaxed mt-2">
                  <span className="text-white/80">Canales de Atención:</span> Chat de Soporte Digital en App Web, Asistencia Técnica Inteligente (NIA) y Línea de Enlace Directo por WhatsApp.
                </p>
              </section>

              {/* NUESTRO PROCESO OPERATIVO */}
              <section>
                <h3 className="text-[#ef4444] text-sm font-medium tracking-wider mb-3">⚙️ NUESTRO PROCESO OPERATIVO: ¿CÓMO TRABAJAMOS?</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  Para garantizar eficiencia, cobertura y precios de almacén, toda la logística de KADI TS&amp;D está diseñada bajo un modelo de envíos por paquetería de domicilio a domicilio. Ya sea que compres una refacción o nos envíes una unidad a reparar, nosotros conectamos nuestro CEDIS directamente con la puerta de tu taller.
                </p>

                <h4 className="text-white/80 text-sm font-medium mt-4 mb-2">📦 COMPRAS DE CATÁLOGO (Venta de Unidades y Refacciones)</h4>
                <p className="text-white/50 text-sm leading-relaxed">
                  Al realizar tu compra en nuestra App Web, tu transmisión estándar, diferencial o componente se empaca bajo estrictas normas de seguridad y se despacha mediante paquetería terrestre asegurada directo a tu código postal. Todo con trazabilidad digital.
                </p>

                <h4 className="text-white/80 text-sm font-medium mt-4 mb-2">🔧 SERVICIO DE REPARACIÓN</h4>
                <p className="text-white/50 text-sm leading-relaxed mb-3">
                  Sabemos que la transparencia es vital cuando nos confías tu unidad. Nuestro protocolo de reparación especializada funciona 100% a distancia bajo los siguientes <span className="text-white/60">5 pasos</span>:
                </p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="text-[#ef4444] font-bold min-w-[24px]">1.</span>
                    <div>
                      <span className="text-white/70 font-medium">Contacto y Presupuesto Preliminar</span>
                      <p className="text-white/40 leading-relaxed">Toda solicitud de reparación se gestiona inicialmente vía WhatsApp o Correo Electrónico. Con base en tu reporte de la falla, te emitimos un presupuesto preliminar digital. Así tienes un panorama claro de los costos antes de mover una sola pieza.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ef4444] font-bold min-w-[24px]">2.</span>
                    <div>
                      <span className="text-white/70 font-medium">Logística Puerta a Puerta</span>
                      <p className="text-white/40 leading-relaxed">A través de nuestra red de paqueterías, coordinamos el traslado de tu transmisión estándar o diferencial desde tu domicilio hasta nuestro banco de trabajo en Acolman.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ef4444] font-bold min-w-[24px]">3.</span>
                    <div>
                      <span className="text-white/70 font-medium">Inspección Física y Presupuesto Final</span>
                      <p className="text-white/40 leading-relaxed">Al recibir la unidad, nuestros ingenieros la desensamblan e inspeccionan a detalle. Te enviamos evidencia técnica (fotos/diagnóstico) y emitimos el presupuesto final exacto, ya sin suposiciones.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ef4444] font-bold min-w-[24px]">4.</span>
                    <div>
                      <span className="text-white/70 font-medium">Autorización del Cliente</span>
                      <p className="text-white/40 leading-relaxed">¡Tú tienes el control total! No procedemos con ninguna reparación ni sustitución de piezas hasta que evalúes el presupuesto final y nos des tu autorización explícita para avanzar.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ef4444] font-bold min-w-[24px]">5.</span>
                    <div>
                      <span className="text-white/70 font-medium">Ejecución y Envío de Retorno</span>
                      <p className="text-white/40 leading-relaxed">Una vez autorizada, las reparaciones tienen un tiempo de entrega que va desde las 24 horas en adelante (dependiendo de la severidad del daño mecánico). Al finalizar, la unidad es sellada, garantizada por escrito y enviada de regreso directo a tu taller, lista para ser instalada.</p>
                    </div>
                  </li>
                </ol>
              </section>

              {/* Contacto rápido */}
              <section className="pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://wa.me/5573382923"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition border border-green-600/30 text-sm"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href="mailto:ventas.kaditsd@gmail.com.mx"
                    className="flex items-center justify-center gap-2 py-2.5 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 transition border border-white/10 text-sm"
                  >
                    ✉️ Correo
                  </a>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-black border-t border-white/10 px-6 py-4">
              <button
                onClick={onClose}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 text-white/70 hover:bg-white/10 transition"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}