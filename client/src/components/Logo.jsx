import { Link } from "react-router-dom";
import { Cake } from "lucide-react";

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <Cake className={light ? "text-gold" : "text-brand"} size={36} strokeWidth={1.3} />
      <span className="leading-none">
        <span className={`block font-serif text-[28px] font-semibold ${light ? "text-white" : "text-ink"}`}>CakeDelight</span>
        <span className="block text-[8px] tracking-[0.25em] text-brand">PREMIUM CAKES & MORE</span>
      </span>
    </Link>
  );
}
