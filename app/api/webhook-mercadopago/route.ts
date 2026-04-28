import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, data } = body;
        
        if (type === 'payment') {
            const paymentId = data.id;
            
            // Obtener detalles del pago desde Mercado Pago (usando tu access token)
            const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            });
            const payment = await paymentRes.json();
            
            if (payment.status === 'approved') {
                const externalReference = payment.external_reference;
                
                // Actualizar pedido en Supabase
                await supabase
                    .from('pedidos')
                    .update({ status: 'pagado' })
                    .eq('folio', externalReference);
            }
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false });
    }
}