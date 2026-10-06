"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LocationWidget() {
    const [currentLocation, setCurrentLocation] = useState("CEDIS Acolman");
    const locations = ["CEDIS Acolman", "55870 EDO. MÉXICO"];

    const handleClick = () => {
        const nextIndex = (locations.indexOf(currentLocation) + 1) % locations.length;
        setCurrentLocation(locations[nextIndex]);
    };

    return (
        <div
            onClick={handleClick}
            className="cursor-pointer group"
            title="Cambiar ubicación"
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentLocation}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.25 }}
                    className="text-white/50 text-xs tracking-wider group-hover:text-white/80 transition-colors block"
                >
                    {currentLocation}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}