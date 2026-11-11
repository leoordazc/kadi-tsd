import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Cliente administrador para saltar el RLS en los Webhooks
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '' 
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, data } = body;
        
        console.log('📥 Webhook recibido:', { type });
        
        if (type === 'payment') {
            const paymentId = data.id;
            
            // Obtener detalles del pago
            const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
            });
            const payment = await paymentRes.json();
            
            if (payment.status === 'approved') {
                const referencia = payment.external_reference;
                
                // 👇 NUEVO: Extraer datos del comprador (Payer) de forma segura
                const payerData = payment.payer || {};
                const nombreComprador = payerData.name 
                    ? `${payerData.name} ${payerData.surname || ''}`.trim() 
                    : 'Invitado';
                const emailComprador = payerData.email || 'No proporcionado';
                const telefonoComprador = payerData.phone?.number || 'No proporcionado';
                
                if (referencia) {
                    
                    // ========================================================
                    // 1. LÓGICA PARA MANO DE OBRA
                    // ========================================================
                    if (referencia.startsWith('MANO_OBRA_')) {
                        const partes = referencia.split('_');
                        const folioServicio = partes[2]; // KADI-SRV-001
                        
                        console.log(`🔧 Procesando pago de Mano de Obra: ${folioServicio} para ${nombreComprador}`);

                        const { data: fin, error: fetchError } = await supabaseAdmin
                            .from('financiamientos_mano_obra')
                            .select('*')
                            .eq('folio_servicio', folioServicio)
                            .single();

                        if (fin && !fetchError) {
                            const nuevosPagos = fin.pagos_realizados + 1;
                            
                            // Calculamos la fecha del próximo pago
                            const diasSumar = fin.frecuencia === 'semanal' ? 7 : 14;
                            const nuevaFecha = new Date();
                            nuevaFecha.setDate(nuevaFecha.getDate() + diasSumar);

                            await supabaseAdmin
                                .from('financiamientos_mano_obra')
                                .update({
                                    pagos_realizados: nuevosPagos,
                                    fecha_proximo_pago: nuevaFecha.toISOString(),
                                    garantia_activa: true 
                                })
                                .eq('id', fin.id);
                                
                            console.log(`✅ Parcialidad actualizada para ${folioServicio} (${nuevosPagos}/${fin.pagos_totales})`);
                        }

                    // ========================================================
                    // 2. LÓGICA PARA PEDIDOS FÍSICOS
                    // ========================================================
                    } else {
                        const folio = referencia;
                        
                        // 👇 ACTUALIZAMOS CON LOS DATOS DEL COMPRADOR
                        const { error } = await supabase
                            .from('pedidos')
                            .update({ 
                                status: 'pagado', 
                                updated_at: new Date().toISOString(),
                                nombre_cliente: nombreComprador, // Guardamos el nombre
                                email_cliente: emailComprador,   // Guardamos el correo
                                telefono_cliente: telefonoComprador // Guardamos el teléfono
                            })
                            .eq('folio', folio);
                        
                        if (error) {
                            console.error('❌ Error actualizando pedido:', error);
                        } else {
                            console.log(`✅ Pedido ${folio} actualizado a pagado. Comprador: ${nombreComprador} (${emailComprador})`);
                            
                            // 📧 Aquí podrías disparar un correo de confirmación
                            // await enviarCorreoConfirmacion(folio, emailComprador, nombreComprador);
                        }
                    }
                }
            }
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Error webhook:', error);
        return NextResponse.json({ success: false });
    }
}