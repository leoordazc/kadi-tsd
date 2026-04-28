import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { items, external_reference } = await req.json();

    const preference = {
      items: items.map((item: any) => ({
        title: item.nombre,
        quantity: item.quantity,
        currency_id: "MXN",
        unit_price: item.precio,
      })),
      external_reference: external_reference, // 👈 Folio KADI-XXXXX
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/perfil`,
        failure: `${process.env.NEXT_PUBLIC_URL}/catalogo`,
        pending: `${process.env.NEXT_PUBLIC_URL}/perfil`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook-mercadopago`,
    };

    const preferenceClient = new Preference(client);
    const response = await preferenceClient.create({ body: preference });
    
    return NextResponse.json({ init_point: response.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return NextResponse.json({ error: "Error al crear preferencia" }, { status: 500 });
  }
}