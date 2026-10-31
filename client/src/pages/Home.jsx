import Hero from "../components/Hero.jsx";
import Features from "../components/Features.jsx";
import Categories from "../components/Categories.jsx";
import BestSellers from "../components/BestSellers.jsx";
import CustomBanner from "../components/CustomBanner.jsx";
import Reviews from "../components/Reviews.jsx";
import Newsletter from "../components/Newsletter.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Categories />
      <BestSellers />
      <CustomBanner />
      <Reviews />
      <Newsletter />
    </>
  );
}
