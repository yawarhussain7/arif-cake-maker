import { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState("");

  const handle = (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return setError("Please add your name and a short review.");
    onSubmit({ id: Date.now(), name: name.trim(), text: text.trim(), rating, avatar: "" });
    setName(""); setText(""); setRating(5); setError("");
  };

  return (
    <form onSubmit={handle} className="mt-6 rounded-md bg-white p-5 shadow-sm">
      <h3 className="text-xl font-semibold">Write a review</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          className="rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand" />
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`} className="text-gold">
              <Star size={22} className={n <= (hover || rating) ? "fill-current" : ""} />
            </button>
          ))}
        </div>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Tell us about your cake"
        className="mt-3 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand" />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <button className="mt-3 rounded-sm bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">Post review</button>
    </form>
  );
}
