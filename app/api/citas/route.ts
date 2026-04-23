import { NextResponse } from 'next/server';
import { niaSession } from '@/lib/nia-session';
import { supabase } from '@/lib/supabase';

// ============================================
// PROMPT PRINCIPAL DE NIA
// ============================================
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
// RESPUESTAS LOCALES (sin OpenAI)
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
        
        // Resetear conversación
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
        // AGENDAR CITAS - SOLO CORREO (sin Supabase)
        // ============================================
        
        const agendaKeywords = ['agendar cita', 'quiero una cita', 'necesito cita', 'agendar diagnóstico', 'programar cita', 'cita para revisión', 'agendar', 'cita'];
        const wantsAppointment = agendaKeywords.some(keyword => lowerMsg.includes(keyword));
        const phoneMatch = message.match(/\b(\d{10})\b/);
        const hasPhoneNumber = !!phoneMatch;
        const waitingForData = niaSession.getWaitingForData(userId);
        
        // CASO 1: Iniciar solicitud de cita
        if (wantsAppointment && !waitingForData) {
            niaSession.setWaitingForData(userId, true);
            const reply = `📅 **Solicitud de cita - KADI TS&D**

Para enviar tu solicitud, necesito:

1. 📝 **Nombre completo**
2. 📱 **Teléfono** (10 dígitos)
3. 🚗 **Vehículo** (marca, modelo, año)
4. 📍 **Sucursal** (CDMX u Ojo de Agua)

Escribe tus datos así:
**Juan Pérez, 5573382923, NP300 2015, CDMX**

¿Me los compartes?`;
            
            niaSession.addMessage(userId, 'assistant', reply);
            return NextResponse.json({ reply });
        }
        
        // CASO 2: Procesar datos de cita
        if (waitingForData && message && message.length > 5) {
            console.log('📝 Procesando datos para cita...');
            
            const telefono = phoneMatch ? phoneMatch[1] : 'No proporcionado';
            
            let nombre = 'Cliente Web';
            if (telefono !== 'No proporcionado') {
                const textBeforePhone = message.substring(0, message.indexOf(telefono));
                const nameMatch = textBeforePhone.match(/([A-Za-záéíóúñ]{3,}\s+[A-Za-záéíóúñ]{3,})/);
                if (nameMatch) nombre = nameMatch[1].trim();
            } else {
                const firstComma = message.indexOf(',');
                if (firstComma > 0) nombre = message.substring(0, firstComma).trim();
            }
            
            let sucursal = 'No especificada';
            if (message.toLowerCase().includes('cdmx')) sucursal = 'CDMX';
            else if (message.toLowerCase().includes('ojo de agua')) sucursal = 'Ojo de Agua';
            
            let vehiculo = 'No especificado';
            const marcas = ['chevrolet', 'nissan', 'toyota', 'ford', 'vw', 'honda', 'mazda'];
            for (const marca of marcas) {
                if (message.toLowerCase().includes(marca)) {
                    vehiculo = marca;
                    break;
                }
            }
            const yearMatch = message.match(/\b(19|20)\d{2}\b/);
            if (yearMatch && vehiculo !== 'No especificado') vehiculo += ` ${yearMatch[0]}`;
            
            // Enviar correo al administrador
            const emailHtml = `
                <h2>📅 NUEVA SOLICITUD DE CITA - KADI</h2>
                <p><strong>Cliente:</strong> ${nombre}</p>
                <p><strong>Teléfono:</strong> ${telefono}</p>
                <p><strong>Vehículo:</strong> ${vehiculo}</p>
                <p><strong>Sucursal:</strong> ${sucursal}</p>
                <p><strong>Mensaje original:</strong> ${message}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <p>Contacta al cliente para confirmar disponibilidad de horario.</p>
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
                console.log('✅ Correo enviado a administrador');
            } catch (error) {
                console.error('❌ Error enviando correo:', error);
            }
            
            const reply = `✅ **¡Solicitud enviada!**

Gracias ${nombre}, tu solicitud de cita ha sido recibida.

📋 **Datos registrados:**
- Teléfono: ${telefono}
- Vehículo: ${vehiculo}
- Sucursal: ${sucursal}

📞 En las próximas horas, un asesor de KADI se comunicará contigo para confirmar la fecha y hora disponible.

¿Necesitas algo más?`;
            
            niaSession.setWaitingForData(userId, false);
            niaSession.addMessage(userId, 'assistant', reply);
            return NextResponse.json({ reply });
        }
        
        // CASO 3: Quiere cita pero sin teléfono
        if (wantsAppointment && !hasPhoneNumber) {
            const reply = `📅 Para enviar tu solicitud, necesito tu número de teléfono.

Escribe: **"Juan Pérez, 5573382923, NP300, CDMX"**`;
            
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