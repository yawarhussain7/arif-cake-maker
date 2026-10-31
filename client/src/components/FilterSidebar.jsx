import { Check, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  { label: "All Cakes", count: 32, to: "/cakes" },
  { label: "Birthday Cakes", count: 10, to: "/cakes?category=birthday" },
  { label: "Anniversary Cakes", count: 6, to: "/cakes?category=anniversary" },
  { label: "Custom Cakes", count: 8, to: "/custom-order" },
  { label: "Cupcakes", count: 5, to: "/cakes?category=cupcakes" },
  { label: "Theme Cakes", count: 3, to: "/cakes?category=theme" },
];

const PRICE_RANGES = [
  { label: "Under $20" },
  { label: "$20 - $40" },
  { label: "$40 - $60" },
  { label: "$60 - $80" },
  { label: "$80+" },
];

const FLAVORS = ["Chocolate", "Vanilla", "Red Velvet", "Strawberry", "Caramel", "Lemon"];

const DIETARY = ["Eggless", "Gluten Free"];

export default function FilterSidebar({ activePrice, activeFlavors, activeDietary, onFilter }) {
  return (
    <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:gap-6 lg:px-8 lg:py-4">
      <div className="space-y-6">
        <section>
          <h2 className="text-[10px] tracking-[0.25em] uppercase text-brand font-semibold">Categories</h2>
          <ul className="mt-2 space-y-2 text-xs text-ink/70">
            {CATEGORIES.map((c) => (
              <li key={c.label}>
                <Link
                  to={c.to}
                  className="flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-cream transition"
                >
                  <span>{c.label}</span>
                  <span className="text-ink/40">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-[10px] tracking-[0.25em] uppercase text-brand font-semibold">Price Range</h2>
          <ul className="mt-2 space-y-2">
            {PRICE_RANGES.map((p) => {
              const checked = activePrice === p.label;
              return (
                <li key={p.label}>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none group">
                    <input
                      type="radio"
                      name="price"
                      checked={checked}
                      onChange={() => onFilter({ price: p.label })}
                      className="w-3 h-3 rounded-full border-ink/40 text-brand focus:ring-0"
                    />
                    <span className={`text-ink/60 group-hover:text-brand transition`}>{p.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-[10px] tracking-[0.25em] uppercase text-brand font-semibold">Flavor</h2>
          <ul className="mt-2 space-y-2">
            {FLAVORS.map((f) => {
              const checked = activeFlavors.includes(f);
              return (
                <li key={f}>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onFilter({ flavor: f })}
                      className="w-3 h-3 rounded border-ink/40 text-brand focus:ring-0"
                    />
                    <span className={`text-ink/60 group-hover:text-brand transition`}>{f}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-[10px] tracking-[0.25em] uppercase text-brand font-semibold">Dietary</h2>
          <ul className="mt-2 space-y-2">
            {DIETARY.map((d) => {
              const checked = activeDietary.includes(d);
              return (
                <li key={d}>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onFilter({ dietary: d })}
                      className="w-3 h-3 rounded border-ink/40 text-brand focus:ring-0"
                    />
                    <span className={`text-ink/60 group-hover:text-brand transition`}>{d}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="mt-8 rounded-md bg-cream border border-ink/10 p-4">
        <Link to="/custom-order" className="block text-center">
          <img
            src="https://images.unsplash.com/photo-89bdtHcfRBw?auto=format&fit=crop&w=300&q=80"
            alt="Custom cake"
            className="mx-auto h-24 w-full object-cover rounded-md mb-3"
          />
          <h3 className="text-sm font-medium text-ink">Custom Cakes for Every Occasion</h3>
          <p className="text-[10px] text-ink/60 leading-relaxed">
            Make your special moments unforgettable with a personalized cake.
          </p>
          <button className="mt-3 inline-flex items-center justify-center gap-1 rounded-sm bg-brand px-4 py-2 text-[10px] text-white hover:bg-brand-dark transition">
            Order Custom Cake <ChevronDown size={10} />
          </button>
        </Link>
      </div>
    </aside>
  );
}