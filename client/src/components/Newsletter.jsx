import { useState } from "react";
import { Cake } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e) => { e.preventDefault(); if (email) { setDone(true); setEmail(""); } };

  return (
    <section className="bg-sand">
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-6 py-8 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-brand">STAY UPDATED</p>
          <h2 className="text-3xl font-medium">Join Our Newsletter</h2>
          <p className="text-xs text-ink/60">Get exclusive offers, new arrivals and cake inspiration.</p>
        </div>
        <form onSubmit={submit} className="flex gap-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address"
            className="min-w-0 flex-1 rounded-sm border border-ink/10 bg-white px-3 py-2.5 text-xs outline-none focus:border-brand" />
          <button className="rounded-sm bg-brand px-6 text-xs font-medium text-white hover:bg-brand-dark">Subscribe</button>
        </form>
      </div>
      {done && <p className="pb-4 text-center text-xs text-brand">Thanks for subscribing!</p>}
      <div className="flex items-center justify-center gap-3 pb-3 text-brand/60">
        <span className="h-px w-40 bg-brand/30" /><Cake size={18} /><span className="h-px w-40 bg-brand/30" />
      </div>
    </section>
  );
}
