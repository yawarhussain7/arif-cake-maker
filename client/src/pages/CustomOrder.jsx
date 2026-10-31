import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Upload, Edit, Mail } from "lucide-react";
import CakeImage from "../components/CakeImage.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  CUSTOM_FLAVORS, CUSTOM_SIZES, CUSTOM_FROSTINGS, CUSTOM_FILLINGS,
  CUSTOM_DESIGNS, computeCustomPrice,
} from "../data";

const HERO_IMAGE = "https://images.unsplash.com/photo-q8dTKBzBM4U?auto=format&fit=crop&w=1600&q=80";
const PREVIEW_IMAGE = "https://images.unsplash.com/photo-2f0boZuyd3M?auto=format&fit=crop&w=900&q=80";

const INFO_ITEMS = [
  { icon: "gift", title: "Perfect for Any Occasion", text: "Birthdays, Weddings, Anniversaries & more." },
  { icon: "heart", title: "Handcrafted with Love", text: "Made with care by our expert bakers." },
  { icon: "shield-check", title: "Premium Ingredients", text: "Only the finest, freshest ingredients." },
  { icon: "truck", title: "Fast & Reliable Delivery", text: "On time, every time." },
];

export default function CustomOrder() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [flavor, setFlavor] = useState(CUSTOM_FLAVORS[0].id);
  const [sizeId, setSizeId] = useState(CUSTOM_SIZES[1].id);
  const [frosting, setFrosting] = useState(CUSTOM_FROSTINGS[0].id);
  const [fillings, setFillings] = useState([]);
  const [design, setDesign] = useState(CUSTOM_DESIGNS[0].id);
  const [referenceImage, setReferenceImage] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const size = CUSTOM_SIZES.find((s) => s.id === sizeId);
  const price = computeCustomPrice({ sizeId, designId: design, fillingsCount: fillings.length });

  const toggleFilling = (id) => {
    setFillings((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate("/cart"), 2000);
  };

  const SizeOption = ({ s, active, onClick }) => (
    <button key={s.id} onClick={onClick} className={`rounded-md border px-4 py-3 text-left transition ${active ? "border-brand bg-brand/5" : "border-ink/10 hover:border-brand/30"}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink">{s.name}</div>
          <div className="text-[10px] text-ink/50">{s.serves}</div>
        </div>
      </div>
    </button>
  );

  return (
    <>
      <section className="relative bg-sand overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="Custom cake hero" className="h-[420px] w-full object-cover object-center" loading="eager" />
          <div className="absolute inset-0 bg-black/25" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-2xl text-center">
            <p className="text-[10px] tracking-[0.25em] text-brand font-semibold uppercase">Create Your Perfect Cake</p>
            <h1 className="mt-2 text-5xl font-medium text-ink lg:text-6xl">Customize Your Cake</h1>
            <p className="mt-4 max-w-md mx-auto text-sm text-ink/70 leading-relaxed">
              Design a cake that's uniquely yours. Choose every detail from flavor and size to design and add your own special touch.
            </p>
            <button onClick={() => document.getElementById("custom-form")?.scrollIntoView()} className="mt-8 inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark transition">
              Start Customizing <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 md:grid-cols-5 text-center">
            {INFO_ITEMS.map((item, i) => {
              const Icon = getCustomIcon(item.icon);
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="rounded-full border border-brand/20 p-2 text-brand"><Icon size={18} strokeWidth={1.5} /></div>
                  <h3 className="text-xs font-semibold text-ink">{item.title}</h3>
                  <p className="text-[10px] text-ink/50">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-[360px_1fr]">
            <div className="space-y-8" id="custom-form">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-brand font-semibold uppercase">Customize Your Cake</p>
                <h2 className="mt-2 text-3xl font-medium">Create Your Dream Cake</h2>
                <p className="mt-2 text-sm text-ink/60">
                  Follow the steps below to design your perfect cake. You can also upload a reference image or describe your idea — we'll build it to life!
                </p>
              </div>

              <div className="rounded-md bg-white p-5 shadow-sm border border-ink/10">
                <h3 className="text-xs tracking-[0.25em] uppercase text-brand font-semibold mb-3">1. Choose Cake Flavor</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {CUSTOM_FLAVORS.map((f) => (
                    <button key={f.id} onClick={() => setFlavor(f.id)} className={`aspect-square rounded-md border p-2 flex flex-col items-center gap-1.5 transition ${flavor === f.id ? "border-brand bg-brand/10" : "border-ink/10 hover:border-brand/30"}`}>
                      <CakeImage src={f.image} alt={f.name} className="h-16 w-full object-cover" />
                      <span className="text-xs font-medium text-ink">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-white p-5 shadow-sm border border-ink/10">
                <h3 className="text-xs tracking-[0.25em] uppercase text-brand font-semibold mb-3">2. Choose Cake Size</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CUSTOM_SIZES.map((s) => (
                    <SizeOption key={s.id} s={s} active={sizeId === s.id} onClick={() => setSizeId(s.id)} />
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-white p-5 shadow-sm border border-ink/10">
                <h3 className="text-xs tracking-[0.25em] uppercase text-brand font-semibold mb-3">3. Choose Frosting</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CUSTOM_FROSTINGS.map((fr) => (
                    <button key={fr.id} onClick={() => setFrosting(fr.id)} className={`w-full rounded-md border px-4 py-2.5 text-left text-sm transition ${frosting === fr.id ? "border-brand bg-brand/5 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/30"}`}>
                      {fr.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-white p-5 shadow-sm border border-ink/10">
                <h3 className="text-xs tracking-[0.25em] uppercase text-brand font-semibold mb-3">4. Add Fillings (Optional)</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CUSTOM_FILLINGS.map((f) => (
                    <label key={f.id} className="cursor-pointer group">
                      <button type="button" onClick={() => toggleFilling(f.id)} className="w-full rounded-md border px-4 py-2.5 text-left text-sm transition group border-ink/10 hover:border-brand/30">
                        <span className="flex items-center justify-between w-full">
                          <span className={fillings.includes(f.id) ? "text-brand" : "text-ink/60"}>{f.name}</span>
                          {fillings.includes(f.id) && <span className="text-brand">✓</span>}
                        </span>
                      </button>
                      {f.id === "other" && fillings.includes("other") && (
                        <input type="text" placeholder="Enter filling name" className="mt-2 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-white p-5 shadow-sm border border-ink/10">
                <h3 className="text-xs tracking-[0.25em] uppercase text-brand font-semibold mb-3">5. Design & Decorations</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {CUSTOM_DESIGNS.map((d) => (
                    <button key={d.id} onClick={() => setDesign(d.id)} className={`aspect-square rounded-md border p-2 flex flex-col items-center gap-1.5 transition ${design === d.id ? "border-brand bg-brand/10" : "border-ink/10 hover:border-brand/30"}`}>
                      <CakeImage src={d.image} alt={d.name} className="h-16 w-full object-cover" />
                      <span className="text-xs font-medium text-ink">{d.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-white p-5 shadow-sm border border-ink/10">
                <h3 className="text-xs tracking-[0.25em] uppercase text-brand font-semibold mb-3">6. Upload Reference Image (Optional)</h3>
                <div className="border-2 border-dashed border-ink/15 rounded-md p-6 text-center hover:border-brand/50 transition group cursor-pointer">
                  <Upload size={20} className="mx-auto mb-2 text-ink/40 group-hover:text-brand" />
                  <p className="text-[10px] text-ink/50">Click to upload image</p>
                  <p className="text-[10px] text-ink/40">or drag and drop (PNG, JPG, or WEBP)</p>
                </div>
                <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setReferenceImage(e.target.files[0]); }} className="sr-only" />
                <div className="mt-4">
                  <label className="block text-[10px] tracking-[0.25em] uppercase text-brand font-semibold mb-2">Describe your cake idea</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="4" placeholder="e.g. I want a chocolate cake with gold accents, flowers and a drip design like this image..." className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand" />
                </div>
              </div>

              <button onClick={handleSubmit} className="w-full rounded-sm bg-brand py-4 text-sm font-medium text-white hover:bg-brand-dark transition shadow-sm">
                <ShoppingBagIcon /> Add to Cart
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-md bg-white p-5 shadow-sm border border-ink/10 relative">
                <CakeImage src={PREVIEW_IMAGE} alt="Your custom cake preview" className="h-64 w-full object-cover object-center rounded-lg mb-4" />
                <button className="absolute right-3 top-3 flex items-center gap-1 text-[10px] text-brand hover:underline"><Edit size={12} /> Edit Preview</button>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[CUSTOM_FLAVORS[0], CUSTOM_FLAVORS[1], CUSTOM_FLAVORS[2], CUSTOM_FLAVORS[3]].map((f) => (
                    <img key={f.id} src={f.image} alt={f.name} className="h-10 w-full object-cover rounded-sm border border-ink/10" />
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-white p-5 shadow-sm border border-ink/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-ink">Your Custom Cake</h3>
                  <button className="flex items-center gap-1 text-[10px] text-brand hover:underline"><Edit size={12} /> Edit</button>
                </div>
                <dl className="space-y-3 text-sm text-ink/60">
                  <div className="flex justify-between"><dt>Flavor</dt><dd className="text-ink font-medium">{CUSTOM_FLAVORS.find((f) => f.id === flavor)?.name}</dd></div>
                  <div className="flex justify-between"><dt>Size</dt><dd className="text-ink font-medium">{size?.name} {size?.serves}</dd></div>
                  <div className="flex justify-between"><dt>Frosting</dt><dd className="text-ink font-medium">{CUSTOM_FROSTINGS.find((f) => f.id === frosting)?.name}</dd></div>
                  <div className="flex justify-between"><dt>Fillings</dt><dd className="text-ink font-medium">{fillings.length ? fillings.map((fid) => CUSTOM_FILLINGS.find((f) => f.id === fid)?.name).join(", ") : "None"}</dd></div>
                  <div className="flex justify-between"><dt>Design</dt><dd className="text-ink font-medium">{CUSTOM_DESIGNS.find((d) => d.id === design)?.name}</dd></div>
                  <div className="flex justify-between"><dt>Reference Image</dt><dd className="text-ink font-medium">{referenceImage ? referenceImage.name : "Not uploaded"}</dd></div>
                </dl>
                <div className="mt-5 pt-4 border-t border-ink/10">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-brand font-semibold">Estimated Price</span>
                    <span className="text-2xl font-bold text-ink">${price.toFixed(2)}</span>
                    <span className="text-[10px] text-ink/40">(Final price may vary based on customization)</span>
                  </div>
                  <p className="mt-1 text-[10px] text-ink/50">Need help? Our cake experts are here!</p>
                  <a href="mailto:hello@cakedelight.com" className="flex items-center gap-1 mt-2 text-[10px] text-brand hover:underline"><Mail size={12} /> Contact us for any special requests or questions.</a>
                </div>
                <button onClick={handleSubmit} disabled={submitted} className="mt-5 w-full rounded-sm bg-brand py-3 text-sm font-medium text-white hover:bg-brand-dark transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  <ArrowRight size={14} /> {submitted ? "Request Sent" : "Add to Cart"}
                </button>
                {submitted && <p className="mt-3 text-center text-sm text-brand">Custom order request sent. We'll contact you within 24 hours.</p>}
              </div>
            </div>

          </div>

          <section className="mt-16 border-t border-ink/10 pt-12">
            <div className="grid gap-6 md:grid-cols-4 text-center">
              {INFO_ITEMS.map((item, i) => {
                const Icon = getCustomIcon(item.icon);
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
      </section>
    </>
  );
}

function getCustomIcon(name) {
  switch (name) {
    case "gift": return giftIcon;
    case "heart": return heartIcon;
    case "shield-check": return shieldIcon;
    case "truck": return truckIcon;
    default: return () => null;
  }
}

function giftIcon({ size, strokeWidth }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z"/><path d="M3 13h18"/><path d="M7 7v10"/><path d="M17 7v10"/></svg>
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
function ShoppingBagIcon({ size = 14, strokeWidth = 1.5 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M16 2L13 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0L16 2"/></svg>
  );
}
