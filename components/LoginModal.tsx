"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isLogin) {
                // INICIAR SESIÓN
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                setSuccess("Sesión iniciada correctamente");
                setTimeout(() => {
                    onClose();
                    if (onLoginSuccess) onLoginSuccess();
                }, 1500);
            } else {
                // REGISTRO
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                    },
                });
                if (error) throw error;
                setSuccess("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
                setTimeout(() => {
                    onClose();
                    if (onLoginSuccess) onLoginSuccess();
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-8 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Título */}
                        <h2 className="text-2xl font-light text-white/90 mb-6">
                            {isLogin ? "Ingresar a KADI" : "Crear cuenta"}
                        </h2>

                        {/* Mensajes de error o éxito */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                                {success}
                            </div>
                        )}

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <input
                                    type="text"
                                    placeholder="Nombre completo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/90 placeholder-white/30 focus:outline-none focus:border-[#ef4444]/50"
                                    required
                                />
                            )}
                            
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/90 placeholder-white/30 focus:outline-none focus:border-[#ef4444]/50"
                                required
                            />
                            
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/90 placeholder-white/30 focus:outline-none focus:border-[#ef4444]/50"
                                required
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#ef4444] text-white py-3 rounded-lg hover:bg-[#ef4444]/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Procesando..." : (isLogin ? "Ingresar" : "Registrarse")}
                            </button>
                        </form>

                        {/* Separador */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-[#1a1a1a] px-2 text-white/30">O continúa con</span>
                            </div>
                        </div>

                        {/* Botón Google */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 text-white/70 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Continuar con Google</span>
                        </button>

                        {/* Cambiar modo */}
                        <p className="text-center text-white/40 text-sm mt-4">
                            {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className="text-[#ef4444] hover:underline"
                            >
                                {isLogin ? "Regístrate" : "Inicia sesión"}
                            </button>
                        </p>

                        {/* Cerrar */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/40 hover:text-white/60"
                        >
                            ✕
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}