import * as Icons from "lucide-react";
import { FEATURES } from "../data";

export default function Features() {
  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-10 md:grid-cols-5">
        {FEATURES.map((f, n) => {
          const Icon = Icons[f.icon];
          return (
            <div key={f.title} className={`flex flex-col items-center px-4 text-center ${n > 0 ? "md:border-l md:border-ink/10" : ""}`}>
              <span className="grid h-12 w-12 place-items-center rounded-full border border-brand/40 text-brand">
                <Icon size={22} strokeWidth={1.4} />
              </span>
              <h3 className="mt-4 font-sans text-sm font-medium">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink/60">{f.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
