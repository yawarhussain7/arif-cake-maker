import { useState, useMemo } from "react";
import { Image as ImageIcon, Search as SearchIcon, X as XIcon, Maximize as MaximizeIcon } from "lucide-react";
import CakeImage from "../components/CakeImage.jsx";
import { GALLERY_IMAGES } from "../data";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "chocolate", label: "Chocolate" },
  { id: "wedding", label: "Wedding" },
  { id: "fruit", label: "Fruit" },
  { id: "caramel", label: "Caramel" },
  { id: "birthday", label: "Birthday" },
  { id: "cupcakes", label: "Cupcakes" },
  { id: "custom", label: "Custom" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const filtered = useMemo(() => {
    return GALLERY_IMAGES.filter((img) => {
      const matchCategory = activeCategory === "all" || img.category === activeCategory;
      const matchSearch = img.title.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-sand overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-EUDtCsaL8iw?auto=format&fit=crop&w=1600&q=80" alt="Gallery hero" className="h-[420px] w-full object-cover object-center" loading="eager" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-3xl text-center">
            <p className="text-[10px] tracking-[0.25em] text-brand font-semibold uppercase">Gallery</p>
            <h1 className="mt-2 text-5xl font-medium text-ink lg:text-6xl">Cake Gallery</h1>
            <p className="mt-4 max-w-md mx-auto text-sm text-ink/70 leading-relaxed">
              Browse our collection of handcrafted cakes. Each design is made to order with the finest ingredients.
            </p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <SearchIcon size={16} className="absolute left-3 top-3 text-ink/40" />
              <input
                type="text"
                placeholder="Search cakes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-sm border border-ink/15 bg-white px-4 py-2.5 pl-10 text-sm outline-none focus:border-brand"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition ${activeCategory === cat.id ? "bg-brand text-white" : "border border-ink/15 bg-white text-ink/60 hover:border-brand/30 hover:text-brand"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-ink/40 hidden lg:block">{filtered.length} cakes</span>
          </div>
        </div>
      </section>

      {/* Image Grid */}
      <section className="py-12 bg-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((img) => (
              <div key={img.id} className="group rounded-lg overflow-hidden border border-ink/10 bg-white shadow-sm hover:shadow-md transition">
                <button
                  onClick={() => { setSelectedImage(img); setModalOpen(true); }}
                  className="aspect-square relative"
                  aria-label={`View ${img.title}`}
                >
                  <CakeImage src={img.image} alt={img.title} className="h-full w-full object-cover object-center" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <MaximizeIcon size={20} className="text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                    <h3 className="text-sm font-medium text-white">{img.title}</h3>
                  </div>
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <ImageIcon size={32} className="mx-auto mb-3 text-ink/20" />
                <p className="text-sm text-ink/50">No cakes found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-ink/60 hover:text-brand transition"
              aria-label="Close"
            >
              <XIcon size={20} />
            </button>
            <div className="relative rounded-lg overflow-hidden border border-white/20 shadow-2xl">
              <CakeImage src={selectedImage.image} alt={selectedImage.title} className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <div>
                  <h2 className="text-2xl font-medium text-white">{selectedImage.title}</h2>
                  <p className="text-sm text-white/70 mt-1">{selectedImage.category.charAt(0).toUpperCase() + selectedImage.category.slice(1)} cake</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-ink/40">Press Esc or click outside to close</p>
          </div>
        </div>
      )}
    </>
  );
}
