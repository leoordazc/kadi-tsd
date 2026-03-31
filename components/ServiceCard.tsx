"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface ServiceCardProps {
    icon: string;
    title: string;
    description: string;
    cta: string;
    color: string;
    delay?: number;
    onClick?: () => void;  // ← NUEVO: función opcional para manejar el clic
}

export default function ServiceCard({ icon, title, description, cta, color, delay = 0, onClick }: ServiceCardProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            // Comportamiento por defecto según el título
            if (title === "VENTA DE UNIDADES") {
                router.push("/catalogo");
            } else if (title === "REPARACIÓN ESPECIALIZADA") {
                const message = encodeURIComponent("Hola, quiero cotizar una reparación.");
                window.open(`https://wa.me/525573382923?text=${message}`, "_blank");
            } else if (title === "MANTENIMIENTO PREVENTIVO") {
                const message = encodeURIComponent("Hola, quiero agendar una cita para mantenimiento.");
                window.open(`https://wa.me/525573382923?text=${message}`, "_blank");
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -5 }}
            className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl overflow-hidden border border-white/5 p-8 cursor-pointer"
            onClick={handleClick}
        >
            {/* Línea superior de color */}
            <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: color }}
            />
            
            {/* Icono */}
            <div className="text-5xl mb-4">{icon}</div>
            
            {/* Título */}
            <h3 className="text-xl font-bold text-white/90 mb-3">{title}</h3>
            
            {/* Descripción */}
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
                {description}
            </p>
            
            {/* CTA */}
            <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color }}
            >
                {cta} →
            </motion.div>
            
            {/* Efecto de brillo en hover */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${color}20, transparent 70%)`
                }}
            />
        </motion.div>
    );
}