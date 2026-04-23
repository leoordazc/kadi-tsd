import { NextResponse } from 'next/server';
import { niaSession } from '@/lib/nia-session';
import { supabase } from '@/lib/supabase';

const SYSTEM_PROMPT = `Eres "NIA", la asesora virtual oficial de KADI TS&D, una empresa experta en transmisiones manuales y diferenciales con 15 años de experiencia en México.

⚠️ TU MISIÓN PRINCIPAL (MUY IMPORTANTE):
1. **PRIMERO SIEMPRE** promover los servicios de KADI: venta de transmisiones, reparación, mantenimiento y venta de componentes internos.
2. NO recomiendes "llevarlo a un taller mecánico" como primera opción. En su lugar, ofrece los servicios de KADI.
3. KADI tiene talleres en **CDMX y Ojo de Agua, Estado de México**.

🚚 OPCIONES QUE DEBES OFRECER (en orden de prioridad):

**Opción 1 - Para clientes en CDMX/Edomex:**
"Podemos revisar tu transmisión en nuestros talleres de CDMX u Ojo de Agua. ¿Te queda cerca alguna de nuestras sucursales?"

**Opción 2 - Para clientes fuera del área metropolitana:**
"Si ya tienes tu transmisión fuera del vehículo, puedes enviarla por paquetería (fletera) a nuestros talleres. Te hacemos el diagnóstico y reparación, y te la regresamos por el mismo medio."

**Opción 3 - Venta directa:**
"Si prefieres una transmisión ya reconstruida, tenemos inventario disponible. Te la enviamos a cualquier parte de México en 24-48 horas."

**Opción 4 - Componentes internos:**
"¿Solo necesitas bronces, baleros, sincronizadores o satélites? Tenemos venta de componentes internos para que tu mecánico de confianza realice la reparación."

📍 NUESTROS SERVICIOS:
- Reparación y reconstrucción de transmisiones manuales
- Venta de transmisiones nuevas, reconstruidas y usadas
- Venta de componentes internos (bronces, baleros, sincronizadores, satélites, planetarios)
- Mantenimiento preventivo
- Diagnóstico técnico gratuito (presupuesto sin costo)

📞 **CONTACTO:**
- WhatsApp: 5573382923
- Correo: ventas.kaditsd@gmail.com.mx

📍 **SUCURSALES:**
- CDMX (zona de taller)
- Ojo de Agua, Estado de México

RESPONDES EN ESPAÑOL, técnica pero amable, y SIEMPRE promueves los servicios de KADI como primera opción.`;

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
        // MOSTRAR PRODUCTOS CON TARJETAS
        // ============================================
        
        const productKeywords = ['muéstrame', 'ver producto', 'enséñame', 'quiero ver', 'cual es el', 'dime del', 'información del', 'producto', 'qué transmisiones tienes', 'muestra', 'enséname', 'qué productos', 'catálogo', 'qué vendes'];
        const wantsProduct = productKeywords.some(keyword => lowerMsg.includes(keyword));
        
        if (wantsProduct) {
            console.log('📦 Buscando productos para mostrar...');
            
            // Intentar extraer modelo del mensaje
            let searchTerm = '';
            const modelos = ['np300', 'hilux', 'd21', 'ranger', 'spark', 'vento', 'ibiza', 'frontier', 'tacoma', '4runner'];
            for (const modelo of modelos) {
                if (lowerMsg.includes(modelo)) {
                    searchTerm = modelo;
                    break;
                }
            }
            
            let query = supabase.from('productos').select('*').eq('activo', true);
            
            if (searchTerm) {
                query = query.contains('modelo_vehiculo', [searchTerm]);
            }
            
            const { data: productos, error } = await query.limit(6);
            
            if (error) {
                console.error('Error buscando productos:', error);
            }
            
            if (productos && productos.length > 0) {
                const reply = searchTerm 
                    ? `🔧 **Productos compatibles con ${searchTerm.toUpperCase()}:**`
                    : `🔧 **Nuestros productos disponibles:**`;
                
                return NextResponse.json({
                    type: 'product_recommendations',
                    message: reply,
                    products: productos
                });
            } else {
                const reply = `No encontré productos específicos para "${searchTerm || 'tu búsqueda'}". ¿Quieres que revise disponibilidad general o prefieres que te ayude con otra cosa?`;
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
        
        // Servicios NO permitidos
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
            
            // Enviar correo
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

**PRODUCTOS EN CATÁLOGO:**
${contextoProductos}

**CONVERSACIÓN RECIENTE:**
${history.map(m => `${m.role === 'user' ? '👤 Cliente' : '🤖 NIA'}: ${m.content}`).join('\n')}

**INSTRUCCIÓN FINAL:**
Responde al cliente de forma técnica pero SIEMPRE ofreciendo los servicios de KADI como primera opción.`;

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