import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import { CAKES } from "../data";

export default function BestSellers() {
  const track = useRef(null);
  const scroll = (dir) => track.current?.scrollBy({ left: dir * 260, behavior: "smooth" });

  return (
    <section className="bg-cream pb-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative text-center">
          <p className="text-[10px] tracking-[0.25em] text-brand">POPULAR PRODUCTS</p>
          <h2 className="mt-1 text-3xl font-medium">Our Best Selling Cakes</h2>
          <p className="mt-1 text-xs text-ink/50">Loved by many. Perfect for your special moments.</p>
          <div className="absolute right-0 top-4 hidden gap-2 md:flex">
            <button onClick={() => scroll(-1)} aria-label="Scroll left" className="grid h-7 w-7 place-items-center rounded-full border border-ink/20 hover:border-brand hover:text-brand"><ChevronLeft size={14} /></button>
            <button onClick={() => scroll(1)} aria-label="Scroll right" className="grid h-7 w-7 place-items-center rounded-full border border-ink/20 hover:border-brand hover:text-brand"><ChevronRight size={14} /></button>
          </div>
        </div>

        <div ref={track} className="mt-8 flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none]">
          {CAKES.map((c) => (
            <div key={c.id} className="w-56 shrink-0 snap-start md:flex-1">
              <ProductCard cake={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
