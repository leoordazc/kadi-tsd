import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, eventId, eventData, userData } = body;

    const accessToken = process.env.FB_PIXEL_ACCESS_TOKEN;
    const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

    if (!accessToken || !pixelId) {
      return NextResponse.json({ success: false, error: 'Missing Pixel credentials' }, { status: 400 });
    }

    // Estructuramos el payload exactamente como lo pide la API de Conversiones de Meta (CAPI)
    const payload = {
      data: [
        {
          event_name: eventName || 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: 'https://www.kaditsd.com.mx/checkout',
          action_source: 'website',
          user_data: {
            em: userData?.email ? [Buffer.from(userData.email.trim().toLowerCase()).toString('hex')] : undefined,
            ph: userData?.phone ? [Buffer.from(userData.phone.replace(/\D/g, '')).toString('hex')] : undefined,
            external_id: userData?.external_id ? [Buffer.from(String(userData.external_id)).toString('hex')] : undefined,
          },
          custom_data: {
            value: eventData?.value || 0,
            currency: eventData?.currency || 'MXN',
            content_ids: eventData?.content_ids || [],
            content_type: eventData?.content_type || 'product',
            num_items: eventData?.num_items || 1,
            order_id: eventData?.order_id
          }
        }
      ],
      // access_token: accessToken // Opcional si lo pasas por URL de Meta
    };

    // Petición directa a la Graph API de Meta (Más confiable y sin depender de librerías intermedias que se traban)
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error de Meta CAPI:', result);
      return NextResponse.json({ success: false, error: result }, { status: 400 });
    }

    console.log('✅ Evento enviado correctamente a Meta CAPI:', result);
    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error('❌ Error interno en /api/fb-events:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}