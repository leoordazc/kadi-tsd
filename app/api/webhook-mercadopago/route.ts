import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js'; // <-- NUEVO

// <-- NUEVO: Cliente administrador para saltar el RLS en los Webhooks
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
                
                if (referencia) {
                    
                    // ========================================================
                    // 1. LÓGICA PARA MANO DE OBRA (NUEVO)
                    // ========================================================
                    if (referencia.startsWith('MANO_OBRA_')) {
                        // Extraemos el folio: MANO_OBRA_KADI-SRV-001_1712345678
                        const partes = referencia.split('_');
                        const folioServicio = partes[2]; // KADI-SRV-001
                        
                        console.log(`🔧 Procesando pago de Mano de Obra: ${folioServicio}`);

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
                                    // Si ya terminó de pagar, la garantía se queda activa
                                    garantia_activa: true 
                                })
                                .eq('id', fin.id);
                                
                            console.log(`✅ Parcialidad actualizada para ${folioServicio} (${nuevosPagos}/${fin.pagos_totales})`);
                        }

                    // ========================================================
                    // 2. LÓGICA PARA PEDIDOS FÍSICOS (TU LÓGICA ORIGINAL)
                    // ========================================================
                    } else {
                        const folio = referencia;
                        const { error } = await supabase
                            .from('pedidos')
                            .update({ status: 'pagado', updated_at: new Date().toISOString() })
                            .eq('folio', folio);
                        
                        if (error) {
                            console.error('❌ Error actualizando pedido:', error);
                        } else {
                            console.log(`✅ Pedido ${folio} actualizado a pagado`);
                            
                            // 📧 Opcional: Enviar correo al cliente
                            // await enviarCorreoConfirmacion(folio);
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