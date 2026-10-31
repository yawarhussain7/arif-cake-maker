import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, Truck, Facebook, Instagram, Youtube } from "lucide-react";
import Logo from "./Logo.jsx";
import { NAV_LINKS } from "../data";
import { useCart } from "../context/CartContext.jsx";

function TopBar() {
  return (
    <div className="hidden bg-sand text-xs text-ink/70 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
        <p className="flex items-center gap-2"><Truck size={14} /> Free Shipping on Orders Over $50</p>
        <div className="flex items-center gap-4">
          <Link to="/contact" className="hover:text-brand">Track Order</Link>
          <span className="h-3 w-px bg-ink/20" />
          <Link to="/contact" className="hover:text-brand">Help & Support</Link>
          <div className="ml-3 flex gap-3">
            <a href="https://www.facebook.com/cakedelight" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={14} /></a>
            <a href="https://www.instagram.com/cakedelight" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={14} /></a>
            <a href="https://www.youtube.com/@cakedelight" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={14} /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  const linkClass = ({ isActive }) =>
    `relative py-2 text-sm transition-colors hover:text-brand ${
      isActive ? "text-brand after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-brand" : "text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <TopBar />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Logo />

        <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button aria-label="Search" className="hover:text-brand"><Search size={19} /></button>
          <button aria-label="Account" className="hover:text-brand"><User size={19} /></button>
          <Link to="/cart" aria-label="Cart" className="relative hover:text-brand">
            <ShoppingBag size={19} />
            <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-brand text-[9px] text-white">{count}</span>
          </Link>
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-sand bg-white px-6 py-3 md:hidden" aria-label="Mobile">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)} className="py-2 text-sm hover:text-brand">
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
