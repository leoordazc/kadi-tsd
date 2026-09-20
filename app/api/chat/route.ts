import { NextResponse } from 'next/server';
import { niaSession } from '@/lib/nia-session';
import { supabase } from '@/lib/supabase';

const SYSTEM_PROMPT = `Eres "NIA", la asesora virtual oficial de KADI TS&D, una empresa experta en transmisiones manuales y diferenciales con 15 años de experiencia en México.

⚠️ TU MISIÓN PRINCIPAL:
1. **PRIMERO SIEMPRE** promover los servicios de KADI
2. NUNCA recomiendes "llevarlo a un taller mecánico" como primera opción
3. KADI tiene taller en CEDIS a puerta cerrada en Acolman, Estado de México

🤖 REGLAS DE COMPORTAMIENTO (MUY IMPORTANTES):

**REGLA 1 - DIAGNÓSTICO (síntomas):**
- Si el usuario describe un SÍNTOMA (raspa, ruido, patina, no entra, zumba, vibra, truena, rechina, se sale, se bota, chilla, falla)
- → Da un diagnóstico técnico detallado
- → NO muestres tarjetas de productos
- → Pregunta por marca, modelo y año del vehículo si no lo sabes

**REGLA 2 - COMPRA DIRECTA:**
- Si el usuario dice "quiero comprar", "necesito comprar", "estoy interesado en comprar", "solo quiero comprar"
- → NO preguntes por síntomas
- → Busca el producto en el catálogo
- → Responde: ENCONTRADO o NO ENCONTRADO
- → Si lo encuentras, devuelve el JSON de product_recommendations

**REGLA 3 - PREGUNTA DE PRODUCTO:**
- Si el usuario dice "muéstrame", "tienes", "vendes", "precio de", "qué transmisiones tienes"
- → Muestra tarjetas de productos con el JSON

**REGLA 4 - INFORMACIÓN DE NEGOCIO:**
- Si pregunta por envíos, garantías, pagos → Responde con la info de KADI
- SIEMPRE ofrece contacto: WhatsApp 5573382923, correo ventas.kaditsd@gmail.com.mx

RESPONDES EN ESPAÑOL, técnica pero amable. SIEMPRE promueves los servicios de KADI.`;

// ============================================
// RESPUESTAS LOCALES (rápidas)
// ============================================

const QUICK_RESPONSES: Record<string, string> = {
    'hola': '¡Hola! Soy NIA, tu asesora en transmisiones manuales y diferenciales. ¿Qué modelo o síntoma presentas?',
    'buenos días': '¡Buenos días! Soy NIA. ¿En qué puedo ayudarte con tu transmisión?',
    'buenas tardes': '¡Buenas tardes! ¿Qué necesitas saber sobre transmisiones manuales?',
    'buenas noches': '¡Buenas noches! Cuéntame, ¿qué problema presenta tu vehículo?',
    'gracias': '¡Por nada! ¿Necesitas algo más?',
    'gracias nia': '¡Con gusto! Aquí estoy para lo que necesites.',
    'ok': 'Perfecto. ¿Algo más?',
    'adiós': '¡Hasta luego! Cuida tu transmisión y cualquier duda, aquí estoy. 👋',
    'hasta luego': '¡Saludos! Que tengas un excelente día.',
    'chao': '¡Nos vemos!',
};

