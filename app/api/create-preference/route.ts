import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  const { items } = await req.json();

  const preference = {
    items: items.map((item: any) => ({
      title: item.nombre,
      quantity: item.quantity,
      currency_id: "MXN",
      unit_price: item.precio,
    })),
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_URL}/compra-exitosa`,
      failure: `${process.env.NEXT_PUBLIC_URL}/compra-fallida`,
      pending: `${process.env.NEXT_PUBLIC_URL}/compra-pendiente`,
    },
    auto_return: "approved",
    notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook`,
  };

  try {
    const preferenceClient = new Preference(client);
    const response = await preferenceClient.create({ body: preference });
    return NextResponse.json({ init_point: response.init_point });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear preferencia" }, { status: 500 });
  }
}