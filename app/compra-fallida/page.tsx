export default function CompraFallida() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-light mb-2">Pago no completado</h1>
        <p className="text-white/60 mb-4">
          Hubo un problema con tu pago. Puedes intentar nuevamente.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/carrito"
            className="bg-[#ef4444] text-white px-6 py-2 rounded-lg hover:bg-[#ef4444]/80 transition"
          >
            Volver al carrito
          </a>
          <a
            href="/"
            className="border border-white/20 text-white/70 px-6 py-2 rounded-lg hover:bg-white/5 transition"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}