import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

const FAQS = [
  ["How far in advance should I order?", "Standard cakes need 24 hours. Custom designs and wedding cakes need at least 3 days."],
  ["Do you offer eggless cakes?", "Yes. Most of our flavours are available eggless at no extra cost."],
  ["Is delivery free?", "Delivery is free on orders over $50. Smaller orders have a flat $5 fee."],
  ["Can I change or cancel my order?", "You can change or cancel up to 12 hours before the delivery time."],
  ["How should I store my cake?", "Keep it refrigerated and take it out about 30 minutes before serving."],
];

export default function FAQs() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <PageHeader title="FAQs" text="Quick answers to common questions." />
      <div className="mx-auto max-w-2xl space-y-3 px-6 py-12">
        {FAQS.map(([q, a], n) => (
          <div key={q} className="rounded-md bg-white shadow-sm">
            <button onClick={() => setOpen(open === n ? -1 : n)} aria-expanded={open === n} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium">
              {q}
              <ChevronDown size={16} className={`shrink-0 transition ${open === n ? "rotate-180" : ""}`} />
            </button>
            {open === n && <p className="px-5 pb-4 text-sm leading-relaxed text-ink/70">{a}</p>}
          </div>
        ))}
      </div>
    </>
  );
}
