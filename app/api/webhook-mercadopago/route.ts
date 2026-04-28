import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
                const folio = payment.external_reference;
                
                if (folio) {
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
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Error webhook:', error);
        return NextResponse.json({ success: false });
    }
}