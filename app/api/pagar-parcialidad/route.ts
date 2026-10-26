import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializamos Mercado Pago con tu Access Token
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { monto, folio_servicio, descripcion, email } = body;

    if (!monto || !folio_servicio) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Creamos la preferencia de pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: folio_servicio,
            title: `Parcialidad Mano de Obra - ${descripcion}`,
            quantity: 1,
            unit_price: Number(monto),
            currency_id: 'MXN',
          }
        ],
        payer: {
          email: email || 'cliente@kaditsd.com.mx',
        },
        back_urls: {
          success: 'https://www.kaditsd.com.mx/perfil',
          failure: 'https://www.kaditsd.com.mx/perfil',
          pending: 'https://www.kaditsd.com.mx/perfil',
        },
        auto_return: 'approved',
        external_reference: `MANO_OBRA_${folio_servicio}_${Date.now()}`, // Para identificar el pago
        notification_url: 'https://www.kaditsd.com.mx/api/webhooks-mercadopago', // Opcional: donde MP avisará que se pagó
      }
    });

    // Retornamos el link de pago (init_point)
    return NextResponse.json({ init_point: result.init_point });

  } catch (error: any) {
    console.error('Error creando preferencia MP:', error);
    return NextResponse.json({ error: 'Error al generar el pago' }, { status: 500 });
  }
}