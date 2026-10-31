import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, ArrowRight } from "lucide-react";
import Logo from "./Logo.jsx";
import { NAV_LINKS } from "../data";

const CARE = ["FAQs", "Shipping Policy", "Refund & Return", "Privacy Policy", "Terms & Conditions"];

export default function Footer() {
  return (
    <footer className="bg-cocoa text-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 text-xs md:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
        <div>
          <Logo light />
          <p className="mt-3 leading-relaxed">Crafting happiness, one cake at a time.<br />Because every celebration deserves something special.</p>
          <div className="mt-4 flex gap-2">
            <a href="https://www.facebook.com/cakedelight" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-7 w-7 place-items-center rounded-full border border-white/30 hover:border-gold hover:text-gold"><Facebook size={13} /></a>
            <a href="https://www.instagram.com/cakedelight" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-7 w-7 place-items-center rounded-full border border-white/30 hover:border-gold hover:text-gold"><Instagram size={13} /></a>
            <a href="https://www.youtube.com/@cakedelight" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid h-7 w-7 place-items-center rounded-full border border-white/30 hover:border-gold hover:text-gold"><Youtube size={13} /></a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-sans text-sm text-white">Quick Links</h3>
          <ul className="space-y-2">
            {NAV_LINKS.map((l) => <li key={l.to}><Link to={l.to} className="hover:text-gold">{l.label}</Link></li>)}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-sans text-sm text-white">Customer Care</h3>
          <ul className="space-y-2">
            {CARE.map((c) => (
              <li key={c}>
                {c === "FAQs" ? (
                  <Link to="/faqs" className="hover:text-gold">{c}</Link>
                ) : c === "Shipping Policy" || c === "Refund & Return" ? (
                  <Link to="/contact" className="hover:text-gold">{c}</Link>
                ) : c === "Privacy Policy" ? (
                  <a href="https://www.privacypolicytemplate.net" target="_blank" rel="noopener noreferrer" className="hover:text-gold">{c}</a>
                ) : (
                  <a href="https://www.termsandconditionssample.net" target="_blank" rel="noopener noreferrer" className="hover:text-gold">{c}</a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-sans text-sm text-white">Newsletter</h3>
          <p>Get the latest updates, offers and cake inspiration.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-3 flex gap-2">
            <input type="email" placeholder="Your email address" className="min-w-0 flex-1 rounded-sm border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-gold" />
            <button aria-label="Subscribe" className="grid w-9 place-items-center rounded-sm bg-gold text-cocoa"><ArrowRight size={14} /></button>
          </form>
          <p className="mt-6 text-[10px] text-white/50">© 2025 CakeDelight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
