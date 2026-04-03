"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = "success", onClose, duration = 2500 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case "success":
                return "✅";
            case "error":
                return "❌";
            case "info":
                return "ℹ️";
            default:
                return "🎉";
        }
    };

    const getColors = () => {
        switch (type) {
            case "success":
                return "from-emerald-500 to-green-600 border-emerald-400/30";
            case "error":
                return "from-red-500 to-rose-600 border-red-400/30";
            case "info":
                return "from-blue-500 to-indigo-600 border-blue-400/30";
            default:
                return "from-[#ef4444] to-[#f97316] border-[#ef4444]/30";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`fixed top-24 right-6 z-50 bg-gradient-to-r ${getColors()} text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm flex items-center gap-3 border max-w-md`}
        >
            <span className="text-2xl">{getIcon()}</span>
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
                <div className="w-full h-0.5 bg-white/30 rounded-full mt-2 overflow-hidden">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: duration / 1000, ease: "linear" }}
                        className="h-full bg-white/80 rounded-full"
                    />
                </div>
            </div>
            <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
            >
                ✕
            </button>
        </motion.div>
    );
}