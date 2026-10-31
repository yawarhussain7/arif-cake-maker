import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import CakeImage from "./CakeImage.jsx";
import { SLIDES } from "../data";

export default function Hero() {
  const [i, setI] = useState(0);
  const go = (n) => setI((n + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[i];
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section className="relative overflow-hidden bg-sand">
      <div className="mx-auto grid min-h-[420px] max-w-7xl items-center md:grid-cols-2">
        <div className="relative z-10 px-6 py-12 md:px-16">
          <p className="text-xs tracking-[0.25em] text-brand">{s.eyebrow.toUpperCase()}</p>
          <h1 className="mt-4 max-w-md text-5xl font-medium leading-[1.05] md:text-6xl">{s.title}</h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/70">{s.text}</p>
          <Link to="/cakes" className="mt-7 inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-dark">
            Shop Now <ArrowRight size={14} />
          </Link>
          <div className="mt-10 flex items-center gap-3 text-sm">
            <span className="font-serif text-lg">{pad(i + 1)}</span>
            <span className="text-ink/40">/ {pad(SLIDES.length)}</span>
            <span className="h-px w-24 bg-ink/30" />
          </div>
        </div>

        <div className="relative h-72 md:h-full">
          <CakeImage src={s.image} alt={s.title} className="h-full w-full" />
          <span className="absolute right-8 top-10 hidden w-32 -rotate-6 font-script text-3xl leading-tight text-gold md:block">{s.script}</span>
        </div>
      </div>

      <button onClick={() => go(i - 1)} aria-label="Previous slide" className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow hover:bg-cream">
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => go(i + 1)} aria-label="Next slide" className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow hover:bg-cream">
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        {SLIDES.map((_, n) => (
          <button key={n} onClick={() => setI(n)} aria-label={`Go to slide ${n + 1}`}
            className={`h-2.5 w-2.5 rounded-full border border-brand ${n === i ? "bg-brand" : "bg-transparent"}`} />
        ))}
      </div>
    </section>
  );
}
