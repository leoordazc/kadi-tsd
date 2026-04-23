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

📞 **CONTACTO Y CITAS:**
- WhatsApp: 5573382923 (también para agendar citas)
- Correo: ventas.kaditsd@gmail.com.mx
- Para agendar una cita, pide al cliente: nombre, teléfono, sucursal (CDMX u Ojo de Agua), vehículo y tipo de servicio.
- Las citas son para diagnóstico gratuito, reparación o mantenimiento preventivo.
- Si el cliente proporciona los datos, confirma la cita y dile que nos comunicaremos con él.

📍 **SUCURSALES:**
- CDMX (zona de taller)
- Ojo de Agua, Estado de México

⚠️ Cuando un cliente quiera agendar cita, usa el formato:
"Para agendarte una cita, necesito: nombre completo, teléfono, sucursal preferida y qué servicio necesitas."

RESPONDES EN ESPAÑOL, técnica pero amable, y SIEMPRE promueves los servicios de KADI como primera opción.`;

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
// AGENDAR CITAS - CON FILTROS
// ============================================

// Palabras clave para detectar intención de cita
const agendaKeywords = ['agendar cita', 'quiero una cita', 'necesito cita', 'agendar diagnóstico', 'programar cita', 'cita para revisión', 'agendar', 'cita', 'diagnóstico gratis'];
const wantsAppointment = agendaKeywords.some(keyword => lowerMsg.includes(keyword));

// Detectar número de teléfono
const phoneMatch = message.match(/\b(\d{10})\b/);
const hasPhoneNumber = !!phoneMatch;

// 🔥 FILTRO 1: Servicios NO permitidos
const rejectedServices = [
    'automática', 'automatica', 'automático', 'automatico',
    'convertidor', 'triptronic', 'dsg', 'cvt',
    'motor', 'frenos', 'suspensión', 'dirección', 'clutch', 'embrague'
];

const isRejected = rejectedServices.some(keyword => lowerMsg.includes(keyword));

if (wantsAppointment && isRejected) {
    const reply = `🔧 **Lo siento, en KADI solo trabajamos con TRANSMISIONES MANUALES y DIFERENCIALES.**

No realizamos servicios de transmisiones automáticas, motores, frenos ni suspensión.

¿Necesitas revisar una transmisión MANUAL o un diferencial? Con gusto te ayudo.`;
    
    niaSession.addMessage(userId, 'assistant', reply);
    return NextResponse.json({ reply });
}

// 🔥 FILTRO 2: Si es cita pero no menciona transmisión manual o diferencial
if (wantsAppointment && !lowerMsg.includes('transmisión') && !lowerMsg.includes('diferencial') && !lowerMsg.includes('caja manual') && !lowerMsg.includes('estándar')) {
    const reply = `🔧 Para agendar una cita, necesito confirmar: ¿tu vehículo tiene **transmisión MANUAL** o necesitas revisar el **diferencial**?

En KADI solo trabajamos transmisiones manuales y diferenciales. ¿Podemos continuar?`;
    
    niaSession.addMessage(userId, 'assistant', reply);
    return NextResponse.json({ reply });
}

// Si hay intención de cita + teléfono + servicios permitidos → GUARDAR
if (wantsAppointment && hasPhoneNumber && !isRejected) {
    console.log('📝 GUARDANDO CITA - Servicio permitido');
    
    const telefono = phoneMatch[1];
    
    // Extraer nombre
    let nombre = 'Cliente KADI';
    const textBeforePhone = message.substring(0, message.indexOf(telefono));
    const nameMatch = textBeforePhone.match(/([A-Za-záéíóúñ]{3,}\s+[A-Za-záéíóúñ]{3,})/);
    if (nameMatch) nombre = nameMatch[1].trim();
    
    // Sucursal
    let sucursal = 'CDMX';
    if (lowerMsg.includes('ojo de agua')) sucursal = 'Ojo de Agua';
    
    // Servicio
    let servicio = 'diagnóstico';
    if (lowerMsg.includes('reparación')) servicio = 'reparación';
    else if (lowerMsg.includes('mantenimiento')) servicio = 'mantenimiento';
    
    // Vehículo
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
    
    const citaData = {
        cliente_nombre: nombre,
        cliente_telefono: telefono,
        tipo_servicio: servicio,
        sucursal: sucursal,
        vehiculo_marca: vehiculo,
        notas: `Mensaje original: ${message.substring(0, 200)}`,
        userId: userId
    };
    
    try {
        const citaResponse = await fetch('/api/citas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(citaData)
        });
        
        const citaResult = await citaResponse.json();
        
        if (citaResult.success) {
            const reply = `✅ **¡Cita agendada con éxito!**

