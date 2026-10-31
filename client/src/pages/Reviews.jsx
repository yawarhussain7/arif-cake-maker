import { useState, useMemo } from "react";
import { Star, ShieldCheck, Truck, Heart, ArrowRight, Image as ImageIcon, Maximize } from "lucide-react";
import CakeImage from "../components/CakeImage.jsx";
import { REVIEWS, REVIEW_STATS, GALLERY_IMAGES } from "../data";

const HERO_IMAGE = "https://images.unsplash.com/photo-EUDtCsaL8iw?auto=format&fit=crop&w=1600&q=80";

const FILTERS = ["All Reviews", "Birthday Cakes", "Wedding Cakes", "Custom Cakes"];

const INFO_ITEMS = [
  { icon: "leaf", title: "Premium Ingredients", text: "Only the finest, freshest ingredients." },
  { icon: "heart", title: "Handcrafted with Love", text: "Made with care by our expert bakers." },
  { icon: "shield-check", title: "Secure Payments", text: "100% secure & encrypted." },
  { icon: "truck", title: "Fast & Reliable Delivery", text: "On time, every time." },
];

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-gold">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= rating ? "fill-current" : "opacity-40"} />
      ))}
    </div>
  );
}

function getIcon(name) {
  switch (name) {
    case "leaf": return () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 6 6 10a8 8 0 0 0-10.14-2.25C5.27 9.11 3 11.07 3 16a6 6 0 0 0 6 6c3.04 0 5.6-1.75 6.82-3.15C20.24 18 22 15.81 22 12c0-2.77-1.28-5.25-3.24-6.96L12 2Z"/></svg>
    );
    case "heart": return () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.05 1.32-3.5 3v2.21C12.75 7.68 12 8.28 12 8.75c0 .47.75 1.07 1.5 1.5C10.75 8.28 10 7.68 10 8.75c0 .47.75 1.07 1.5 1.5C13 12 15 14 19 14Z"/></svg>
    );
    case "shield-check": return () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
    );
    case "truck": return () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15a2 2 0 0 1 2-2h3.1a2 2 0 0 1 1.71.71l1.78 2.68a2 2 0 0 0 1.5 1h6.82a2 2 0 0 0 2-2V7a1 1 0 0 0-1-1H4.59a1 1 0 0 0-.71.29L1.3 9.29a1 1 0 0 0-.29.71v4a1 1 0 0 0 1 1h1a2 2 0 0 1 2 2Z"/><path d="M7 19h10"/></svg>
    );
    default: return () => null;
  }
}

export default function Reviews() {
  const [activeFilter, setActiveFilter] = useState("All Reviews");

  const filtered = useMemo(() => {
    if (activeFilter === "All Reviews") return REVIEWS;
    return REVIEWS.filter((r) => r.cakeType === activeFilter);
  }, [activeFilter]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-sand overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="Customer review cake" className="h-[420px] w-full object-cover object-center" loading="eager" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-3xl text-center">
            <p className="text-[10px] tracking-[0.25em] text-brand font-semibold uppercase">Real People. Real Moments.</p>
            <h1 className="mt-2 text-5xl font-medium text-ink lg:text-6xl">Customer Reviews</h1>
            <p className="mt-4 max-w-md mx-auto text-sm text-ink/70 leading-relaxed">
              Your happiness means everything to us. Here's what our amazing customers have to say about their CakeDelight experience.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 lg:grid-cols-4 text-center">
            <div className="p-4 rounded-md bg-cream">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-ink">{REVIEW_STATS.averageRating}</span>
                <Stars rating={5} />
              </div>
              <p className="mt-1 text-[10px] text-ink/50 uppercase tracking-wider font-semibold">Based on {REVIEW_STATS.totalReviews} Reviews</p>
            </div>
            <div className="p-4 rounded-md bg-cream">
              <div className="flex items-center justify-center gap-2">
                <div className="rounded-full bg-brand/10 p-2 text-brand"><Star size={14} fill /></div>
                <span className="text-lg font-medium text-ink">{REVIEW_STATS.happyCustomers}</span>
              </div>
              <p className="mt-1 text-[10px] text-ink/50 uppercase tracking-wider font-semibold">Happy Customers</p>
            </div>
            <div className="p-4 rounded-md bg-cream">
              <div className="flex items-center justify-center gap-2">
                <ImageIcon size={14} className="text-brand" />
                <span className="text-lg font-medium text-ink">{REVIEW_STATS.totalReviews}</span>
              </div>
              <p className="mt-1 text-[10px] text-ink/50 uppercase tracking-wider font-semibold">Total Reviews</p>
            </div>
            <div className="p-4 rounded-md bg-cream">
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg font-medium text-ink">{REVIEW_STATS.ratingOutOf}</span>
              </div>
              <p className="mt-1 text-[10px] text-ink/50 uppercase tracking-wider font-semibold">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Share Your Experience */}
      <section className="py-12 bg-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-medium text-ink">Share Your Experience</h2>
              <p className="mt-2 text-sm text-ink/60">Loved your cake? Leave a review and help others choose.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark transition">
              Write a Review <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Filters + Reviews */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-8">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition ${activeFilter === f ? "bg-brand text-white" : "border border-ink/15 bg-white text-ink/60 hover:border-brand/30 hover:text-brand"}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[10px] tracking-[0.25em] text-brand font-semibold uppercase">Real Stories, Sweet Moments</h2>
            <button className="text-[10px] text-brand hover:underline font-medium">All Reviews</button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((review) => (
              <div key={review.id} className="rounded-md bg-white shadow-sm border border-ink/10 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img src={review.cakeImage} alt={review.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-medium text-ink">{review.name}</div>
                      <div className="text-[10px] text-ink/50">{review.date}</div>
                    </div>
                  </div>
                  <Stars rating={review.rating} />
                </div>
                <p className="text-sm text-ink/70 leading-relaxed mb-3">{review.text}</p>
                <div className="flex items-center gap-2">
                  <CakeImage src={review.cakeImage} alt={review.cakeName} className="h-12 w-12 rounded-sm object-cover object-center border border-ink/10" />
                  <div className="flex flex-col">
                    <div className="text-xs font-medium text-ink">{review.cakeName}</div>
                    <div className="text-[10px] text-ink/50">{review.cakeType}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-brand">
                  <ShieldCheck size={12} fill />
                  <span className="font-medium">Verified Purchase</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loved by Many Gallery */}
      <section className="py-16 bg-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.25em] text-brand font-semibold uppercase">See more in our gallery</p>
              <h2 className="mt-2 text-3xl font-medium text-ink">Loved by Many</h2>
              <p className="mt-2 text-sm text-ink/60">Take a look at some of the beautiful cakes our happy customers have shared with us.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition">
              View Full Gallery <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY_IMAGES.slice(0, 4).map((img) => (
              <div key={img.id} className="relative group overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
                <CakeImage src={img.image} alt={img.title} className="h-48 w-full object-cover object-center" />
                <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 backdrop-blur">
                  <Heart size={12} fill className="text-brand" />
                  <span className="text-[10px] font-medium text-ink">{img.category.charAt(0).toUpperCase() + img.category.slice(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info strip */}
      <section className="border-t border-ink/10 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
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
        </div>
      </section>
    </>
  );
}
