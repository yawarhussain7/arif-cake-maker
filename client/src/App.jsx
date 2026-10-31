import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Cakes from "./pages/Cakes.jsx";
import Gallery from "./pages/Gallery.jsx";
import Reviews from "./pages/Reviews.jsx";
import CustomOrder from "./pages/CustomOrder.jsx";
import Occasions from "./pages/Occasions.jsx";
import Contact from "./pages/Contact.jsx";
import Cart from "./pages/Cart.jsx";
import About from "./pages/About.jsx";
import FAQs from "./pages/FAQs.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cakes" element={<Cakes />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="custom-order" element={<CustomOrder />} />
        <Route path="occasions" element={<Occasions />} />
        <Route path="contact" element={<Contact />} />
        <Route path="cart" element={<Cart />} />
        <Route path="about" element={<About />} />
        <Route path="faqs" element={<FAQs />} />
      </Route>
    </Routes>
  );
}
