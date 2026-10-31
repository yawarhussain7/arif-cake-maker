import { Star } from "lucide-react";

export default function Stars({ value = 5, size = 12 }) {
  return (
    <div className="flex gap-0.5 text-gold" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(value) ? "fill-current" : "opacity-40"} />
      ))}
    </div>
  );
}
