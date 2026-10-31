import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import CakeImage from "../components/CakeImage.jsx";
import { useCart } from "../context/CartContext.jsx";

const FREE_SHIPPING = 50;
const SHIPPING = 5;

export default function Cart() {
  const { items, total, setQty, removeFromCart, clearCart } = useCart();
  const [ordered, setOrdered] = useState(false);
  const shipping = total >= FREE_SHIPPING || total === 0 ? 0 : SHIPPING;

  if (ordered) {
    return (
      <>
        <PageHeader title="Thank You!" text="Your order has been placed. We will contact you shortly." />
        <div className="py-12 text-center">
          <Link to="/cakes" className="rounded-sm bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark">Keep Shopping</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Your Cart" text="Review your cakes before checkout." />
      <div className="mx-auto max-w-5xl px-6 py-12">
        {items.length === 0 ? (
          <div className="text-center">
            <p className="text-ink/60">Your cart is empty.</p>
            <Link to="/cakes" className="mt-5 inline-block rounded-sm bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark">Browse Cakes</Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_300px]">
            <ul className="space-y-4">
              {items.map(({ cake, qty }) => (
                <li key={cake.id} className="flex items-center gap-4 rounded-md bg-white p-3 shadow-sm">
                  <CakeImage src={cake.image} alt={cake.name} className="h-20 w-20 shrink-0 rounded-sm" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-sm font-medium">{cake.name}</h3>
                    <p className="text-xs text-ink/60">${cake.price.toFixed(2)} each</p>
                    <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-ink/15 px-2 py-1 text-xs">
                      <button aria-label="Decrease quantity" onClick={() => setQty(cake.id, qty - 1)}><Minus size={13} /></button>
                      <span className="w-4 text-center">{qty}</span>
                      <button aria-label="Increase quantity" onClick={() => setQty(cake.id, qty + 1)}><Plus size={13} /></button>
                    </div>
                  </div>
                  <p className="text-sm font-medium">${(cake.price * qty).toFixed(2)}</p>
                  <button aria-label={`Remove ${cake.name}`} onClick={() => removeFromCart(cake.id)} className="text-ink/40 hover:text-red-600"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-md bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-semibold">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>${total.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</dd></div>
                <div className="flex justify-between border-t border-ink/10 pt-2 font-medium"><dt>Total</dt><dd>${(total + shipping).toFixed(2)}</dd></div>
              </dl>
              <button onClick={() => { clearCart(); setOrdered(true); }} className="mt-5 w-full rounded-sm bg-brand py-3 text-sm font-medium text-white hover:bg-brand-dark">Place Order</button>
              <button onClick={clearCart} className="mt-2 w-full text-xs text-ink/50 hover:text-brand">Clear cart</button>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
