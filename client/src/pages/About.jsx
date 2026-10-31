import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import CakeImage from "../components/CakeImage.jsx";

const STATS = [["10+", "Years baking"], ["5,000+", "Happy customers"], ["50+", "Signature flavours"]];

export default function About() {
  return (
    <>
      <PageHeader title="About CakeDelight" text="Crafting happiness, one cake at a time." />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2">
        <CakeImage src="https://images.unsplash.com/photo-0YSh_S2A3Cw?auto=format&fit=crop&w=1000&q=80" alt="Our bakery" className="h-80 w-full rounded-md" />
        <div>
          <p className="text-[10px] tracking-[0.25em] text-brand">OUR STORY</p>
          <h2 className="mt-2 text-4xl font-medium">Baked with love, finished by hand</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">
            CakeDelight began in a small home kitchen with one belief: every celebration deserves a cake worth remembering.
            Today we still bake in small batches, using fresh cream, real fruit and the finest chocolate.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            Whether it is a birthday, a wedding or just a Tuesday, our bakers decorate each cake by hand and deliver it fresh to your door.
          </p>
          <Link to="/custom-order" className="mt-6 inline-block rounded-sm bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark">Order a Custom Cake</Link>
        </div>
      </section>
      <section className="bg-cocoa text-white">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 text-center sm:grid-cols-3">
          {STATS.map(([n, l]) => (
            <div key={l}><p className="font-serif text-4xl text-gold">{n}</p><p className="mt-1 text-xs text-white/70">{l}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
