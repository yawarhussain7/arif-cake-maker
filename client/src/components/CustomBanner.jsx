import { Link } from "react-router-dom";
import { ArrowRight, Palette, Cake, Truck } from "lucide-react";
import CakeImage from "./CakeImage.jsx";

const PERKS = [
  { icon: Palette, title: "Custom Designs", text: "Your idea, our creativity." },
  { icon: Cake, title: "Premium Quality", text: "Freshly baked, always." },
  { icon: Truck, title: "On-Time Delivery", text: "Because your moments matter." },
];

export default function CustomBanner() {
  return (
    <section className="bg-cocoa text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-12 md:grid-cols-[1fr_1fr_260px]">
        <div>
          <p className="font-serif text-2xl text-gold">Make Every Moment</p>
          <h2 className="text-5xl font-medium">Extra Special</h2>
          <p className="mt-4 max-w-xs text-sm text-white/70">Custom cakes for birthdays, weddings, anniversaries and corporate events.</p>
          <Link to="/custom-order" className="mt-6 inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3 text-sm font-medium text-cocoa transition hover:bg-brand">
            Order Custom Cake <ArrowRight size={14} />
          </Link>
        </div>
        <CakeImage src="https://images.unsplash.com/photo-89bdtHcfRBw?auto=format&fit=crop&w=1000&q=80" alt="Tiered custom cake" className="h-64 w-full rounded-md" />
        <ul className="space-y-5">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon size={26} strokeWidth={1.2} className="mt-0.5 shrink-0 text-gold" />
              <div>
                <h3 className="font-sans text-sm font-medium">{title}</h3>
                <p className="text-xs text-white/60">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
