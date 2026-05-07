import { NextResponse } from 'next/server';
import { niaSession } from '@/lib/nia-session';
import { supabase } from '@/lib/supabase';

const SYSTEM_PROMPT = `Eres "NIA", la asesora virtual oficial de KADI TS&D, una empresa experta en transmisiones manuales y diferenciales con 15 años de experiencia en México.

⚠️ TU MISIÓN PRINCIPAL:
1. **PRIMERO SIEMPRE** promover los servicios de KADI
2. NUNCA recomiendes "llevarlo a un taller mecánico" como primera opción
3. KADI tiene talleres en CDMX y Ojo de Agua, Estado de México

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
        return `🛡️ **Garantías KADI:**\n• Transmisiones nuevas: 24 meses\n• Reconstruidas: 12 meses\n• Usadas: 3 meses\n• Diferenciales: 12 meses\n\n¿Qué tipo te interesa?`;
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
// POST PRINCIPAL
// ============================================

export async function POST(req: Request) {
    try {
        const { message, reset, userId = 'anonymous' } = await req.json();
        const lowerMsg = message.toLowerCase().trim();
        
        if (reset) {
            niaSession.clearSession(userId);
            return NextResponse.json({ reply: 'Conversación reiniciada. ¿En qué puedo ayudarte con tu transmisión?' });
        }
        
        if (!message?.trim()) {
            return NextResponse.json({ reply: 'Hola, soy NIA. ¿Qué modelo de vehículo o qué síntoma presenta tu transmisión?' });
        }
        
        // Guardar mensaje del usuario
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
        // DETECCIÓN DE SÍNTOMAS (PRIMERO)
        // ============================================
        
        const sintomasKeywords = [
            'raspa', 'ruido', 'patina', 'vibra', 'tiembla', 'truena', 'rechina',
            'no entra', 'no mete', 'se sale', 'se bota', 'zumba', 'chilla',
            'falla', 'problema', 'síntoma', 'sintoma', 'fallando', 'golpea',
            'no funciona', 'se atora', 'no cambia', 'cuesta trabajo'
        ];
        
        const esConsultaDeSintoma = sintomasKeywords.some(keyword => lowerMsg.includes(keyword));
        
        // ============================================
        // DETECCIÓN DE INTENCIÓN DE COMPRA (SEGUNDO)
        // ============================================
        
        const compraKeywords = [
            'quiero comprar', 'necesito comprar', 'comprar', 'adquirir',
            'estoy interesado en comprar', 'deseo comprar', 'quiero adquirir',
            'solo quiero comprar', 'comprar la transmisión', 'completar compra'
        ];
        
        const esIntencionCompra = compraKeywords.some(keyword => lowerMsg.includes(keyword)) && !esConsultaDeSintoma;
        
        if (esIntencionCompra) {
            console.log('🛒 Intención de compra detectada, buscando producto...');
            
            // Extraer el modelo del mensaje
            let modeloBuscado = '';
            const marcasModelos = [
                'fiat ducato', 'fiat', 'ducato',
                'np300', 'hilux', 'd21', 'ranger', 'spark', 'vento', 
                'ibiza', 'frontier', 'tacoma', '4runner', 'l200', 's10'
            ];
            
            for (const term of marcasModelos) {
                if (lowerMsg.includes(term)) {
                    modeloBuscado = term;
                    break;
                }
            }
            
            if (!modeloBuscado) {
                const reply = `🔧 Para ayudarte con tu compra, necesito saber qué modelo de transmisión buscas. Por ejemplo: NP300, Hilux, Fiat Ducato, etc.`;
                niaSession.addMessage(userId, 'assistant', reply);
                return NextResponse.json({ reply });
            }
            
            // Buscar producto en Supabase
            let query = supabase.from('productos').select('*').eq('activo', true);
            query = query.or(`nombre.ilike.%${modeloBuscado}%,modelo_vehiculo.cs.{${modeloBuscado}}`);
            
            const { data: productos, error } = await query.limit(3);
            
            if (error) {
                console.error('Error buscando producto:', error);
            }
            
            if (productos && productos.length > 0) {
                const reply = `🛒 **${productos[0].nombre}**\n\n¿Te interesa esta transmisión? Puedes agregarla al carrito desde la tarjeta.`;
                
                return NextResponse.json({
                    type: 'product_recommendations',
                    message: reply,
                    products: productos
                });
            } else {
                const reply = `🔧 No encontré una transmisión para "${modeloBuscado}" en nuestro catálogo. ¿Quieres que busque algo similar o te ayudo con otra cosa?`;
                niaSession.addMessage(userId, 'assistant', reply);
                return NextResponse.json({ reply });
            }
        }
        
        // ============================================
        // DETECCIÓN DE SÍNTOMAS (continuar a diagnóstico)
        // ============================================
        
        if (esConsultaDeSintoma) {
            console.log('🔧 Consulta de síntoma detectada, pasando a diagnóstico técnico...');
            // Continuar con OpenAI para diagnóstico
        }
        
        // ============================================
        // MOSTRAR PRODUCTOS CON TARJETAS
        // ============================================
        
        const productKeywords = [
            'muéstrame', 'ver producto', 'enséñame', 'quiero ver', 'cual es el',
            'dime del', 'información del', 'qué transmisiones tienes',
            'muestra', 'enséname', 'qué productos', 'catálogo', 'qué vendes'
        ];
        
        const esConsultaDeProducto = productKeywords.some(keyword => lowerMsg.includes(keyword)) && !esConsultaDeSintoma && !esIntencionCompra;
        
        let searchTerm = '';
        const modelos = [
            'np300', 'hilux', 'd21', 'ranger', 'spark', 'vento', 'ibiza',
            'frontier', 'tacoma', '4runner', 'l200', 's10',
            'fiat ducato', 'fiat', 'ducato'
        ];
        
        for (const modelo of modelos) {
            if (lowerMsg.includes(modelo)) {
                searchTerm = modelo;
                break;
            }
        }
        
        if ((esConsultaDeProducto || searchTerm) && !esConsultaDeSintoma && !esIntencionCompra) {
            console.log('📦 Buscando productos con filtros...');
            
            let query = supabase.from('productos').select('*').eq('activo', true);
            
            if (searchTerm) {
                query = query.or(`nombre.ilike.%${searchTerm}%,modelo_vehiculo.cs.{${searchTerm}}`);
                console.log(`🔍 Filtrando por: ${searchTerm}`);
            }
            
            const { data: productos, error } = await query.limit(6);
            
            if (error) {
                console.error('Error buscando productos:', error);
            }
            
            if (productos && productos.length > 0) {
                let reply = searchTerm 
                    ? `🔧 **Productos compatibles con ${searchTerm.toUpperCase()}:**`
                    : `🔧 **Nuestros productos disponibles:**`;
                
                console.log(`✅ Encontrados ${productos.length} productos`);
                
                return NextResponse.json({
                    type: 'product_recommendations',
                    message: reply,
                    products: productos
                });
            } else {
                console.log('❌ No se encontraron productos, pasando a OpenAI...');
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
            const marcas = ['chevrolet', 'nissan', 'toyota', 'ford', 'vw', 'honda', 'mazda'];
            for (const marca of marcas) {
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
            
            const reply = `✅ **¡Solicitud enviada!**

Gracias ${nombre}, tu solicitud de cita ha sido recibida.

📞 En las próximas horas, un asesor de KADI se comunicará contigo para confirmar la fecha y hora disponible.

¿Necesitas algo más?`;
            
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