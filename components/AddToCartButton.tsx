"use client";

import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  product: any;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      className="bg-[#ef4444] text-white px-8 py-3 rounded-lg hover:bg-[#ef4444]/80 transition"
    >
      Agregar al carrito
    </button>
  );
}