import { useState } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import CakeImage from "./CakeImage.jsx";
import Stars from "./Stars.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ cake }) {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const badgeColor =
    cake.badge === "Sale" ? "bg-red-500" : cake.badge === "New" ? "bg-brand" : "bg-brand-dark";
  return (
    <article className="group overflow-hidden rounded-md bg-white border border-ink/10 shadow-sm hover:shadow-md transition">
      <div className="relative aspect-square">
        <CakeImage src={cake.image} alt={cake.name} className="h-full w-full" />
        {cake.badge && (
          <span className={`absolute left-2 top-2 z-10 rounded-sm px-2 py-0.5 text-[9px] font-medium tracking-wide text-white ${badgeColor}`}>
            {cake.badge.toUpperCase()}
          </span>
        )}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur hover:bg-white transition"
        >
          <Heart size={16} fill={wishlisted ? "currentColor" : "none"} stroke={wishlisted ? 0 : 1.5} className={wishlisted ? "text-red-500 fill-current" : "text-ink/60"} />
        </button>
      </div>
      <div className="px-4 pb-4 pt-3 text-center">
        <h3 className="font-sans text-xs leading-tight">{cake.name}</h3>
        <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-ink/50">
          <Stars value={cake.rating} size={10} /> ({cake.reviews})
        </div>
        <div className="mt-2 flex items-center justify-center gap-1">
          {cake.oldPrice ? (
            <>
              <span className="text-[10px] text-ink/40 line-through">${cake.oldPrice.toFixed(2)}</span>
              <span className="text-sm font-medium text-brand">${cake.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-medium">${cake.price.toFixed(2)}</span>
          )}
        </div>
        <button onClick={() => addToCart(cake)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand/50 py-1.5 text-[10px] text-brand transition hover:bg-brand hover:text-white">
          <ShoppingBag size={12} /> Add to Cart
        </button>
      </div>
    </article>
  );
}
