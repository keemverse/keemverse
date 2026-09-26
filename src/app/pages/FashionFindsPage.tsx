import { useEffect, useState } from "react";
import { motion } from "motion/react";

import SkeletonCard from "../components/SkeletonCard";
import UniverseSearch from "../components/UniverseSearch";
import UniverseTabs from "../components/UniverseTabs";
import ProductCard from "../components/ProductCard";
import TemuScrollBanner from "../components/TemuScrollBanner";
import ProductPopup from "../components/ProductPopup";
import { SocialFooter } from "../components/SocialFooter";
import { getCatalogProducts } from "../lib/products";
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
  getCatalogProducts("fashion_find")
    .then((data) => {
      setProducts(data);
    })
    .catch(console.error)
    .finally(() => {
      setLoading(false);
    });
}, []);

  const featured = products.filter((p) => p.featured === true);
const filteredProducts = products.filter((p) => {
  const matchesCategory =
    activeTab === "All" ||
    p.category === activeTab;

  const search = query.toLowerCase();

  const matchesSearch =
    p.name?.toLowerCase().includes(search) ||
    p.tags?.toLowerCase().includes(search);

  return matchesCategory && matchesSearch;
});

  return (
    <div
      className="min-h-screen bg-background text-foreground"
    >
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-12">
        <motion.section
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center mb-10"
>
  <p className="uppercase tracking-[0.35em] text-xs text-muted-foreground mb-2">
    My Finds
  </p>

  <p className="font-serif text-foreground text-xl md:text-2xl">
    personally selected for their design, quality or value.
  </p>
</motion.section>

        <div className="flex items-stretch gap-3 max-w-[520px] mx-auto mb-12">
          <UniverseSearch
            value={query}
            onChange={setQuery}
          />

          <UniverseTabs
            tabs={categories}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

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
  key={product.id}
  name={product.name}
  price={formatPrice(product.price)}
  image={product.image_url}
  source={product.source}
  category={product.category}
  buttonText="SHOP NOW"
affiliateLink={product.affiliate_link}
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

    <h3 className="font-serif text-3xl text-foreground">
      No curated finds
    </h3>

    <p className="mt-3 text-muted-foreground">
      Try another search or browse another category.
    </p>

    <button
      onClick={() => {
        setQuery("");
        setActiveTab("All");
      }}
      className="mt-8 rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-[0.18em] text-background hover:opacity-90 transition"
    >
      Clear Search
    </button>
  </div>
) : (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    {filteredProducts.map((product) => (
      <ProductCard
        key={product.id}
        name={product.name}
        price={formatPrice(product.price)}
        image={product.image_url}
        source={product.source}
        category={product.category}
        buttonText="SHOP NOW"
affiliateLink={product.affiliate_link}
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
  name={selected.name}
  price={formatPrice(selected.price)}
  image={selected.image_url}
  source={selected.source}
  category={selected.category}
  description={selected.description || ""}
  rating={selected.rating}
  tags={
    selected.tags
      ? String(selected.tags)
          .split(",")
          .map((t: string) => t.trim())
      : []
  }
  whyPicked={selected.why_picked || ""}
  affiliateLink={selected.affiliate_link}
/>
)}

<FashionFAQ />

</main>

<SocialFooter />
    </div>
  );
}
