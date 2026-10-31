export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Cakes", to: "/cakes" },
  { label: "Gallery", to: "/gallery" },
  { label: "Reviews", to: "/reviews" },
  { label: "Custom-Order", to: "/custom-order" },
  { label: "Occasions", to: "/occasions" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

// Images are loaded from the internet (Unsplash) so nothing depends on /public/images
const IMG = (id, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Gallery images loaded from Unsplash (internet URLs)
export const GALLERY_IMAGES = [
  { id: 1, title: "Chocolate Drip Cake", category: "chocolate", image: IMG("gRZYR210m0U", 800) },
  { id: 2, title: "Red Velvet Wedding Cake", category: "wedding", image: IMG("L8nLqb9J-r4", 800) },
  { id: 3, title: "Vanilla Berry Cake", category: "fruit", image: IMG("9g7I6elbAXw", 800) },
  { id: 4, title: "Black Forest Cake", category: "chocolate", image: IMG("2f0boZuyd3M", 800) },
  { id: 5, title: "Lemon Delight Cake", category: "fruit", image: IMG("eqBpWmNv068", 800) },
  { id: 6, title: "Strawberry Dream Cake", category: "fruit", image: IMG("x1QmC6KRn9M", 800) },
  { id: 7, title: "Caramel Bliss Cake", category: "caramel", image: IMG("EUDtCsaL8iw", 800) },
  { id: 8, title: "Oreo Delight Cake", category: "chocolate", image: IMG("89bdtHcfRBw", 800) },
  { id: 9, title: "Mango Paradise Cake", category: "fruit", image: IMG("DIUJSBiJNoc", 800) },
  { id: 10, title: "Salted Caramel Cake", category: "caramel", image: IMG("L8nLqb9J-r4", 800) },
  { id: 11, title: "Tiramisu Cake", category: "chocolate", image: IMG("gRZYR210m0U", 800) },
  { id: 12, title: "Funfetti Birthday Cake", category: "birthday", image: IMG("9g7I6elbAXw", 800) },
  { id: 13, title: "Anniversary Tiered Cake", category: "wedding", image: IMG("EUDtCsaL8iw", 800) },
  { id: 14, title: "Cupcake Assortment", category: "cupcakes", image: IMG("DIUJSBiJNoc", 800) },
  { id: 15, title: "Custom Sculpted Cake", category: "custom", image: IMG("89bdtHcfRBw", 800) },
  { id: 16, title: "Floral Wedding Cake", category: "wedding", image: IMG("x1QmC6KRn9M", 800) },
];

export const SLIDES = [
  { id: 1, eyebrow: "Premium Cakes", title: "Life is Sweeter with Cake", text: "Handcrafted with the finest ingredients, our cakes turn every moment into a special occasion.", image: IMG("62XLglIrTJc"), script: "More Than Just Cake" },
  { id: 2, eyebrow: "Made to Order", title: "Your Idea, Our Creativity", text: "Tell us your vision and we will bake it into a cake worth remembering.", image: IMG("q8dTKBzBM4U"), script: "Baked With Love" },
  { id: 3, eyebrow: "Freshly Baked", title: "Every Slice, A Celebration", text: "Soft sponge, rich cream and real fruit, delivered fresh to your door.", image: IMG("gRZYR210m0U"), script: "Taste the Joy" },
];

export const FEATURES = [
  { icon: "Star", title: "Premium Ingredients", text: "Only the finest, freshest ingredients." },
  { icon: "Truck", title: "Fast & Reliable Delivery", text: "Freshly baked and delivered to your door." },
  { icon: "Heart", title: "Custom Orders", text: "Have a special idea? We bring it to life." },
  { icon: "Egg", title: "100% Eggless Options", text: "Delicious cakes for everyone, without compromise." },
  { icon: "ShieldCheck", title: "Secure Payments", text: "Shop with confidence and ease." },
];

export const CATEGORIES = [
  { name: "Birthday Cakes", image: IMG("x1QmC6KRn9M", 600), to: "/cakes?category=birthday" },
  { name: "Anniversary Cakes", image: IMG("EUDtCsaL8iw", 600), to: "/cakes?category=anniversary" },
  { name: "Custom Cakes", image: IMG("89bdtHcfRBw", 600), to: "/custom-order" },
  { name: "Cupcakes & More", image: IMG("DIUJSBiJNoc", 600), to: "/cakes?category=cupcakes" },
];

export const CAKES = [
  { id: 1, name: "Chocolate Truffle Cake", price: 32, rating: 4.5, reviews: 124, image: IMG("gRZYR210m0U", 600), badge: "Best Seller", category: "birthday", flavor: "chocolate", dietary: "regular" },
  { id: 2, name: "Red Velvet Cake", price: 28, rating: 4.5, reviews: 98, image: IMG("L8nLqb9J-r4", 600), category: "anniversary", flavor: "red-velvet", dietary: "regular" },
  { id: 3, name: "Vanilla Berry Cake", price: 26, rating: 4.5, reviews: 75, image: IMG("9g7I6elbAXw", 600), category: "birthday", flavor: "vanilla", dietary: "regular" },
  { id: 4, name: "Black Forest Cake", price: 30, rating: 4.5, reviews: 112, image: IMG("2f0boZuyd3M", 600), category: "anniversary", flavor: "chocolate", dietary: "regular" },
  { id: 5, name: "Lemon Delight Cake", price: 27, rating: 4.5, reviews: 64, image: IMG("eqBpWmNv068", 600), badge: "New", category: "cupcakes", flavor: "lemon", dietary: "eggless" },
  { id: 6, name: "Strawberry Dream Cake", price: 29, rating: 4.5, reviews: 48, image: IMG("x1QmC6KRn9M", 600), category: "birthday", flavor: "strawberry", dietary: "regular" },
  { id: 7, name: "Caramel Bliss Cake", price: 31, rating: 4.5, reviews: 56, image: IMG("EUDtCsaL8iw", 600), category: "custom", flavor: "caramel", dietary: "regular" },
  { id: 8, name: "Oreo Delight Cake", price: 24, oldPrice: 28, rating: 4.5, reviews: 87, image: IMG("89bdtHcfRBw", 600), badge: "Sale", category: "cupcakes", flavor: "chocolate", dietary: "regular" },
  { id: 9, name: "Mango Paradise Cake", price: 26, rating: 4.5, reviews: 41, image: IMG("DIUJSBiJNoc", 600), category: "custom", flavor: "mango", dietary: "eggless" },
  { id: 10, name: "Salted Caramel Cake", price: 33, rating: 4.5, reviews: 73, image: IMG("L8nLqb9J-r4", 600), category: "anniversary", flavor: "caramel", dietary: "regular" },
  { id: 11, name: "Tiramisu Cake", price: 30, rating: 4.5, reviews: 69, image: IMG("gRZYR210m0U", 600), category: "custom", flavor: "chocolate", dietary: "regular" },
  { id: 12, name: "Funfetti Cake", price: 25, rating: 4.5, reviews: 52, image: IMG("9g7I6elbAXw", 600), badge: "New", category: "birthday", flavor: "vanilla", dietary: "eggless" },
];

export const CAKE_COUNT = 32;

export const INITIAL_REVIEWS = [
  { id: 1, name: "Sarah Khan", rating: 5, text: "The cake was absolutely delicious and beautifully decorated. Highly recommended!", avatar: "https://i.pravatar.cc/150?u=1001" },
  { id: 2, name: "Ahmed Raza", rating: 5, text: "Fresh, tasty and delivered on time. Will definitely order again!", avatar: "https://i.pravatar.cc/150?u=1002" },
  { id: 3, name: "Ayesha Malik", rating: 5, text: "Amazing quality and great customer service. The perfect cake for our anniversary!", avatar: "https://i.pravatar.cc/150?u=1003" },
];

// Detailed reviews for the Reviews page (images from Unsplash internet URLs)
export const REVIEWS = [
  {
    id: 1,
    name: "Ayesha Khan",
    date: "March 15, 2025",
    rating: 5,
    text: "Absolutely loved the cake! It was even more beautiful in person. The taste was heavenly and everyone at the party couldn't stop raving about it. Will definitely order again!",
    cakeImage: IMG("gRZYR210m0U", 400),
    cakeName: "Chocolate Truffle Cake",
    cakeType: "Birthday Cake",
    verified: true,
  },
  {
    id: 2,
    name: "Ahmed Raza",
    date: "February 28, 2025",
    rating: 5,
    text: "The custom cake was exactly what I imagined! The team was super helpful, and the final product was perfect. Great quality and on-time delivery. Highly recommended!",
    cakeImage: IMG("9g7I6elbAXw", 400),
    cakeName: "Vanilla Dream Cake",
    cakeType: "Custom Cake",
    verified: true,
  },
  {
    id: 3,
    name: "Sara Malik",
    date: "February 10, 2025",
    rating: 5,
    text: "I ordered a cake for my sister's birthday and it was a huge hit! Fresh, delicious, and beautifully decorated. The attention to detail is amazing!",
    cakeImage: IMG("L8nLqb9J-r4", 400),
    cakeName: "Red Velvet Cake",
    cakeType: "Birthday Cake",
    verified: true,
  },
  {
    id: 4,
    name: "Usman Ali",
    date: "January 22, 2025",
    rating: 5,
    text: "CakeDelight never disappoints! The flavor, presentation, and service are all top-notch. This was my third time ordering and I'm just as impressed as ever.",
    cakeImage: IMG("EUDtCsaL8iw", 400),
    cakeName: "Caramel Bliss Cake",
    cakeType: "Anniversary Cake",
    verified: true,
  },
  {
    id: 5,
    name: "Fatima Noor",
    date: "January 5, 2025",
    rating: 5,
    text: "The best cake shop I've ever ordered from! The cake was fresh, moist, and tasted amazing. The delivery was on time and the packaging was perfect.",
    cakeImage: IMG("x1QmC6KRn9M", 400),
    cakeName: "Floral Dream Cake",
    cakeType: "Wedding Cake",
    verified: true,
  },
  {
    id: 6,
    name: "Bilal Ahmed",
    date: "December 18, 2024",
    rating: 5,
    text: "I customized a cake with my own design and the team did an excellent job. It turned out exactly like the reference image. Great service and even better taste!",
    cakeImage: IMG("DIUJSBiJNoc", 400),
    cakeName: "Unicorn Cake",
    cakeType: "Custom Cake",
    verified: true,
  },
];

export const REVIEW_STATS = {
  averageRating: 4.9,
  totalReviews: "1,240+",
  happyCustomers: "98%",
  ratingOutOf: "4.9/5",
};

// Custom order configuration (images from Unsplash internet URLs)
export const CUSTOM_FLAVORS = [
  { id: "chocolate", name: "Chocolate", image: IMG("gRZYR210m0U", 300) },
  { id: "vanilla", name: "Vanilla", image: IMG("9g7I6elbAXw", 300) },
  { id: "red-velvet", name: "Red Velvet", image: IMG("L8nLqb9J-r4", 300) },
  { id: "strawberry", name: "Strawberry", image: IMG("x1QmC6KRn9M", 300) },
  { id: "caramel", name: "Caramel", image: IMG("EUDtCsaL8iw", 300) },
];

export const CUSTOM_SIZES = [
  { id: "6", name: "6 inch", serves: "(Serves 4-6)", price: 35 },
  { id: "8", name: "8 inch", serves: "(Serves 8-12)", price: 45 },
  { id: "10", name: "10 inch", serves: "(Serves 12-16)", price: 60 },
  { id: "12", name: "12 inch", serves: "(Serves 20+)", price: 80 },
];

export const CUSTOM_FROSTINGS = [
  { id: "buttercream", name: "Buttercream" },
  { id: "chocolate-ganache", name: "Chocolate Ganache" },
  { id: "cream-cheese", name: "Cream Cheese" },
  { id: "fondant", name: "Fondant" },
];

export const CUSTOM_FILLINGS = [
  { id: "chocolate-mousse", name: "Chocolate Mousse" },
  { id: "fresh-berries", name: "Fresh Berries" },
  { id: "creme", name: "Creme" },
  { id: "caramel", name: "Caramel" },
  { id: "oreo-crumb", name: "Oreo Crumble" },
  { id: "other", name: "Other (Specify)" },
];

export const CUSTOM_DESIGNS = [
  { id: "classic", name: "Classic", image: IMG("gRZYR210m0U", 300) },
  { id: "floral", name: "Floral", image: IMG("x1QmC6KRn9M", 300) },
  { id: "minimalist", name: "Minimalist", image: IMG("9g7I6elbAXw", 300) },
  { id: "themed", name: "Themed", image: IMG("L8nLqb9J-r4", 300) },
  { id: "drip", name: "Drip", image: IMG("2f0boZuyd3M", 300) },
  { id: "custom-design", name: "Custom Design", image: IMG("89bdtHcfRBw", 300) },
];

const CUSTOM_PRICE_BASE = 40;

export function computeCustomPrice({ sizeId, designId, fillingsCount = 0 }) {
  const size = CUSTOM_SIZES.find((s) => s.id === sizeId);
  const base = size ? size.price : CUSTOM_PRICE_BASE;
  const designPremium = designId === "custom-design" ? 15 : 0;
  const fillingsCost = fillingsCount * 5;
  return base + designPremium + fillingsCost;
}
