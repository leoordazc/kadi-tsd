"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
    product: any;
    isRecommended?: boolean;
    onSelect: (product: any) => void;
    onAddToCart: (product: any) => void;  // 👈 NUEVA PROP
}

export default function ProductCard({ product, isRecommended, onSelect, onAddToCart }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    const margen = product.precio - product.costo_interno;
    const compatibility = product.marca_vehiculo?.slice(0, 3).join(', ') + (product.marca_vehiculo?.length > 3 ? '...' : '');
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`relative bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl overflow-hidden cursor-pointer transition-all ${
                isRecommended ? 'border-2 border-[#4ade80] shadow-lg shadow-[#4ade80]/20' : 'border border-white/10'
            }`}
            onClick={() => onSelect(product)}
        >
            {/* Badge de recomendado */}
            {isRecommended && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-[#4ade80] text-black text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                        <span>⭐</span>
                        <span>RECOMENDADO</span>
                    </div>
                </div>
            )}
            
            {/* Badge de stock */}
            <div className="absolute top-3 left-3 z-10">
                <div className={`text-xs px-2 py-1 rounded-full ${
                    product.stock > 5 ? 'bg-green-500/20 text-green-400' :
                    product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                }`}>
                    {product.stock > 5 ? '📦 En stock' :
                     product.stock > 0 ? '⚠️ Últimas unidades' :
                     '⏳ Bajo pedido'}
                </div>
            </div>
            
            {/* Contenido */}
            <div className="p-5">
                {/* Título y código */}
                <h3 className="text-lg font-medium text-white/90 mb-1 pr-20">
                    {product.nombre}
                </h3>
                <p className="text-xs text-white/30 mb-3">
                    Código: {product.codigo_caja}
                </p>
                
                {/* Tipo y compatibilidad */}
                <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                        product.tipo === 'Reconstruida' ? 'bg-blue-500/20 text-blue-400' :
                        product.tipo === 'Nueva' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                    }`}>
                        {product.tipo}
                    </span>
                    {product.envio_24h && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                            🚚 24h
                        </span>
                    )}
                </div>
                
                {/* Compatibilidad rápida */}
                {compatibility && (
                    <p className="text-xs text-white/20 mb-3">
                        Compatible con: {compatibility}
                    </p>
                )}
                
                {/* Precio y acciones */}
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <p className="text-xs text-white/30">Precio</p>
                        <p className="text-2xl font-light text-white/90">
                            ${product.precio.toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* Botón COMPRAR */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                isRecommended 
                                    ? 'bg-[#4ade80] text-black hover:bg-[#4ade80]/90'
                                    : 'bg-[#ef4444] text-white hover:bg-[#ef4444]/90'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                            }}
                        >
                            🛒 COMPRAR
                        </motion.button>
                        
                        {/* Botón VER detalles */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/70 hover:bg-white/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(product);
                            }}
                        >
                            🔍 VER
                        </motion.button>
                    </div>
                </div>
                
                {/* Barra de margen (sutil) */}
                <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isHovered ? `${Math.min((margen / product.precio) * 100, 100)}%` : '0%' }}
                        className="h-full bg-gradient-to-r from-[#4ade80] to-[#60a5fa]"
                    />
                </div>
            </div>
        </motion.div>
    );
}