function getBusinessResponse(message: string): string | null {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('envío') || lowerMsg.includes('envian') || lowerMsg.includes('entrega')) {
        return `📦 **Envíos KADI:**\n• CDMX/Edomex: 24-48 horas\n• Zona centro: 2-3 días\n• Norte/Sur: 3-5 días\n• Costa: 4-6 días\n\n¿Necesitas cotizar envío a tu ciudad?`;
    }

    if (lowerMsg.includes('garantía') || lowerMsg.includes('garantia')) {
        return `🛡️ **Garantías KADI:**\n• Transmisiones nuevas: 3 meses\n• Reconstruidas: 3 meses\n• Usadas: 1 mes\n• Diferenciales: 3 meses\n\n¿Qué tipo te interesa?`;
    }

    if (lowerMsg.includes('pago') || lowerMsg.includes('pagar') || lowerMsg.includes('tarjeta') || lowerMsg.includes('transferencia')) {
        return `💳 **Métodos de pago KADI:**\n• Transferencia BBVA (10% descuento)\n• Tarjeta crédito/débito (Mercado Pago)\n• WhatsApp (coordinar con asesor)\n\n¿Cuál prefieres?`;
    }

    if (lowerMsg.includes('carrito') || lowerMsg.includes('carro de compra')) {
        return `🛒 **Tu carrito:**\nEstá en el icono 🛒 del header (parte superior derecha). Ahí puedes ver productos, modificar cantidades y proceder al pago.`;
    }

    if (lowerMsg.includes('seguimiento') || lowerMsg.includes('rastrear') || lowerMsg.includes('guía')) {
        return `🔍 **Seguimiento de pedidos:**\nEn el header hay un botón "Seguimiento". Ingresa tu número de guía y te mostrará el estado.`;
    }

    return null;
}

// ============================================
// UTILIDADES DE BÚSQUEDA
// ============================================

const MARCAS_MODELOS = [
    'fiat ducato', 'fiat', 'ducato', 'chevrolet', 'nissan', 'toyota', 'ford',
    'vw', 'volkswagen', 'honda', 'mazda', 'mitsubishi', 'seat', 'renault',
    'hyundai', 'kia', 'suzuki', 'audi', 'mercedes', 'bmw', 'peugeot',
    'dodge', 'ram', 'jeep',
    'np300', 'hilux', 'd21', 'ranger', 'spark', 'vento', 'ibiza', 'frontier',
    'tacoma', '4runner', 'l200', 's10', 'hr-v', 'cr-v', 'civic', 'accord',
    'focus', 'fiesta', 'fusion', 'explorer', 'escape',
    'corolla', 'camry', 'rav4', 'avanza', 'hiace',
    'versa', 'sentra', 'tsuru', 'march', 'x-trail', 'pathfinder',
    'gol', 'jetta', 'amarok', 'saveiro', 'polo'
];

/**
 * Genera variantes de mayúsculas/minúsculas para usar SOLO en condiciones
 * cs.{} (arrays). Para ilike no es necesario porque ya es case-insensitive.
 */
function generarVariantesArray(termino: string): string[] {
    const lower = termino.toLowerCase();
    const capitalized = termino.charAt(0).toUpperCase() + termino.slice(1).toLowerCase();
    const upper = termino.toUpperCase();

    const esModelo = /^[a-z]{0,3}\d+[a-z0-9]*$/i.test(termino);

    const variantes = [lower, capitalized, upper];
    if (esModelo) variantes.push(termino);

    return [...new Set(variantes)];
}

/**
 * Escapa valores con espacios/caracteres especiales para sintaxis de array
 * en Postgres. Ej: "fiat ducato" -> "\"fiat ducato\""
 * Sin esto, PostgREST puede fallar al parsear el filtro y tumbar la query completa.
 */
