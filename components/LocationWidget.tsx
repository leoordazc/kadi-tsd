"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LocationWidget() {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentLocation, setCurrentLocation] = useState("CDMX");
    const locations = ["CDMX", "OJO DE AGUA EDO. MÉXICO"];

    const handleClick = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        // Cambiar texto después de medio segundo
        setTimeout(() => {
            const nextIndex = (locations.indexOf(currentLocation) + 1) % locations.length;
            setCurrentLocation(locations[nextIndex]);
        }, 500);

        // Restaurar después de 1.5 segundos
        setTimeout(() => {
            setIsAnimating(false);
        }, 1500);
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-center gap-2 cursor-pointer group"
        >
            {/* Polígono con rotación continua usando framer-motion */}
            <motion.div
                className="relative w-5 h-5"
                animate={isAnimating ? { rotate: 540 } : { rotate: 360 }}
                transition={
                    isAnimating
                        ? { duration: 0.5, repeat: 2, ease: "easeOut" }
                        : { duration: 12, repeat: Infinity, ease: "linear" }
                }
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                        <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                    </defs>
                    <polygon
                        points="50,15 70,30 80,50 70,70 50,85 30,70 20,50 30,30"
                        fill="url(#polyGrad)"
                        stroke="#ef4444"
                        strokeWidth="2"
                        opacity="0.9"
                    />
                    <circle cx="50" cy="50" r="12" fill="rgba(0,0,0,0.5)" stroke="#ef4444" strokeWidth="1.5" />
                </svg>
            </motion.div>

            {/* Texto de ubicación con animación */}
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentLocation}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/50 text-xs tracking-wider"
                >
                    {currentLocation}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}