"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/Toast";

interface Producto {
    id: string;
    nombre: string;
    codigo_caja: string;
    tipo: 'Reconstruida' | 'Usada' | 'Nueva';
    precio: number;
    stock: number;
    descripcion?: string;
    imagen_url?: string;
    imagenes_extra?: string[];
    marca_vehiculo?: string[];
    modelo_vehiculo?: string[];
    año_inicio?: number;
    año_fin?: number;
    especificaciones?: any;
    notas_instalacion?: string;
}

interface Comentario {
    id: string;
    nombre: string;
    avatar: string;
    fecha: string;
    rating: number;
    texto: string;
    verificado: boolean;
}

interface Pregunta {
    id: string;
    nombre: string;
    fecha: string;
    pregunta: string;
    respuesta?: string;
    respondidoPor?: string;
}

const COMENTARIOS_EJEMPLO: Comentario[] = [
    {
        id: "1",
        nombre: "Carlos M.",
        avatar: "C",
        fecha: "Hace 2 semanas",
        rating: 5,
        texto: "Excelente calidad, llegó bien empacada y funcionó perfecto en mi Beat 2019. El envío fue rápido y el folio me sirvió para dar seguimiento.",
        verificado: true,
    },
    {
        id: "2",
        nombre: "Roberto H.",
        avatar: "R",
        fecha: "Hace 1 mes",
        rating: 5,
        texto: "Ya llevo 3 compras con KADI y siempre buena atención. La transmisión quedó como nueva, 100% recomendado.",
        verificado: true,
    },
    {
        id: "3",
        nombre: "Luis Fernando",
        avatar: "L",
        fecha: "Hace 1 mes",
        rating: 4,
        texto: "Buena pieza, aunque tardó un día más de lo esperado. La calidad es indiscutible y el precio muy justo.",
        verificado: true,
    },
];

const PREGUNTAS_EJEMPLO: Pregunta[] = [
    {
        id: "1",
        nombre: "Miguel A.",
        fecha: "Hace 3 días",
        pregunta: "¿Esta transmisión le queda a un Spark Classic 2015 motor 1.2?",
        respuesta: "Sí, es compatible directamente con Spark Classic 2011-2017 motor 1.2L. Cualquier duda adicional puedes consultarnos por WhatsApp.",
        respondidoPor: "KADI TS&D",
    },
    {
        id: "2",
        nombre: "Alejandra R.",
        fecha: "Hace 1 semana",
        pregunta: "¿Manejan envío a Monterrey? ¿Cuánto tarda?",
        respuesta: "Sí, enviamos a todo México. A Monterrey llega en 2-3 días hábiles con guía rastreable.",
        respondidoPor: "KADI TS&D",
    },
    {
        id: "3",
        nombre: "Diego",
        fecha: "Hace 2 semanas",
        pregunta: "¿Qué incluye el paquete? ¿Viene con aceite?",
        respuesta: "La transmisión va sin aceite por cuestiones de logística. Recomendamos aceite 75W-85 GL-4 sintético como indica la cláusula de garantía.",
        respondidoPor: "KADI TS&D",
    },
];