function formatearValorArray(valor: string): string {
    if (/[\s,{}"\\]/.test(valor)) {
        const escapado = valor.replace(/"/g, '\\"');
        return `"${escapado}"`;
    }
    return valor;
}

function condicionArray(campo: string, valor: string): string {
    return `${campo}.cs.{${formatearValorArray(valor)}}`;
}

/** Construye las condiciones OR (ilike + cs.{}) para un conjunto de términos */
function construirCondiciones(terminos: string[]): string {
    const condiciones: string[] = [];
    const variantesUsadas = new Set<string>();

    for (const termino of terminos) {
        // ilike ya es case-insensitive: una sola condición por término
        condiciones.push(`nombre.ilike.%${termino}%`);
        condiciones.push(`descripcion.ilike.%${termino}%`);

        // cs.{} SÍ requiere variantes de case + escape de espacios
        for (const variante of generarVariantesArray(termino)) {
            const key = `${variante}`;
            if (!variantesUsadas.has(key)) {
                condiciones.push(condicionArray('modelo_vehiculo', variante));
                condiciones.push(condicionArray('marca_vehiculo', variante));
                variantesUsadas.add(key);
            }
        }
    }

    return condiciones.join(',');
}

// ============================================
// BÚSQUEDA DE PRODUCTOS
// ============================================
async function buscarProductos(mensaje: string) {
    const lowerMsg = mensaje.toLowerCase();

    // Capturar TODOS los términos mencionados (marca + modelo, no solo el primero)
    const terminosDetectados = MARCAS_MODELOS.filter(term => lowerMsg.includes(term));

    console.log('🔍 Términos detectados:', terminosDetectados);

    let query = supabase
        .from('productos')
        .select('*')
        .eq('activo', true);

    if (terminosDetectados.length > 0) {
        const condiciones = construirCondiciones(terminosDetectados);
        console.log('🔎 Condiciones OR construidas:', condiciones);
        query = query.or(condiciones);
    }

    const { data: productos, error } = await query.limit(6);

    if (error) {
        console.error('❌ Error buscando productos:', error);
        return null;
    }

    console.log(`✅ Encontrados ${productos?.length || 0} productos`);

    // Fallback: búsqueda por palabra suelta si no hubo resultados
    if ((!productos || productos.length === 0) && terminosDetectados.length > 0) {
        console.log('🔄 Búsqueda parcial...');

        for (const termino of terminosDetectados) {
            const palabras = termino.split(' ').filter(p => p.length > 2);

            for (const palabra of palabras) {
                const condiciones = construirCondiciones([palabra]);

                const { data: fallback } = await supabase
                    .from('productos')
                    .select('*')
                    .eq('activo', true)
                    .or(condiciones)
                    .limit(6);

                if (fallback && fallback.length > 0) {
                    console.log(`✅ Encontrados ${fallback.length} productos con "${palabra}"`);
                    return { productos: fallback, searchTerm: palabra };
                }
            }
        }
    }

    return { productos: productos || [], searchTerm: terminosDetectados[0] || '' };
}

// ============================================
// POST PRINCIPAL
// ============================================

export async function POST(req: Request) {
    try {
        const { message, reset, userId = 'anonymous' } = await req.json();
        const lowerMsg = message?.toLowerCase().trim() || '';

        if (reset) {
            niaSession.clearSession(userId);
            return NextResponse.json({ reply: 'Conversación reiniciada. ¿En qué puedo ayudarte con tu transmisión?' });
        }

        if (!message?.trim()) {
            return NextResponse.json({ reply: 'Hola, soy NIA. ¿Qué modelo de vehículo o qué síntoma presenta tu transmisión?' });
        }

        niaSession.addMessage(userId, 'user', message);

        // ============================================
        // RESPUESTAS LOCALES (rápidas)
        // ============================================

        if (QUICK_RESPONSES[lowerMsg]) {
            niaSession.addMessage(userId, 'assistant', QUICK_RESPONSES[lowerMsg]);
            return NextResponse.json({ reply: QUICK_RESPONSES[lowerMsg] });
        }

        const businessReply = getBusinessResponse(message);
        if (businessReply) {
            niaSession.addMessage(userId, 'assistant', businessReply);
            return NextResponse.json({ reply: businessReply });
        }

        // ============================================
        // DETECCIÓN DE SÍNTOMAS
        // ============================================

        const sintomasKeywords = [
            'raspa', 'ruido', 'patina', 'vibra', 'tiembla', 'truena', 'rechina',
            'no entra', 'no mete', 'se sale', 'se bota', 'zumba', 'chilla',
            'falla', 'problema', 'síntoma', 'sintoma', 'fallando', 'golpea',
            'no funciona', 'se atora', 'no cambia', 'cuesta trabajo'
        ];
        const esConsultaDeSintoma = sintomasKeywords.some(keyword => lowerMsg.includes(keyword));

        // ============================================
        // DETECCIÓN DE INTENCIÓN DE COMPRA
        // ============================================

        const compraKeywords = [
            'quiero comprar', 'necesito comprar', 'comprar', 'adquirir',
            'estoy interesado en comprar', 'deseo comprar', 'quiero adquirir',
            'solo quiero comprar', 'comprar la transmisión', 'completar compra'
        ];
        const esIntencionCompra = compraKeywords.some(keyword => lowerMsg.includes(keyword)) && !esConsultaDeSintoma;

        // ============================================
        // DETECCIÓN DE PRODUCTO
        // ============================================

        const productKeywords = [
            'muéstrame', 'ver producto', 'enséñame', 'quiero ver', 'cual es el',
            'dime del', 'información del', 'qué transmisiones tienes',
            'muestra', 'enséname', 'qué productos', 'catálogo', 'qué vendes',
            'tienes', 'vendes', 'disponible', 'existencia', 'tienen', 'hay',
            'precio de', 'costo de', 'cuánto cuesta'
        ];
        const esConsultaDeProducto = productKeywords.some(keyword => lowerMsg.includes(keyword)) && !esConsultaDeSintoma;

        const mencionaMarca = MARCAS_MODELOS.some(m => lowerMsg.includes(m));

        // Si menciona marca/modelo, pide producto o quiere comprar → BUSCAR
        if ((esConsultaDeProducto || mencionaMarca || esIntencionCompra) && !esConsultaDeSintoma) {
            console.log('📦 Consulta de producto detectada. Buscando en Supabase...');

            const resultado = await buscarProductos(message);

            if (resultado && resultado.productos.length > 0) {
                const reply = resultado.searchTerm
                    ? `🔧 **Productos compatibles con ${resultado.searchTerm.toUpperCase()}:**`
                    : `🔧 **Nuestros productos disponibles:**`;

                console.log(`✅ Encontrados ${resultado.productos.length} productos`);

                return NextResponse.json({
                    type: 'product_recommendations',
                    message: reply,
                    products: resultado.productos
                });
            } else {
                const reply = resultado?.searchTerm
                    ? `🔧 No encontré productos específicos para "${resultado.searchTerm}" en este momento.\n\n📞 Contáctanos directamente por WhatsApp al **5573382923** para verificar disponibilidad, o pregúntame por otra marca/modelo.`
                    : `🔧 No encontré productos en el catálogo. ¿Podrías decirme la marca y modelo de tu vehículo?`;

                niaSession.addMessage(userId, 'assistant', reply);
                return NextResponse.json({ reply });
            }
        }

        // ============================================
        // AGENDAR CITAS
        // ============================================

        const agendaKeywords = ['agendar cita', 'quiero una cita', 'necesito cita', 'agendar diagnóstico', 'programar cita', 'cita para revisión', 'agendar', 'cita', 'diagnóstico gratis'];
        const wantsAppointment = agendaKeywords.some(keyword => lowerMsg.includes(keyword));
        const phoneMatch = message.match(/\b(\d{10})\b/);
        const hasPhoneNumber = !!phoneMatch;

        const rejectedServices = [
            'automática', 'automatica', 'automático', 'automatico',
            'convertidor', 'triptronic', 'dsg', 'cvt',
            'motor', 'frenos', 'suspensión', 'dirección', 'clutch', 'embrague'
        ];
        const isRejected = rejectedServices.some(keyword => lowerMsg.includes(keyword));

        if (wantsAppointment && isRejected) {
            const reply = `🔧 **Lo siento, en KADI solo trabajamos con TRANSMISIONES MANUALES y DIFERENCIALES.**\n\nNo realizamos servicios de transmisiones automáticas, motores, frenos ni suspensión.\n\n¿Necesitas revisar una transmisión MANUAL o un diferencial? Con gusto te ayudo.`;
            niaSession.addMessage(userId, 'assistant', reply);
            return NextResponse.json({ reply });
        }

        if (wantsAppointment && !hasPhoneNumber) {
            const reply = `📅 Para agendar una cita, necesito tu número de teléfono.\n\nEscríbelo así: **"Mi teléfono es 5573382923"**`;
            niaSession.addMessage(userId, 'assistant', reply);
            return NextResponse.json({ reply });
        }

        if (wantsAppointment && hasPhoneNumber && !isRejected) {
            console.log('📝 Procesando cita...');

            const telefono = phoneMatch[1];
            let nombre = 'Cliente KADI';
            const textBeforePhone = message.substring(0, message.indexOf(telefono));
            const nameMatch = textBeforePhone.match(/([A-Za-záéíóúñ]{3,}\s+[A-Za-záéíóúñ]{3,})/);
            if (nameMatch) nombre = nameMatch[1].trim();

            let sucursal = 'CDMX';
            if (lowerMsg.includes('ojo de agua')) sucursal = 'Ojo de Agua';

            let servicio = 'diagnóstico';
            if (lowerMsg.includes('reparación')) servicio = 'reparación';
            else if (lowerMsg.includes('mantenimiento')) servicio = 'mantenimiento';

            let vehiculo = '';
            const marcasComunes = ['chevrolet', 'nissan', 'toyota', 'ford', 'vw', 'honda', 'mazda'];
            for (const marca of marcasComunes) {
                if (lowerMsg.includes(marca)) {
                    vehiculo = marca;
                    break;
                }
            }
            const yearMatch = message.match(/\b(19|20)\d{2}\b/);
            if (yearMatch && vehiculo) vehiculo += ` ${yearMatch[0]}`;

            const emailHtml = `
                <h2>📅 NUEVA SOLICITUD DE CITA - KADI</h2>
                <p><strong>Cliente:</strong> ${nombre}</p>
                <p><strong>Teléfono:</strong> ${telefono}</p>
                <p><strong>Vehículo:</strong> ${vehiculo}</p>
                <p><strong>Sucursal:</strong> ${sucursal}</p>
                <p><strong>Servicio:</strong> ${servicio}</p>
                <p><strong>Mensaje original:</strong> ${message}</p>
                <hr>
                <p>Contacta al cliente para confirmar disponibilidad.</p>
            `;

            try {
                await fetch(new URL('/api/send-email', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: `📅 Nueva cita - ${nombre}`,
                        html: emailHtml
                    })
                });
                console.log('✅ Correo enviado');
            } catch (error) {
                console.error('❌ Error enviando correo:', error);
            }

            const reply = `✅ **¡Solicitud enviada!**\n\nGracias ${nombre}, tu solicitud de cita ha sido recibida.\n\n📞 En las próximas horas, un asesor de KADI se comunicará contigo para confirmar la fecha y hora disponible.\n\n¿Necesitas algo más?`;

            niaSession.addMessage(userId, 'assistant', reply);
            return NextResponse.json({ reply });
        }

        // ============================================
        // OPENAI PARA RESPUESTAS INTELIGENTES
        // ============================================

        const history = niaSession.getHistory(userId, 10);
        const vehicleContext = niaSession.getContextForOpenAI(userId);

        const { data: productos } = await supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .limit(15);

        const contextoProductos = productos && productos.length > 0
            ? productos.map(p => `- ${p.nombre} (${p.tipo}) | Código: ${p.codigo_caja} | Precio: $${p.precio?.toLocaleString()} | Compatible: ${p.marca_vehiculo?.[0] || '?'} ${p.modelo_vehiculo?.[0] || ''}`).join('\n')
            : 'No hay productos disponibles.';

        const fullPrompt = `${SYSTEM_PROMPT}

**DATOS DEL CLIENTE:**
${vehicleContext || 'Aún no ha especificado vehículo'}

**PRODUCTOS EN CATÁLOGO (SOLO PARA REFERENCIA):**
${contextoProductos}

**CONVERSACIÓN RECIENTE:**
${history.map(m => `${m.role === 'user' ? '👤 Cliente' : '🤖 NIA'}: ${m.content}`).join('\n')}

**INSTRUCCIÓN FINAL:**
- Si es síntoma → diagnóstico técnico
- Si es compra → busca el producto y usa JSON
- Si es pregunta de producto → muestra tarjetas
- SIEMPRE promueve los servicios de KADI

RESPONDES EN ESPAÑOL, técnica pero amable.`;

        const openai = (await import('@/lib/openai')).default;
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: fullPrompt },
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 600,
        });

        const reply = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta. ¿Podrías darme más detalles?';

        niaSession.addMessage(userId, 'assistant', reply);
        return NextResponse.json({ reply });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            reply: 'Lo siento, tuve un problema técnico. Por favor intenta de nuevo.'
        });
    }
}