export default function CompraExitosa() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-light mb-2">¡Pago exitoso!</h1>
        <p className="text-white/60 mb-4">
          Tu pedido ha sido registrado correctamente.
        </p>
        <p className="text-white/40 text-sm mb-6">
          En breve recibirás un correo con los detalles de tu envío.
        </p>
        <a
          href="/"
          className="inline-block bg-[#ef4444] text-white px-6 py-2 rounded-lg hover:bg-[#ef4444]/80 transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}