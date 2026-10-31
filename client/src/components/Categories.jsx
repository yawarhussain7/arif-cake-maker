import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CakeImage from "./CakeImage.jsx";
import { CATEGORIES } from "../data";

export default function Categories() {
  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[280px_1fr]">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-brand">OUR CATEGORIES</p>
          <h2 className="mt-3 text-4xl font-medium leading-tight">Explore Our Cake Collection</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">From classic favorites to unique creations, find the perfect cake for every moment.</p>
          <Link to="/cakes" className="mt-6 inline-flex items-center gap-2 rounded-sm border border-brand px-5 py-2.5 text-xs text-brand transition hover:bg-brand hover:text-white">
            View All Cakes <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={c.to} className="group relative block aspect-[3/4] overflow-hidden rounded-md">
              <CakeImage src={c.image} alt={c.name} className="h-full w-full transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-center text-white">
                <h3 className="text-xl">{c.name}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-gold">Shop Now <ArrowRight size={12} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