export default function ProductoDetallePage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);

    // ===== ESTADOS REALES DESDE SUPABASE =====
    const [user, setUser] = useState<any>(null);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [showPreguntaInput, setShowPreguntaInput] = useState(false);
    const [nuevaPregunta, setNuevaPregunta] = useState("");
    const [showComentarioInput, setShowComentarioInput] = useState(false);
    const [nuevoComentario, setNuevoComentario] = useState({ rating: 5, texto: "" });
    const [cargandoInteracciones, setCargandoInteracciones] = useState(true);
    const promedioRating = comentarios.length > 0
        ? comentarios.reduce((acc, c) => acc + c.rating, 0) / comentarios.length
        : 0;

    const allImages = producto ? [
        producto.imagen_url,
        ...(producto.imagenes_extra || [])
    ].filter((img): img is string => Boolean(img) && typeof img === 'string') : [];

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const { data, error } = await supabase
                    .from('productos')
                    .select('*')
                    .eq('codigo_caja', params.slug)
                    .single();

                if (error) throw error;
                if (!data) {
                    setError("Producto no encontrado");
                    return;
                }
                setProducto(data);
                if (data?.imagen_url) {
                    setSelectedImage(data.imagen_url);
                }
            } catch (err: any) {
                console.error("❌ Error:", err);
                setError(`Error: ${err.message || "Producto no encontrado"}`);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchProducto();
        }
    }, [params.slug]);

    const nextImage = () => {
        if (allImages.length === 0) return;
        const nextIndex = (currentImageIndex + 1) % allImages.length;
        setCurrentImageIndex(nextIndex);
        setSelectedImage(allImages[nextIndex] || "");
    };

    const prevImage = () => {
        if (allImages.length === 0) return;
        const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
        setCurrentImageIndex(prevIndex);
        setSelectedImage(allImages[prevIndex] || "");
    };

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: producto?.nombre || "KADI TS&D",
            text: `Mira esta pieza: ${producto?.nombre}`,
            url: url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {}
        } else {
            await navigator.clipboard.writeText(url);
            setToast({ message: "Enlace copiado al portapapeles", type: "success" });
            setTimeout(() => setToast(null), 2500);
        }
    };

    const handleSave = () => {
        setSaved(!saved);
        setToast({
            message: saved ? "Eliminado de guardados" : "Guardado en tus favoritos",
            type: "success"
        });
        setTimeout(() => setToast(null), 2000);
    };

    const handleEnviarPregunta = () => {
        if (!nuevaPregunta.trim()) return;
        const nueva: Pregunta = {
            id: Date.now().toString(),
            nombre: "Tú",
            fecha: "Ahora",
            pregunta: nuevaPregunta,
        };
        setPreguntas([nueva, ...preguntas]);
        setNuevaPregunta("");
        setShowPreguntaInput(false);
        setToast({ message: "Pregunta enviada. Te responderemos pronto.", type: "success" });
        setTimeout(() => setToast(null), 2500);
    };

    if (loading) {
        return (
            <div
                className="min-h-screen text-white flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-primary)" }}
            >
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: "var(--kadi-gold)", borderTopColor: "transparent" }}
                    />
                    <p className="text-white/40 text-sm">Cargando producto...</p>
                </div>
            </div>
        );
    }

    if (error || !producto) {
        return (
            <div
                className="min-h-screen text-white flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-primary)" }}
            >
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Producto no encontrado"}</p>
                    <p className="text-white/30 text-xs mb-4">Código buscado: {params.slug}</p>
                    <Link
                        href="/catalogo"
                        className="hover:underline transition-colors"
                        style={{ color: "var(--kadi-gold)" }}
                    >
                        Volver al catálogo
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main
            className="min-h-screen text-white"
            style={{ backgroundColor: "var(--bg-primary)" }}
        >
            {/* Header */}
            <header
                className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5"
                style={{ backgroundColor: "rgba(15, 18, 21, 0.75)" }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/catalogo" className="flex items-center gap-2 group">
                            <motion.span
                                className="text-xl group-hover:-translate-x-1 transition-transform"
                                style={{ color: "var(--kadi-gold)" }}
                            >
                                ←
                            </motion.span>
                            <span className="text-white/70 group-hover:text-white text-sm sm:text-base">Volver al catálogo</span>
                        </Link>
                        <h1 className="text-base sm:text-2xl font-light">
                            Detalle del{" "}
                            <span
                                className="text-transparent bg-clip-text"
                                style={{
                                    backgroundImage: "linear-gradient(90deg, #1e4a8c, #2a5ca8, #D4AF37)",
                                }}
                            >
                                producto
                            </span>
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">

                {/* ============================================ */}
                {/* 1. TÍTULO DEL PRODUCTO (arriba de todo)      */}
                {/* ============================================ */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-light mb-2">
                        {producto.nombre}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-white/40 text-xs sm:text-sm">
                            Código: {producto.codigo_caja}
                        </span>
                        <span
                            className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                            style={{
                                backgroundColor:
                                    producto.tipo === "Reconstruida" ? "rgba(212, 175, 55, 0.15)" :
                                    producto.tipo === "Nueva" ? "rgba(30, 74, 140, 0.25)" :
                                    "rgba(161, 168, 176, 0.15)",
                                color:
                                    producto.tipo === "Reconstruida" ? "var(--kadi-gold)" :
                                    producto.tipo === "Nueva" ? "var(--kadi-blue-bright)" :
                                    "var(--text-secondary)",
                            }}
                        >
                            {producto.tipo}
                        </span>
                        <span className="text-[10px] sm:text-xs text-white/40">
                            Stock: {producto.stock} {producto.stock === 1 ? "unidad" : "unidades"}
                        </span>
                    </div>
                </div>

                {/* ============================================ */}
                {/* 2. FILA 1: IMAGEN (izq) + PRECIO Y AGREGAR (der) */}
                {/* ============================================ */}
                <div className="grid md:grid-cols-2 gap-6 sm:gap-12 mb-8 sm:mb-12">
                    {/* IMAGEN + CARRUSEL */}
                    <div className="space-y-3 sm:space-y-4">
                        <div
                            className="relative w-full aspect-square max-h-[350px] sm:max-h-[500px] md:max-h-none rounded-2xl overflow-hidden border border-white/10"
                            style={{
                                background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)`,
                            }}
                        >
                            {selectedImage ? (
                                <>
                                    <Image
                                        src={selectedImage}
                                        alt={producto.nombre}
                                        fill
                                        className="object-contain p-2 sm:p-4"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                    />

                                    {allImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all backdrop-blur-sm text-xs sm:text-base text-white/80 hover:text-white"
                                                style={{ backgroundColor: "rgba(15, 18, 21, 0.6)" }}
                                            >
                                                ◀
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all backdrop-blur-sm text-xs sm:text-base text-white/80 hover:text-white"
                                                style={{ backgroundColor: "rgba(15, 18, 21, 0.6)" }}
                                            >
                                                ▶
                                            </button>
                                            <div
                                                className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 backdrop-blur-sm text-white/80 text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full"
                                                style={{ backgroundColor: "rgba(15, 18, 21, 0.6)" }}
                                            >
                                                {currentImageIndex + 1} / {allImages.length}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-6xl">🔧</span>
                                </div>
                            )}
                        </div>

                        {/* Miniaturas */}
                        {allImages.length > 1 && (
                            <div className="miniaturas-scroll">
                                <div className="miniaturas-track">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedImage(img);
                                                setCurrentImageIndex(idx);
                                            }}
                                            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImage === img
                                                    ? ''
                                                    : 'border-white/20 hover:border-white/50'
                                            }`}
                                            style={
                                                selectedImage === img
                                                    ? {
                                                        borderColor: "var(--kadi-gold)",
                                                        boxShadow: "0 0 12px rgba(212, 175, 55, 0.3)"
                                                    }
                                                    : {}
                                            }
                                        >
                                            <Image
                                                src={img}
                                                alt={`Vista ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                                        {/* PRECIO + BOTÓN AGREGAR + MÉTODOS DE PAGO */}
                    <div className="flex flex-col justify-center">
                        <div
                            className="rounded-2xl border p-6 sm:p-8"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.02)",
                                borderColor: "rgba(255, 255, 255, 0.08)",
                            }}
                        >
                            <p className="text-white/40 text-sm mb-1">Precio</p>
                            <p className="text-4xl sm:text-5xl font-light mb-2">
                                ${producto.precio.toLocaleString()}
                            </p>
                            <p className="text-white/30 text-xs mb-6">IVA INCLUIDO</p>

                            {/* ===== MENSAJE MSI ===== */}
                            <div
                                className="rounded-xl p-4 mb-5 flex items-start gap-3"
                                style={{
                                    backgroundColor: "rgba(212, 175, 55, 0.08)",
                                    border: "1px solid rgba(212, 175, 55, 0.25)",
                                }}
                            >
                                <span className="text-2xl flex-shrink-0">💳</span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white/90 mb-1">
                                        ¡Paga en hasta <span style={{ color: "var(--kadi-gold)" }}>24 cuotas sin interés</span>!
                                    </p>
                                    <p className="text-xs text-white/50 leading-relaxed">
                                        Disponible con tarjetas de crédito participantes. Consulta plazos al finalizar la compra.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    addToCart(producto);
                                    setToast({ message: `${producto.nombre} agregado al carrito`, type: "success" });
                                    setTimeout(() => setToast(null), 2500);
                                }}
                                className="btn-agregar w-full text-white py-4 px-6 rounded-lg font-medium transition-all active:scale-95 relative overflow-hidden group"
                                style={{
                                    background: "linear-gradient(90deg, var(--kadi-blue), var(--kadi-blue-bright))",
                                    boxShadow: "0 8px 20px rgba(30, 74, 140, 0.3)",
                                }}
                            >
                                <span className="btn-line btn-line-top"></span>
                                <span className="btn-line btn-line-right"></span>
                                <span className="btn-line btn-line-bottom"></span>
                                <span className="btn-line btn-line-left"></span>
                                <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                                    🛒 Agregar al carrito
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    const message = encodeURIComponent(
                                        `Hola, tengo una consulta sobre ${producto.nombre} (Código: ${producto.codigo_caja})`
                                    );
                                    window.open(`https://wa.me/5573382923?text=${message}`, "_blank");
                                }}
                                className="w-full mt-3 bg-white/5 border border-white/10 rounded-lg py-3 text-white/70 hover:bg-white/10 transition text-sm"
                            >
                                💬 Consultar con un experto
                            </button>

                            {/* ===== MÉTODOS DE PAGO ACEPTADOS ===== */}
                            <div className="mt-6 pt-5 border-t border-white/10">
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-4">
                                    Métodos de pago aceptados
                                </p>

                                {/* Meses sin Tarjeta (Mercado Crédito) */}
                                <div className="mb-4">
                                    <p className="text-xs text-white/50 mb-2">Meses sin Tarjeta</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-7 px-3 rounded-md flex items-center text-[10px] font-semibold"
                                            style={{
                                                backgroundColor: "rgba(0, 158, 227, 0.15)",
                                                border: "1px solid rgba(0, 158, 227, 0.3)",
                                                color: "#009ee3",
                                            }}
                                        >
                                            Mercado Pago
                                        </div>
                                    </div>
                                </div>

                                {/* Tarjetas de crédito */}
                                <div className="mb-4">
                                    <p className="text-xs text-white/50 mb-2">Tarjetas de crédito</p>
                                    <div className="flex items-center gap-3">
                                        {/* Mastercard */}
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-7 h-4 rounded-sm bg-gradient-to-r from-red-500 to-yellow-500"></div>
                                            <span className="text-[10px] text-white/50">Mastercard</span>
                                        </div>
                                        {/* American Express */}
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-7 h-4 rounded-sm bg-blue-600 flex items-center justify-center">
                                                <span className="text-[6px] text-white font-bold">AMEX</span>
                                            </div>
                                        </div>
                                        {/* Visa */}
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-7 h-4 rounded-sm bg-blue-800 flex items-center justify-center">
                                                <span className="text-[6px] text-white font-bold">VISA</span>
                                                                           </div>
                            </div>
                        </div>
                    </div>
                </div>

                                {/* Tarjetas de débito */}
                                <div>
                                    <p className="text-xs text-white/50 mb-2">Tarjetas de débito</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-7 h-4 rounded-sm bg-gradient-to-r from-red-500 to-yellow-500"></div>
                                            <span className="text-[10px] text-white/50">Mastercard</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-7 h-4 rounded-sm bg-blue-800 flex items-center justify-center">
                                                <span className="text-[6px] text-white font-bold">VISA</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-2">
                                        Aceptamos débito Visa y Mastercard de cualquier banco.
                                    </p>
                                </div>

                                {/* Badge de seguridad */}
                                <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
                                    <span className="text-xs">🔒</span>
                                    <span className="text-[10px] text-white/30">
                                        Procesado de forma segura por Mercado Pago
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* ============================================ */}
                {/* 3. FILA 2: INTERACCIÓN (izq) + ESPECIFICACIONES (der) */}
                {/* ============================================ */}
                <div className="grid md:grid-cols-2 gap-6 sm:gap-12">

                    {/* ===== COLUMNA IZQUIERDA: INTERACCIÓN SOCIAL ===== */}
                    {/* En móvil va al final (order-2), en desktop va izquierda (order-1) */}
                    <div className="space-y-4 order-2 md:order-1">

                        {/* BOTONES DE INTERACCIÓN SOCIAL */}
                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    setLiked(!liked);
                                    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl border transition-all text-sm"
                                style={{
                                    backgroundColor: liked ? "rgba(212, 175, 55, 0.15)" : "rgba(255, 255, 255, 0.03)",
                                    borderColor: liked ? "rgba(212, 175, 55, 0.4)" : "rgba(255, 255, 255, 0.08)",
                                    color: liked ? "var(--kadi-gold)" : "rgba(255,255,255,0.6)",
                                }}
                            >
                                <span className="text-base">{liked ? "❤️" : "🤍"}</span>
                                <span className="font-medium">{likesCount}</span>
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl border transition-all text-sm text-white/60 hover:text-white"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                                    borderColor: "rgba(255, 255, 255, 0.08)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(42, 92, 168, 0.4)";
                                    e.currentTarget.style.backgroundColor = "rgba(42, 92, 168, 0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span className="font-medium">Compartir</span>
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl border transition-all text-sm"
                                style={{
                                    backgroundColor: saved ? "rgba(30, 74, 140, 0.15)" : "rgba(255, 255, 255, 0.03)",
                                    borderColor: saved ? "rgba(42, 92, 168, 0.4)" : "rgba(255, 255, 255, 0.08)",
                                    color: saved ? "var(--kadi-blue-bright)" : "rgba(255,255,255,0.6)",
                                }}
                            >
                                <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                <span className="font-medium">{saved ? "Guardado" : "Guardar"}</span>
                            </button>
                        </div>

                        {/* CALIFICACIÓN */}
                        <div
                            className="rounded-xl border p-4 sm:p-5"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.03)",
                                borderColor: "rgba(255, 255, 255, 0.08)",
                            }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs uppercase tracking-wider text-white/40">Calificación</span>
                                <span className="text-xs text-white/30">{comentarios.length} reseñas</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-4xl font-light" style={{ color: "var(--kadi-gold)" }}>
                                    {promedioRating.toFixed(1)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex gap-0.5 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className="text-lg"
                                                style={{
                                                    color: star <= Math.round(promedioRating)
                                                        ? "var(--kadi-gold)"
                                                        : "rgba(255,255,255,0.15)"
                                                }}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-white/40">
                                        Basado en compras verificadas
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* COMENTARIOS */}
                        <div
                            className="rounded-xl border overflow-hidden"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.03)",
                                borderColor: "rgba(255, 255, 255, 0.08)",
                            }}
                        >
                            <div className="p-4 border-b border-white/5">
                                <h3 className="text-sm font-medium text-white/90">
                                    Comentarios ({comentarios.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-white/5">
                                {comentarios.map((c) => (
                                    <div key={c.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium"
                                                style={{
                                                    background: "linear-gradient(135deg, #1e4a8c, #2a5ca8)",
                                                    color: "white",
                                                }}
                                            >
                                                {c.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-sm font-medium text-white/90">{c.nombre}</span>
                                                    {c.verificado && (
                                                        <span
                                                            className="text-[9px] px-1.5 py-0.5 rounded-full"
                                                            style={{
                                                                backgroundColor: "rgba(212, 175, 55, 0.15)",
                                                                color: "var(--kadi-gold)",
                                                            }}
                                                        >
                                                            ✓ Compra verificada
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <span
                                                                key={star}
                                                                className="text-xs"
                                                                style={{
                                                                    color: star <= c.rating
                                                                        ? "var(--kadi-gold)"
                                                                        : "rgba(255,255,255,0.15)"
                                                                }}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-white/30">{c.fecha}</span>
                                                </div>
                                                <p className="text-xs text-white/60 leading-relaxed">{c.texto}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PREGUNTAS */}
                        <div
                            className="rounded-xl border overflow-hidden"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.03)",
                                borderColor: "rgba(255, 255, 255, 0.08)",
                            }}
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-sm font-medium text-white/90">
                                    Preguntas ({preguntas.length})
                                </h3>
                                <button
                                    onClick={() => setShowPreguntaInput(!showPreguntaInput)}
                                    className="text-xs font-medium transition-colors hover:opacity-80"
                                    style={{ color: "var(--kadi-gold)" }}
                                >
                                    {showPreguntaInput ? "Cancelar" : "+ Preguntar"}
                                </button>
                            </div>

                            <AnimatePresence>
                                {showPreguntaInput && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-b border-white/5"
                                    >
                                        <div className="p-4 space-y-2">
                                            <textarea
                                                value={nuevaPregunta}
                                                onChange={(e) => setNuevaPregunta(e.target.value)}
                                                placeholder="Escribe tu pregunta sobre este producto..."
                                                rows={3}
                                                className="w-full rounded-lg p-3 text-sm text-white/90 placeholder-white/30 focus:outline-none resize-none transition"
                                                style={{
                                                    backgroundColor: "rgba(15, 18, 21, 0.6)",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                }}
                                                onFocus={(e) => {
                                                    e.currentTarget.style.borderColor = "var(--kadi-gold)";
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                                }}
                                            />
                                            <button
                                                onClick={handleEnviarPregunta}
                                                disabled={!nuevaPregunta.trim()}
                                                className="w-full py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-30"
                                                style={{
                                                    background: "linear-gradient(90deg, var(--kadi-blue), var(--kadi-blue-bright))",
                                                }}
                                            >
                                                Enviar pregunta
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="divide-y divide-white/5">
                                {preguntas.map((p) => (
                                    <div key={p.id} className="p-4 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white/90">{p.nombre}</span>
                                            <span className="text-[10px] text-white/30">· {p.fecha}</span>
                                        </div>
                                        <p className="text-xs text-white/70 leading-relaxed">
                                            <span className="mr-1" style={{ color: "var(--kadi-gold)" }}>P:</span>
                                            {p.pregunta}
                                        </p>
                                        {p.respuesta && (
                                            <div
                                                className="ml-3 pl-3 py-2 rounded-r-lg"
                                                style={{
                                                    borderLeft: "2px solid var(--kadi-gold)",
                                                    backgroundColor: "rgba(212, 175, 55, 0.05)",
                                                }}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-medium" style={{ color: "var(--kadi-gold)" }}>
                                                        {p.respondidoPor}
                                                    </span>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(212, 175, 55, 0.15)", color: "var(--kadi-gold)" }}>
                                                        ✓ Oficial
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/60 leading-relaxed">{p.respuesta}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ===== COLUMNA DERECHA: ESPECIFICACIONES ===== */}
                    {/* En móvil va primero (order-1), en desktop va derecha (order-2) */}
                    <div className="order-1 md:order-2">
                        {producto.descripcion && (
                            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
                                {producto.descripcion}
                            </p>
                        )}

                        {(producto.marca_vehiculo && producto.marca_vehiculo.length > 0) ||
                         (producto.modelo_vehiculo && producto.modelo_vehiculo.length > 0) ? (
                            <div className="border-t border-white/10 pt-4 mb-6">
                                <h3 className="text-sm font-medium text-white/70 mb-3">📌 Compatibilidad</h3>
                                {producto.marca_vehiculo && producto.marca_vehiculo.length > 0 && (
                                    <p className="text-sm text-white/50 mb-1">Marcas: {producto.marca_vehiculo.join(", ")}</p>
                                )}
                                {producto.modelo_vehiculo && producto.modelo_vehiculo.length > 0 && (
                                    <p className="text-sm text-white/50 mb-1">Modelos: {producto.modelo_vehiculo.join(", ")}</p>
                                )}
                                {(producto.año_inicio || producto.año_fin) && (
                                    <p className="text-sm text-white/50">Años: {producto.año_inicio} - {producto.año_fin}</p>
                                )}
                            </div>
                        ) : null}

                        {producto.especificaciones && Object.keys(producto.especificaciones).length > 0 && (
                            <div className="border-t border-white/10 pt-4 mb-6">
                                <h3 className="text-sm font-medium text-white/70 mb-3">⚙️ Especificaciones técnicas</h3>
                                <ul className="space-y-1.5">
                                    {Object.entries(producto.especificaciones).map(([key, value]) => (
                                        <li key={key} className="text-sm text-white/50">
                                            <span className="text-white/70 capitalize">{key.replace(/_/g, " ")}:</span> {String(value)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {producto.notas_instalacion && (
                            <div className="border-t border-white/10 pt-4">
                                <h3 className="text-sm font-medium text-white/70 mb-3">🔧 Notas de instalación</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{producto.notas_instalacion}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

           {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* ===== BARRA STICKY EN MÓVIL ===== */}
            <div
                className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 py-3 border-t backdrop-blur-xl flex items-center gap-3"
                style={{
                    backgroundColor: "rgba(15, 18, 21, 0.95)",
                    borderColor: "rgba(212, 175, 55, 0.2)",
                }}
            >
                <div className="flex-shrink-0">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Precio</p>
                    <p className="text-lg font-light text-white">${producto.precio.toLocaleString()}</p>
                </div>

                <button
                    onClick={() => {
                        addToCart(producto);
                        setToast({ message: `${producto.nombre} agregado al carrito`, type: "success" });
                        setTimeout(() => setToast(null), 2500);
                    }}
                    className="btn-agregar flex-1 text-white py-3 px-4 rounded-lg font-medium transition-all active:scale-95 relative overflow-hidden"
                    style={{
                        background: "linear-gradient(90deg, var(--kadi-blue), var(--kadi-blue-bright))",
                        boxShadow: "0 8px 20px rgba(30, 74, 140, 0.4)",
                    }}
                >
                    <span className="btn-line btn-line-top"></span>
                    <span className="btn-line btn-line-right"></span>
                    <span className="btn-line btn-line-bottom"></span>
                    <span className="btn-line btn-line-left"></span>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-semibold">
                        🛒 Agregar
                    </span>
                </button>
            </div>

            {/* ===== ESTILOS PARA EL BOTÓN CON BORDE NEÓN ANIMADO ===== */}
            <style jsx>{`
                .btn-agregar {
                    position: relative;
                    overflow: hidden;
                }

                .btn-line {
                    position: absolute;
                    display: block;
                    pointer-events: none;
                }

                .btn-line-top {
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
                    animation: btnAnimate1 2s linear infinite;
                }

                .btn-line-right {
                    top: -100%;
                    right: 0;
                    width: 2px;
                    height: 100%;
                    background: linear-gradient(180deg, transparent, #D4AF37, transparent);
                    animation: btnAnimate2 2s linear infinite;
                    animation-delay: 0.5s;
                }

                .btn-line-bottom {
                    bottom: 0;
                    right: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(270deg, transparent, #D4AF37, transparent);
                    animation: btnAnimate3 2s linear infinite;
                    animation-delay: 1s;
                }

                .btn-line-left {
                    bottom: -100%;
                    left: 0;
                    width: 2px;
                    height: 100%;
                    background: linear-gradient(360deg, transparent, #D4AF37, transparent);
                    animation: btnAnimate4 2s linear infinite;
                    animation-delay: 1.5s;
                }

                @keyframes btnAnimate1 {
                    0% { left: -100%; }
                    50%, 100% { left: 100%; }
                }
                @keyframes btnAnimate2 {
                    0% { top: -100%; }
                    50%, 100% { top: 100%; }
                }
                @keyframes btnAnimate3 {
                    0% { right: -100%; }
                    50%, 100% { right: 100%; }
                }
                @keyframes btnAnimate4 {
                    0% { bottom: -100%; }
                    50%, 100% { bottom: 100%; }
                }

                .btn-agregar:hover {
                    box-shadow:
                        0 8px 20px rgba(30, 74, 140, 0.4),
                        0 0 20px rgba(212, 175, 55, 0.4),
                        0 0 40px rgba(212, 175, 55, 0.2);
                }

                .btn-agregar:active {
                    transform: scale(0.96);
                }
            `}</style>
        </main>
    );
}