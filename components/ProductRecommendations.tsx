"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";

interface ProductRecommendationsProps {
    products: any[];
    onProductSelect: (product: any) => void;
    onAddToCart?: (product: any) => void;  // ✅ Opcional
}

export default function ProductRecommendations({ 
    products, 
    onProductSelect, 
    onAddToCart  // ✅ Puede ser undefined
}: ProductRecommendationsProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    
    if (!products || products.length === 0) return null;
    
    const productsWithScore = products.map(p => ({
        ...p,
        score: ((p.precio - p.costo_interno) * 0.7) + (p.stock * 10)
    }));
    
    const sortedProducts = productsWithScore.sort((a, b) => b.score - a.score);
    const bestProduct = sortedProducts[0];
    const otherProducts = sortedProducts.slice(1, 4);
    
    return (
        <div className="space-y-6">
            {bestProduct && (
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-[#4ade80] text-sm font-medium">⭐ MEJOR OPCIÓN</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#4ade80] to-transparent" />
                    </div>
                    <ProductCard
                        product={bestProduct}
                        isRecommended={true}
                        onSelect={onProductSelect}
                        onAddToCart={onAddToCart}  // ✅ Puede ser undefined
                    />
                </div>
            )}
            
            {otherProducts.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-white/30 text-sm font-medium">📋 OTRAS OPCIONES</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {otherProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onSelect={onProductSelect}
                                onAddToCart={onAddToCart}  // ✅ Puede ser undefined
                            />
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-4 text-xs text-white/20 text-center">
                <span className="text-[#4ade80]">●</span> Todos los productos incluyen garantía · Envío a todo México
            </div>
        </div>
    );
}