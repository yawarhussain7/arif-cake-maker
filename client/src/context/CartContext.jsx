import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ cake, qty }]

  const addToCart = (cake) =>
    setItems((prev) => {
      const found = prev.find((i) => i.cake.id === cake.id);
      return found
        ? prev.map((i) => (i.cake.id === cake.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { cake, qty: 1 }];
    });

  const setQty = (id, qty) =>
    setItems((prev) =>
      prev.map((i) => (i.cake.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0)
    );

  const removeFromCart = (id) => setItems((prev) => prev.filter((i) => i.cake.id !== id));
  const clearCart = () => setItems([]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.qty * i.cake.price, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addToCart, setQty, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