📋 **Resumen:**
- Nombre: ${nombre}
- Teléfono: ${telefono}
- Sucursal: ${sucursal}
- Servicio: ${servicio}
${vehiculo ? `- Vehículo: ${vehiculo}` : ''}

📞 En las próximas horas, un asesor de KADI se comunicará contigo para confirmar fecha y hora.

¿Necesitas algo más?`;
            
            niaSession.addMessage(userId, 'assistant', reply);
            return NextResponse.json({ reply });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Si QUIERE cita pero NO tiene teléfono
if (wantsAppointment && !hasPhoneNumber) {
    const reply = `📅 Para agendar una cita, necesito tu número de teléfono.

Escríbelo así: **"Mi teléfono es 5573382923"**`;
    
    niaSession.addMessage(userId, 'assistant', reply);
    return NextResponse.json({ reply });
}
        
        // Obtener historial y contexto
        const history = niaSession.getHistory(userId, 10);
        const vehicleContext = niaSession.getContextForOpenAI(userId);
        
        // Obtener productos de Supabase
        const { data: productos } = await supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .limit(15);
        
        const contextoProductos = productos && productos.length > 0 
            ? productos.map(p => `- ${p.nombre} (${p.tipo}) | Código: ${p.codigo_caja} | Precio: $${p.precio?.toLocaleString()} | Compatible: ${p.marca_vehiculo?.[0] || '?'} ${p.modelo_vehiculo?.[0] || ''} ${p.año_inicio || ''}-${p.año_fin || ''}`).join('\n')
            : 'No hay productos disponibles.';
        
        // Construir el prompt completo
        const fullPrompt = `${SYSTEM_PROMPT}

**📍 SERVICIOS DE KADI (DEBES OFRECERLOS):**
- Diagnóstico técnico gratuito en taller (CDMX y Ojo de Agua)
- Reparación y reconstrucción de transmisiones manuales
- Venta de transmisiones (nuevas, reconstruidas, usadas)
- Venta de componentes internos (bronces, baleros, sincronizadores, satélites, planetarios)
- Envíos a toda la república por paquetería (24-48 horas)
- Aceptamos tu transmisión por flete si estás fuera del área metropolitana

**⚠️ REGLA DE ORO:**
NUNCA recomiendes "llevarlo a un taller mecánico" sin antes ofrecer los servicios de KADI. Primero dices: "En KADI podemos ayudarte. Tenemos talleres en CDMX y Ojo de Agua, o si estás fuera, puedes enviarnos tu transmisión por paquetería."
**DATOS DEL CLIENTE (lo que ha mencionado antes):**
${vehicleContext || 'Aún no ha especificado vehículo'}

**PRODUCTOS EN CATÁLOGO (para que puedas recomendar):**
${contextoProductos}

**CONVERSACIÓN RECIENTE:**
${history.map(m => `${m.role === 'user' ? '👤 Cliente' : '🤖 NIA'}: ${m.content}`).join('\n')}

**INSTRUCCIÓN FINAL:**
Responde al cliente de forma técnica pero SIEMPRE ofreciendo los servicios de KADI.`;


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