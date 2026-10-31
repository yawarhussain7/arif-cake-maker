import { useState } from "react";
import { PenLine } from "lucide-react";
import Stars from "./Stars.jsx";
import ReviewForm from "./ReviewForm.jsx";
import { INITIAL_REVIEWS } from "../data";

function Avatar({ review }) {
  const [failed, setFailed] = useState(false);
  if (!review.avatar || failed) {
    return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 font-serif text-lg text-brand">{review.name[0]}</span>;
  }
  return <img src={review.avatar} alt="" onError={() => setFailed(true)} className="h-10 w-10 shrink-0 rounded-full object-cover" />;
}

export default function Reviews() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? reviews : reviews.slice(0, 3);
  const add = (r) => { setReviews([r, ...reviews]); setShowForm(false); };

  return (
    <section id="reviews" className="bg-cream py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-brand">TESTIMONIALS</p>
            <h2 className="text-3xl font-medium">What Our Customers Say</h2>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1.5 rounded-sm border border-brand px-4 py-2 text-brand hover:bg-brand hover:text-white">
              <PenLine size={13} /> Add your review
            </button>
            {reviews.length > 3 && (
              <button onClick={() => setShowAll(!showAll)} className="text-brand hover:underline">
                {showAll ? "Show fewer reviews" : "Read more reviews"}
              </button>
            )}
          </div>
        </div>

        {showForm && <ReviewForm onSubmit={add} />}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {visible.map((r) => (
            <figure key={r.id} className="flex gap-3 rounded-md bg-white p-5 shadow-sm">
              <Avatar review={r} />
              <div>
                <blockquote className="text-xs leading-relaxed text-ink/70">“{r.text}”</blockquote>
                <figcaption className="mt-2 text-xs font-medium">{r.name}</figcaption>
                <Stars value={r.rating} size={11} />
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
