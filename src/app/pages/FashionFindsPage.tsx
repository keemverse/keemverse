import { useEffect, useState } from "react";
import { motion } from "motion/react";

import SkeletonCard from "../components/SkeletonCard";
import UniverseSearch from "../components/UniverseSearch";
import UniverseTabs from "../components/UniverseTabs";
import ProductCard from "../components/ProductCard";
import TemuScrollBanner from "../components/TemuScrollBanner";
import ProductPopup from "../components/ProductPopup";
import { SocialFooter } from "../components/SocialFooter";
import { getProducts } from "../lib/products";
import FashionFAQ from "../components/FashionFAQ";
import SectionDivider from "../components/SectionDivider";
const categories = [
  "All",
  "Sneakers",
  "Tops",
  "Bottoms",
  "Accessories",
  "Lifestyle",
  "Tech",
];

const formatPrice = (price: any) => {
  const raw = String(price).trim();

  const number = parseFloat(raw.replace(/[^0-9.]/g, ""));

  if (isNaN(number)) return raw;

  if (raw.startsWith("$")) {
    return `$${number.toLocaleString()}`;
  }

  return `₦${number.toLocaleString()}`;
};

export default function FashionFindsPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selected, setSelected] = useState<any | null>(null);

  const [products, setProducts] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  getProducts()
    .then((data) => {
  console.log(data);
  console.log(data.map((p) => p["Affiliate Link"]));
  setProducts(data);
})
    .catch(console.error)
    .finally(() => {
      setLoading(false);
    });
}, []);

  const featured = products.filter(
  (p) => String(p.Featured).toLowerCase() === "yes"
);
const filteredProducts = products.filter((p) => {
  const matchesCategory =
    activeTab === "All" ||
    p.Category === activeTab;

  const search = query.toLowerCase();

  const matchesSearch =
    p["Product Name"]?.toLowerCase().includes(search) ||
    p.Tags?.toLowerCase().includes(search);

  return matchesCategory && matchesSearch;
});

  return (
    <div
      className="min-h-screen text-stone-900"
      style={{ backgroundColor: "#F5F2EA" }}
    >
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-12">
        <motion.section
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center mb-10"
>
  <p className="uppercase tracking-[0.35em] text-xs text-stone-500 mb-2">
    My Finds
  </p>

  <p className="font-serif text-stone-900 text-xl md:text-2xl">
    personally selected for their design, quality or value.
  </p>
</motion.section>

        <UniverseSearch
  value={query}
  onChange={setQuery}
  className="mb-8"
/>

<UniverseTabs
  tabs={categories}
  activeTab={activeTab}
  onChange={setActiveTab}
  className="mb-12"
/>

        {!loading && (
          <TemuScrollBanner
            products={products}
            formatPrice={formatPrice}
            onSelect={setSelected}
            storefrontUrl="https://temu.to/k/e3d0e4ta2g4"
          />
        )}

        {featured.length > 0 && (
          <>
            <SectionDivider label="Featured Finds" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {featured.map((product) => (
  <ProductCard
  key={`${product["Product Name"]}-${product.Source}`}
  name={product["Product Name"]}
  price={formatPrice(product.Price)}
  image={product["Image URL"]}
  source={product.Source}
  category={product.Category}
  buttonText="SHOP NOW"
affiliateLink={product["Affiliate Link"]}
onOpen={() => setSelected(product)}
/>
))}
            </div>
          </>
        )}

        <div id="all-finds">
        <SectionDivider label="All Finds" />

{loading ? (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
) : filteredProducts.length === 0 ? (
  <div className="py-24 text-center">
    <div className="text-5xl mb-4">🔍</div>

    <h3 className="font-serif text-3xl text-stone-900">
      No curated finds
    </h3>

    <p className="mt-3 text-stone-500">
      Try another search or browse another category.
    </p>

    <button
      onClick={() => {
        setQuery("");
        setActiveTab("All");
      }}
      className="mt-8 rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.18em] text-white hover:bg-black transition"
    >
      Clear Search
    </button>
  </div>
) : (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    {filteredProducts.map((product) => (
      <ProductCard
        key={`${product["Product Name"]}-${product.Source}`}
        name={product["Product Name"]}
        price={formatPrice(product.Price)}
        image={product["Image URL"]}
        source={product.Source}
        category={product.Category}
        buttonText="SHOP NOW"
affiliateLink={product["Affiliate Link"]}
onOpen={() => setSelected(product)}
      />
    ))}
  </div>
)}
        </div>

{selected && (
 <ProductPopup
  open={true}
  onClose={() => setSelected(null)}
  name={selected["Product Name"]}
  price={formatPrice(selected.Price)}
  image={selected["Image URL"]}
  source={selected.Source}
  category={selected.Category}
  description={selected.Description || ""}
  rating={selected.Rating}
  tags={
    selected.Tags
      ? String(selected.Tags)
          .split(",")
          .map((t: string) => t.trim())
      : []
  }
  whyPicked={selected["Why I Picked"] || ""}
  affiliateLink={selected["Affiliate Link"]}
/>
)}

<FashionFAQ />

</main>

<SocialFooter />
    </div>
  );
}
