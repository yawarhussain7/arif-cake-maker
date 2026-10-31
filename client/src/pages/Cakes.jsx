import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ArrowRight, X } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";
import { CAKES, CAKE_COUNT } from "../data";

const SORT_OPTIONS = ["Popularity", "Price: Low to High", "Price: High to Low", "Rating"];

const HERO_IMAGE = "https://images.unsplash.com/photo-gRZYR210m0U?auto=format&fit=crop&w=1400&q=80";

const INFO_ITEMS = [
  { icon: "leaf", title: "Premium Ingredients", text: "Only the finest, freshest ingredients." },
  { icon: "heart", title: "Handcrafted with Love", text: "Made with care by our expert bakers." },
  { icon: "shield-check", title: "Secure Payments", text: "100% secure and encrypted." },
  { icon: "truck", title: "Fast & Reliable Delivery", text: "On time, every time." },
];

export default function Cakes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState(searchParams.get("sort") || "Popularity");
  const [activePrice, setActivePrice] = useState(searchParams.get("price") || "$20 - $40");
  const [activeFlavors, setActiveFlavors] = useState(
    searchParams.get("flavor")?.split(",").filter(Boolean) || []
  );
  const [activeDietary, setActiveDietary] = useState(
    searchParams.get("dietary")?.split(",").filter(Boolean) || []
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateFilters = (changes) => {
    setActivePrice((prev) => (changes.price !== undefined ? changes.price : prev));
    setActiveFlavors((prev) => {
      if (changes.flavor === undefined) return prev;
      const next = prev.includes(changes.flavor)
        ? prev.filter((f) => f !== changes.flavor)
        : [...prev, changes.flavor];
      return next;
    });
    setActiveDietary((prev) => {
      if (changes.dietary === undefined) return prev;
      const next = prev.includes(changes.dietary)
        ? prev.filter((d) => d !== changes.dietary)
        : [...prev, changes.dietary];
      return next;
    });
  };

  const filtered = useMemo(() => {
    return CAKES.filter((cake) => {
      if (activePrice && activePrice !== "All") {
        const p = cake.price;
        if (activePrice === "Under $20" && p >= 20) return false;
        if (activePrice === "$20 - $40" && (p < 20 || p > 40)) return false;
        if (activePrice === "$40 - $60" && (p < 40 || p > 60)) return false;
        if (activePrice === "$60 - $80" && (p < 60 || p > 80)) return false;
        if (activePrice === "$80+" && p < 80) return false;
      }
      if (activeFlavors.length && !activeFlavors.includes(cake.flavor)) return false;
      if (activeDietary.length && !activeDietary.includes(cake.dietary)) return false;
      return true;
    });
  }, [activePrice, activeFlavors, activeDietary]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "Price: Low to High") arr.sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") arr.sort((a, b) => b.price - a.price);
    if (sort === "Rating") arr.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    return arr;
  }, [filtered, sort]);

  const pageSize = 12;
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const [page, setPage] = useState(1);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <section className="relative bg-sand overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="Hero cake" className="h-[420px] w-full object-cover object-center" loading="eager" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-3xl text-center">
            <p className="text-[10px] tracking-[0.25em] text-brand font-semibold uppercase">Premium Cakes</p>
            <h1 className="mt-2 text-5xl font-medium text-ink lg:text-6xl">Our Cakes</h1>
            <p className="mt-4 max-w-md mx-auto text-sm text-ink/70 leading-relaxed">
              Handcrafted with the finest ingredients, our cakes are made to make every moment sweeter.
            </p>
            <nav className="mt-6 flex items-center justify-center gap-2 text-xs text-ink/50">
              <span className="hover:text-brand cursor-pointer">Home</span>
              <span>/</span>
              <span className="text-ink font-medium">Cakes</span>
            </nav>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="order-first lg:order-none lg:w-[260px] lg:max-w-none">
            <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="lg:hidden flex items-center gap-2 rounded-sm border border-ink/15 px-3 py-2 text-xs text-ink hover:bg-cream transition">
              <SlidersHorizontal size={14} /><span>Filters</span>
            </button>
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                <div className="relative w-full max-w-md bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-ink">Filters</h2>
                    <button onClick={() => setMobileFiltersOpen(false)} className="rounded-sm p-1.5 hover:bg-cream transition" aria-label="Close filters"><X size={18} /></button>
                  </div>
                  <FilterSidebar activePrice={activePrice} activeFlavors={activeFlavors} activeDietary={activeDietary} onFilter={updateFilters} />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div><p className="text-xs text-ink/50">{CAKE_COUNT} Products</p></div>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setSearchParams((prev) => { prev.set("sort", e.target.value); return prev; }); }} className="rounded-sm border border-ink/15 bg-white px-3 py-1.5 text-[11px] text-ink/60 outline-none focus:border-brand">
                {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((cake) => <ProductCard key={cake.id} cake={cake} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className={`rounded-sm border px-3 py-1.5 text-xs ${page === 1 ? "border-ink/15 text-ink/40" : "border-brand text-brand hover:bg-brand hover:text-white"} transition`}>
                  <ArrowRight size={12} className={page === 1 ? "" : "rotate-180"} />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const n = i + 1;
                  return <button key={n} onClick={() => setPage(n)} className={`rounded-sm w-6 h-6 text-xs flex items-center justify-center transition ${n === page ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-cream"}`}>{n}</button>;
                })}
                <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className={`rounded-sm border px-3 py-1.5 text-xs ${page === totalPages ? "border-ink/15 text-ink/40" : "border-brand text-brand hover:bg-brand hover:text-white"} transition`}>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="mt-16 border-t border-ink/10 pt-12">
          <div className="grid gap-6 md:grid-cols-4 text-center">
            {INFO_ITEMS.map((item, i) => {
              const Icon = getIcon(item.icon);
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="rounded-full border border-brand/20 p-2 text-brand"><Icon size={18} strokeWidth={1.5} /></div>
                  <h3 className="text-xs font-semibold text-ink">{item.title}</h3>
                  <p className="text-[10px] text-ink/50 leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function getIcon(name) {
  switch (name) {
    case "leaf": return leafIcon;
    case "heart": return heartIcon;
    case "shield-check": return shieldIcon;
    case "truck": return truckIcon;
    default: return () => null;
  }
}

function leafIcon({ size, strokeWidth }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 6 6 10a8 8 0 0 0-10.14-2.25C5.27 9.11 3 11.07 3 16a6 6 0 0 0 6 6c3.04 0 5.6-1.75 6.82-3.15C20.24 18 22 15.81 22 12c0-2.77-1.28-5.25-3.24-6.96L12 2Z"/></svg>
  );
}
function heartIcon({ size, strokeWidth }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.05 1.32-3.5 3v2.21C12.75 7.68 12 8.28 12 8.75c0 .47.75 1.07 1.5 1.5C10.75 8.28 10 7.68 10 8.75c0 .47.75 1.07 1.5 1.5C10.75 8.28 10 7.68 10 8.75c0 .47.75 1.07 1.5 1.5C13 12 15 14 19 14Z"/></svg>
  );
}
function shieldIcon({ size, strokeWidth }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
  );
}
function truckIcon({ size, strokeWidth }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round"><path d="M3 15a2 2 0 0 1 2-2h3.1a2 2 0 0 1 1.71.71l1.78 2.68a2 2 0 0 0 1.5 1h6.82a2 2 0 0 0 2-2V7a1 1 0 0 0-1-1H4.59a1 1 0 0 0-.71.29L1.3 9.29a1 1 0 0 0-.29.71v4a1 1 0 0 0 1 1h1a2 2 0 0 1 2 2Z"/><path d="M7 19h10"/></svg>
  );
}
