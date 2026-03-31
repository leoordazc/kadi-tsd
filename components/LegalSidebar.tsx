"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LegalSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LegalSidebar({ isOpen, onClose }: LegalSidebarProps) {
    const sections = [
        {
            title: "📜 TÉRMINOS Y CONDICIONES GENERALES",
            content: `1. ACEPTACIÓN DE LOS TÉRMINOS
Al acceder y realizar una compra en KADI TS&D (en adelante "EL VENDEDOR"), el cliente (en adelante "EL COMPRADOR") acepta de manera expresa e irrevocable los presentes Términos y Condiciones Generales.

2. CAPACIDAD LEGAL
EL COMPRADOR declara ser mayor de edad (18 años) y tener capacidad legal suficiente para obligarse conforme a las leyes mexicanas.

3. OBJETO DEL CONTRATO
EL VENDEDOR se obliga a entregar la mercancía solicitada por EL COMPRADOR, consistente en transmisiones manuales, diferenciales y refacciones automotrices, bajo las condiciones establecidas en este documento.

4. PRECIOS Y FORMAS DE PAGO
4.1. Los precios publicados son en Pesos Mexicanos (MXN) e incluyen IVA.
4.2. EL VENDEDOR se reserva el derecho de modificar precios sin previo aviso.
4.3. La compra se formaliza hasta que EL VENDEDOR confirma el pago y la disponibilidad del producto.

5. DISPONIBILIDAD
La disponibilidad de los productos es en tiempo real. En caso de falta de stock, EL VENDEDOR notificará al COMPRADOR dentro de las 24 horas posteriores a la compra, ofreciendo:
   a) Reembolso total del monto pagado, o
   b) Esperar el tiempo de reposición estimado.

6. ACEPTACIÓN TÁCITA
El pago de la factura, nota de remisión o cualquier comprobante de pago implica la aceptación total e incondicional de los presentes Términos y Condiciones.`
        },
        {
            title: "🛡️ GARANTÍA LEGAL",
            content: `DISPOSICIONES GENERALES
De conformidad con la Ley Federal de Protección al Consumidor (LFPC), KADI TS&D otorga las siguientes garantías:

ARTÍCULO 1. PLAZOS DE GARANTÍA
1.1. Transmisiones Nuevas: 5 meses a partir de la fecha de entrega.
1.2. Transmisiones Reconstruidas: 4 meses a partir de la fecha de entrega.
1.3. Transmisiones Usadas: 3 meses a partir de la fecha de entrega.
1.4. Diferenciales Nuevos: 5 meses.
1.5. Diferenciales Reconstruidos: 4 meses.
1.6. Diferenciales Usados: 3 meses.
1.7. Refacciones (bronces, baleros, engranajes, molotes): 30 días.

ARTÍCULO 2. COBERTURA DE GARANTÍA
La garantía cubre exclusivamente defectos de fabricación y materiales que impidan el correcto funcionamiento del producto, siempre que el producto haya sido instalado por personal técnico calificado.

ARTÍCULO 3. EXCLUSIONES DE GARANTÍA
No procede la garantía en los siguientes casos:

3.1. INSTALACIÓN INCORRECTA
Para hacer válida la garantía, EL COMPRADOR deberá presentar cualquiera de los siguientes documentos que acrediten instalación profesional:
   a) Cédula profesional del mecánico instalador.
   b) RFC del taller mecánico que realizó la instalación.
   c) Factura o comprobante fiscal del taller instalador.
   
La ausencia de estos documentos invalidará automáticamente la garantía.

3.2. ROTURA DE SELLOS DE SEGURIDAD
EL VENDEDOR colocará sellos físicos de seguridad (pintura o precintos) en los tornillos del housing, carcasa o molote. Si el sello aparece roto, alterado o removido por cualquier causa, la garantía queda automáticamente anulada, independientemente de la causa del fallo.

3.3. CAUSAS EXCLUYENTES ADICIONALES
   a) Uso de aceite o lubricantes no especificados por el fabricante.
   b) Daños derivados de accidentes, modificaciones, uso indebido o negligencia.
   c) Desgaste natural por uso normal del vehículo.
   d) Productos instalados en vehículos con modificaciones estructurales o de potencia.
   e) Piezas dañadas por sobrecalentamiento, falta de lubricación o contaminación.
   f) Daños por ingreso de agua o sedimentos.
   g) Instalación en vehículos con kilometraje no verificado o alterado.

ARTÍCULO 4. PROCEDIMIENTO DE GARANTÍA
Para hacer efectiva la garantía, EL COMPRADOR deberá:
4.1. Notificar por escrito dentro de los 5 días hábiles posteriores a la falla.
4.2. Presentar el comprobante de compra original.
4.3. Entregar el producto con sus sellos de seguridad intactos.
4.4. Acreditar instalación profesional mediante los documentos señalados en el Artículo 3.1.
4.5. EL VENDEDOR realizará un diagnóstico en un plazo máximo de 10 días hábiles.

ARTÍCULO 5. RESOLUCIÓN
En caso de falla cubierta por garantía, EL VENDEDOR, a su elección:
5.1. Reparará el producto sin costo adicional.
5.2. Reemplazará el producto por uno de características similares.
5.3. Reembolsará el valor pagado (solo si no es posible la reparación o reemplazo).

ARTÍCULO 6. CONTINUIDAD DE GARANTÍA
La garantía no se reinicia con una reparación o reemplazo. El plazo original continúa corriendo desde la fecha de la primera compra.

ARTÍCULO 7. GARANTÍA EN CASO DE INTERCAMBIO ("CASCO")
Si la compra incluye la entrega de un "casco" (transmisión o diferencial viejo a cambio), EL COMPRADOR reconoce que:
7.1. El reembolso de la garantía solo procederá tras la recepción y verificación del casco por parte de EL VENDEDOR.
7.2. En caso de no entregar el casco en las condiciones acordadas, la garantía queda sin efecto.`
        },
        {
            title: "🚚 POLÍTICA DE ENVÍOS Y ENTREGAS",
            content: `ARTÍCULO 1. COBERTURA Y TIEMPOS
1.1. KADI TS&D realiza envíos a todo el territorio nacional.
1.2. Los tiempos estimados de entrega son:
    • CDMX y Zona Metropolitana: 24-48 horas hábiles
    • Zona Centro (Puebla, Querétaro, Hidalgo, Morelos, Tlaxcala): 2-3 días hábiles
    • Norte (Baja California, Sonora, Chihuahua, Coahuila, Nuevo León, Tamaulipas): 3-5 días hábiles
    • Sur y Sureste (Guerrero, Oaxaca, Chiapas, Tabasco, Campeche, Yucatán, Quintana Roo): 4-6 días hábiles

ARTÍCULO 2. COSTOS DE ENVÍO
2.1. Envío gratuito en compras superiores a $15,000 MXN.
2.2. Envío estándar calculado según ubicación y peso: $350 - $650 MXN.

ARTÍCULO 3. SEGURO DE ENVÍO
3.1. Todos los envíos cuentan con seguro contra daños y pérdida incluido.
3.2. En caso de siniestro, EL COMPRADOR deberá reportarlo dentro de las 24 horas posteriores a la fecha estimada de entrega.

ARTÍCULO 4. ENTREGA
4.1. La entrega se realiza en la dirección proporcionada por EL COMPRADOR.
4.2. Es responsabilidad del COMPRADOR proporcionar una dirección correcta y contar con persona para recibir.
4.3. En caso de no encontrarse en el domicilio, la paquetería realizará un segundo intento.
4.4. Si después de dos intentos no se logra la entrega, el producto será devuelto a bodega y EL COMPRADOR asumirá los costos de reenvío.`
        },
        {
            title: "💳 POLÍTICA DE PAGOS",
            content: `ARTÍCULO 1. MÉTODOS DE PAGO ACEPTADOS
1.1. Transferencia bancaria (SPEI).
1.2. Tarjetas de crédito y débito (Visa, Mastercard, American Express).
1.3. Pago referenciado en tiendas de conveniencia (OXXO, 7-Eleven, etc.).
1.4. Efectivo en sucursal (previa cita).

ARTÍCULO 2. FINANCIAMIENTO
2.1. Aplican promociones de meses sin intereses con tarjetas participantes.
2.2. Las promociones vigentes se muestran al momento de la compra.
2.3. EL VENDEDOR no se hace responsable por ajustes en promociones por parte de las instituciones bancarias.

ARTÍCULO 3. SEGURIDAD EN PAGOS
3.1. Todos los pagos con tarjeta se procesan mediante plataformas bancarias certificadas (PCI DSS).
3.2. KADI TS&D no almacena información de tarjetas de crédito/débito.
3.3. Los datos de transferencia se proporcionan al momento de finalizar la compra.

ARTÍCULO 4. FACTURACIÓN
4.1. Se emite factura CFDI 4.0 para todas las compras que lo soliciten.
4.2. EL COMPRADOR deberá proporcionar los datos fiscales correctos dentro de los 3 días posteriores a la compra.
4.3. No se emitirán facturas con fecha retroactiva.`
        },
        {
            title: "🔄 POLÍTICA DE DEVOLUCIONES Y REEMBOLSOS",
            content: `ARTÍCULO 1. DERECHO DE DESISTIMIENTO
De conformidad con la LFPC, EL COMPRADOR tiene derecho a desistir de la compra dentro de los 7 días naturales siguientes a la recepción del producto, siempre que:
1.1. El producto no haya sido instalado.
1.2. Los sellos de seguridad se encuentren intactos.
1.3. No presente daños físicos evidentes.

ARTÍCULO 2. PROCEDIMIENTO DE DEVOLUCIÓN
2.1. EL COMPRADOR deberá notificar su intención de devolución por escrito.
2.2. EL VENDEDOR proporcionará instrucciones para el envío.
2.3. Los costos de envío por devolución serán cubiertos por EL COMPRADOR.

ARTÍCULO 3. REEMBOLSOS
3.1. Una vez recibido y verificado el producto, EL VENDEDOR emitirá el reembolso en un plazo máximo de 10 días hábiles.
3.2. El reembolso se realizará a través del mismo método de pago utilizado.
3.3. Se descontarán los costos de envío originales.
3.4. No procede reembolso en efectivo cuando la compra fue con tarjeta.

ARTÍCULO 4. DEVOLUCIONES POR GARANTÍA
4.1. Aplica el procedimiento establecido en la sección de Garantía.
4.2. Los costos de envío por garantía serán cubiertos por EL VENDEDOR si la falla es acreditada.`
        },
        {
            title: "📋 AVISO DE PRIVACIDAD INTEGRAL",
            content: `De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, KADI TS&D informa:

ARTÍCULO 1. DATOS RECOLECTADOS
Se recolectan los siguientes datos personales:
• Nombre completo
• Correo electrónico
• Teléfono de contacto
• Dirección de envío
• Datos fiscales (para facturación)

ARTÍCULO 2. FINALIDADES DEL TRATAMIENTO
2.1. Finalidades primarias:
   a) Procesar y dar seguimiento a los pedidos.
   b) Realizar entregas a domicilio.
   c) Emitir facturas electrónicas.
   d) Atender solicitudes de garantía y devoluciones.

2.2. Finalidades secundarias (con consentimiento):
   a) Enviar promociones y novedades.
   b) Realizar encuestas de satisfacción.

ARTÍCULO 3. TRANSFERENCIA DE DATOS
No se transfieren datos personales a terceros no autorizados, excepto:
• Autoridades competentes por requerimiento legal.
• Paqueterías para la logística de envíos (solo dirección y teléfono).

ARTÍCULO 4. DERECHOS ARCO
EL COMPRADOR tiene derecho a ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) enviando solicitud a: ventas.kaditsd@gmail.com

ARTÍCULO 5. MODIFICACIONES
El presente Aviso de Privacidad puede ser modificado en cualquier momento. La versión vigente se publica en este medio.`
        },
        {
            title: "⚖️ JURISDICCIÓN Y LEGISLACIÓN APLICABLE",
            content: `ARTÍCULO 1. LEGISLACIÓN APLICABLE
Los presentes Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos, en particular por:
• Código Civil Federal.
• Ley Federal de Protección al Consumidor.
• Ley Federal de Protección de Datos Personales en Posesión de los Particulares.

ARTÍCULO 2. JURISDICCIÓN
Para la interpretación y cumplimiento de este contrato, las partes se someten a la jurisdicción de los tribunales competentes en Ecatepec de Morelos o Texcoco, Estado de México, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro.

ARTÍCULO 3. CONTACTO LEGAL
Para asuntos legales o notificaciones, dirigirse a:
KADI TS&D
Ojo de Agua, Estado de México
Correo: ventas.kaditsd@gmail.com`
        },
        {
            title: "🚨 LÍMITE DE RESPONSABILIDAD",
            content: `ARTÍCULO ÚNICO. LIMITACIÓN DE RESPONSABILIDAD
KADI TS&D no se hace responsable por:
• Gastos de grúa, remolque o transporte del vehículo.
• Estancia, renta de taller o días de inactividad del vehículo.
• Pérdida de utilidades, ingresos o salarios del chofer o propietario.
• Daños indirectos, emergentes o lucro cesante derivados de la falla del componente.
• Daños a terceros o al vehículo causados por instalación incorrecta.
• Costos de mano de obra para reinstalación o desinstalación del producto.

La responsabilidad de EL VENDEDOR se limita exclusivamente al valor pagado por el producto, sin exceder dicho monto bajo ninguna circunstancia.`
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed left-0 top-0 z-50 h-full w-full max-w-2xl bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] border-r border-white/10 shadow-2xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#ef4444]/10 rounded-xl flex items-center justify-center">
                                        <span className="text-[#ef4444] text-lg">⚖️</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-light text-white/90">Información Legal</h2>
                                        <p className="text-[10px] text-white/30">Contrato de adhesión · KADI TS&D</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-white/40 hover:text-white/60 transition-colors text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 space-y-8">
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="border-l-2 border-[#ef4444]/30 pl-4"
                                >
                                    <h3 className="text-sm font-semibold text-[#ef4444] mb-3 tracking-wide">
                                        {section.title}
                                    </h3>
                                    <div className="text-xs text-white/40 leading-relaxed whitespace-pre-line font-mono space-y-2">
                                        {section.content}
                                    </div>
                                    <div className="mt-4 h-px bg-white/5" />
                                </motion.div>
                            ))}
                            
                            {/* QR para términos (opcional) */}
                            <div className="pt-4 text-center border-t border-white/5">
                                <div className="inline-flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2 mb-4">
                                    <span className="text-[10px] text-white/40">📱 Escanea para consultar estos términos</span>
                                    <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-white/20 text-xs">
                                        QR
                                    </div>
                                </div>
                                <div className="text-[9px] text-white/20">
                                    <p>KADI TRANSMISSION SYSTEMS · RFC: KADXXXXXX</p>
                                    <p>Ojo de Agua, Estado de México · C.P. 57170</p>
                                    <p className="mt-2">Documento actualizado: Marzo 2026 · Versión 3.0 (Blindada)</p>
                                    <p className="mt-1">© 2026 KADI TS&D · Todos los derechos reservados</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}