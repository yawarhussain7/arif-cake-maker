import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const field = "w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand";
  return (
    <>
      <PageHeader title="Contact Us" text="Questions about an order? We are happy to help." />
      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mx-auto grid max-w-xl gap-4 px-6 py-12">
        <input required className={field} placeholder="Your name" />
        <input required type="email" className={field} placeholder="Email" />
        <textarea required rows={5} className={field} placeholder="Message" />
        <button className="rounded-sm bg-brand py-3 text-sm font-medium text-white hover:bg-brand-dark">Send message</button>
        {sent && <p className="text-center text-sm text-brand">Message sent. Thank you!</p>}
      </form>
    </>
  );
}
