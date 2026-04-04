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
// AGENDAR CITAS - VERSIÓN CORREGIDA
// ============================================

// Detectar intención de agendar cita (cuando el usuario QUIERE agendar)
const agendaKeywords = ['agendar cita', 'quiero una cita', 'necesito cita', 'agendar diagnóstico', 'programar cita', 'cita para revisión', 'agendar'];
const wantsAppointment = agendaKeywords.some(keyword => lowerMsg.includes(keyword));

// Detectar si el usuario está proporcionando datos para cita (formato libre)
const hasPhoneNumber = /\d{10}/.test(message);
const hasVehicleInfo = /(chevrolet|nissan|toyota|ford|vw|volkswagen|honda|mazda|spark|np300|hilux|d21|ranger)/i.test(message);
const hasSucursalInfo = /cdmx|ojo de agua|edo\.? méxico|estado de méxico/i.test(message);

// Si el usuario ya tiene intención de agendar Y aún no ha dado datos
if (wantsAppointment && !hasPhoneNumber) {
    let reply = `📅 **Agendar cita en KADI**

Para agendarte una cita, necesito los siguientes datos:

1. 📝 **Nombre completo:**
2. 📱 **Teléfono / WhatsApp:**
3. 📍 **Sucursal preferida:** (CDMX u Ojo de Agua)
4. 🚗 **Vehículo:** (marca, modelo, año)
5. 🔧 **Tipo de servicio:** (diagnóstico, reparación, mantenimiento)
6. 📅 **Fecha preferida:** (opcional)

¿Me puedes proporcionar estos datos? Puedes escribirlos así:

"Nombre: Juan Pérez
Teléfono: 5573382923
Sucursal: CDMX
Vehículo: NP300 2015
Servicio: diagnóstico"`;
    
    niaSession.addMessage(userId, 'assistant', reply);
    return NextResponse.json({ reply });
}

// Si el usuario dio un número de teléfono + información de vehículo, probablemente quiere agendar
if (hasPhoneNumber && (hasVehicleInfo || hasSucursalInfo)) {
    console.log('📝 Detectando datos de cita en formato libre...');
    
    // Extraer teléfono
    const phoneMatch = message.match(/(\d{10})/);
    const telefono = phoneMatch ? phoneMatch[1] : '';
    
    // Extraer sucursal
    let sucursal = '';
    if (message.toLowerCase().includes('cdmx')) sucursal = 'CDMX';
    else if (message.toLowerCase().includes('ojo de agua')) sucursal = 'Ojo de Agua';
    
    // Extraer vehículo (buscar marca + modelo + año)
    const marcas = ['chevrolet', 'nissan', 'toyota', 'ford', 'vw', 'volkswagen', 'honda', 'mazda'];
    let vehiculo = '';
    for (const marca of marcas) {
        if (message.toLowerCase().includes(marca)) {
            vehiculo = marca;
            break;
        }
    }
    
    // Extraer año
    const yearMatch = message.match(/\b(19|20)\d{2}\b/);
    const año = yearMatch ? yearMatch[0] : '';
    if (año) vehiculo += ` ${año}`;
    
    // Extraer modelo (Spark, NP300, etc.)
    const modelos = ['spark', 'np300', 'hilux', 'd21', 'ranger', 'vento', 'ibiza'];
    for (const modelo of modelos) {
        if (message.toLowerCase().includes(modelo)) {
            vehiculo += ` ${modelo.toUpperCase()}`;
            break;
        }
    }
    
    // Extraer servicio
    let servicio = 'diagnóstico';
    if (message.toLowerCase().includes('reparación')) servicio = 'reparación';
    else if (message.toLowerCase().includes('mantenimiento')) servicio = 'mantenimiento';
    
    // Extraer fecha (DD/MM/AAAA o similar)
    const dateMatch = message.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    const fecha = dateMatch ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}` : '';
    
    if (telefono) {
        try {
            const citaData = {
                cliente_nombre: 'Pendiente',
                cliente_telefono: telefono,
                tipo_servicio: servicio,
                sucursal: sucursal || 'CDMX',
                vehiculo_marca: vehiculo,
                notas: `Vehículo: ${vehiculo} | Servicio: ${servicio} | Fecha solicitada: ${fecha} | Mensaje original: ${message.substring(0, 200)}`,
                userId: userId
            };
            
            console.log('📤 Guardando cita:', citaData);
            
            const citaResponse = await fetch('/api/citas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(citaData)
            });
            
            const citaResult = await citaResponse.json();
            console.log('📥 Respuesta:', citaResult);
            
            if (citaResult.success) {
                const reply = `✅ **¡Cita agendada con éxito!**

📋 **Resumen de tu cita:**
- Teléfono: ${telefono}
- Sucursal: ${sucursal || 'CDMX'}
- Vehículo: ${vehiculo || 'No especificado'}
- Servicio: ${servicio}
${fecha ? `- Fecha solicitada: ${fecha}` : ''}

📞 En las próximas horas, un asesor de KADI se comunicará contigo para confirmar la fecha y hora exacta, y para pedirte tu nombre completo.

📍 **Direcciones:**
• CDMX: Av. Principal #123, Col. Centro
• Ojo de Agua, Edo. Méx: Calle Principal #456, Col. Centro

¿Necesitas algo más?`;
                
                niaSession.addMessage(userId, 'assistant', reply);
                return NextResponse.json({ reply });
            } else {
                throw new Error(citaResult.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error al guardar cita:', error);
            const reply = `❌ **Lo siento, tuve un problema técnico al agendar tu cita.**

Por favor, contáctanos directamente por WhatsApp al **5573382923** o por correo a **ventas.kaditsd@gmail.com.mx** para agendar tu cita.

Disculpa las molestias.`;
            
            niaSession.addMessage(userId, 'assistant', reply);
            return NextResponse.json({ reply });
        }
    }
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