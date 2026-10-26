import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen text-white" style={{ backgroundColor: "var(--bg-primary)" }}>
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5" style={{ backgroundColor: "rgba(15, 18, 21, 0.75)" }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link href="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-2 w-max">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2">Aviso de Privacidad</h1>
        <p className="text-white/40 text-sm mb-8">Última actualización: Octubre 2026</p>

        <div className="space-y-6 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg text-white/90 mb-2">1. Datos que Recopilamos</h2>
            <p>En KADI TS&D recopilamos información personal que tú nos proporcionas voluntariamente al crear una cuenta, realizar una compra o solicitar un servicio. Esto incluye: nombre completo, correo electrónico, número de teléfono, dirección de envío y datos fiscales (si los proporcionas). No almacenamos los datos de tus tarjetas de crédito o débito en nuestros servidores; estos son procesados de forma segura directamente por Mercado Pago.</p>
          </section>

          <section>
            <h2 className="text-lg text-white/90 mb-2">2. Uso de la Información</h2>
            <p>Utilizamos tus datos para procesar pedidos, gestionar financiamientos de mano de obra, enviar actualizaciones sobre el estado de tu reparación, y proporcionar soporte técnico a través de nuestra IA (NIA) o vía WhatsApp. No vendemos ni rentamos tu información a terceros.</p>
          </section>

          <section>
            <h2 className="text-lg text-white/90 mb-2">3. Uso de Cookies y Tecnologías de Rastreo</h2>
            <p>Nuestra plataforma utiliza cookies y píxeles de seguimiento (como el Pixel de Meta) para analizar el tráfico y mejorar la experiencia del usuario. Puedes desactivar las cookies desde la configuración de tu navegador, aunque esto podría afectar la funcionalidad de algunas partes del sitio, especialmente el carrito de compras y el inicio de sesión.</p>
          </section>

          <section>
            <h2 className="text-lg text-white/90 mb-2">4. Seguridad de los Datos</h2>
            <p>Implementamos medidas de seguridad de nivel industrial (como encriptación SSL y servidores seguros en Supabase y Vercel) para proteger tu información contra accesos no autorizados. Sin embargo, ningún sistema es 100% infalible.</p>
          </section>

          <section>
            <h2 className="text-lg text-white/90 mb-2">5. Tus Derechos ARCO</h2>
            <p>De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México), tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos. Puedes ejercer estos derechos ingresando a tu perfil o enviando un correo a ventas.kaditsd@gmail.com.mx.</p>
          </section>
        </div>
      </div>
    </main>
  );
}