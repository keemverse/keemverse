import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import SkeletonCard from "../components/SkeletonCard";
import UniverseSearch from "../components/UniverseSearch";
import FilterChips from "../components/ui/FilterChips";
import ProductCard from "../components/ProductCard";
import TemuScrollBanner from "../components/TemuScrollBanner";
import ProductPopup from "../components/ProductPopup";
import EmptyState from "../components/EmptyState";
import BackToTop from "../components/BackToTop";
import { SocialFooter } from "../components/SocialFooter";
import { getCatalogProducts } from "../lib/products";
import { formatPrice } from "../lib/currency";
import { useRegion } from "../lib/geo";
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

export default function FashionFindsPage() {
  // Fashion Finds are affiliate picks bought on Temu, so the price shown is a
  // guide for visitors in Nigeria only; abroad the price is left off.
  const region = useRegion();
  const showPrice = (price: any) => (region === "NG" ? formatPrice(price, "NG") : "");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selected, setSelected] = useState<any | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCatalogProducts("fashion_find")
      .then((data) => {
        // Items with a manually-set display_order (dragged into place in
        // /admin/products) float to the top in that order; everything else
        // keeps the API's default order (newest first) — a stable sort, so
        // this changes nothing until display_order actually gets used.
        const sorted = [...data].sort(
          (a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999)
        );
        setProducts(sorted);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [products]);

  const search = query.toLowerCase().trim();
  const filtering = activeTab !== "All" || search.length > 0;

  const featured = products.filter((p) => p.featured === true);
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeTab === "All" || p.category === activeTab;
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search) ||
      p.tags?.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-12">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="eyebrow text-amber-ink">My finds</p>
          <h1 className="mt-3 text-display-lg">Picked because they earn their place.</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Personally selected for their design, quality or value. Tap a piece for the quick view, or go straight to the shop.
          </p>
        </motion.section>

        <div className="mx-auto mt-8 max-w-3xl">
          <UniverseSearch value={query} onChange={setQuery} placeholder="Search finds..." />
        </div>

        {/* Categories stay in reach while the grid scrolls. */}
        <div className="sticky top-[var(--nav-h,0px)] z-30 -mx-5 mt-4 border-b border-border/60 bg-background/85 px-5 py-2.5 backdrop-blur-xl md:-mx-8 md:px-8">
          <div className="mx-auto max-w-3xl">
            <FilterChips tabs={categories} activeTab={activeTab} onChange={setActiveTab} counts={counts} />
          </div>
        </div>

        {!loading && !filtering && (
          <div className="mt-10">
            <TemuScrollBanner
              products={products}
              formatPrice={showPrice}
              onSelect={setSelected}
              storefrontUrl="https://temu.to/k/e3d0e4ta2g4"
            />
          </div>
        )}

        {!filtering && featured.length > 0 && (
          <>
            <SectionDivider label="Featured finds" meta={`${featured.length} ${featured.length === 1 ? "pick" : "picks"}`} />

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4 mb-8">
              {featured.map((product, i) => (
                <ProductCard
                  key={product.id}
                  index={i}
                  name={product.name}
                  price={showPrice(product.price)}
                  image={product.image_url}
                  source={product.source}
                  category={product.category}
                  buttonText="Shop now"
                  affiliateLink={product.affiliate_link}
                  onOpen={() => setSelected(product)}
                />
              ))}
            </div>
          </>
        )}

        <div id="all-finds">
          <SectionDivider
            label={filtering ? "Results" : "All finds"}
            meta={loading ? undefined : `${filteredProducts.length} ${filteredProducts.length === 1 ? "find" : "finds"}`}
          />

          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="Nothing matches that yet"
              body="Try another word, or browse a different category."
              action={
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveTab("All");
                  }}
                  className="press rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
              {filteredProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  index={i}
                  name={product.name}
                  price={showPrice(product.price)}
                  image={product.image_url}
                  source={product.source}
                  category={product.category}
                  buttonText="Shop now"
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
            price={showPrice(selected.price)}
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

      <BackToTop />
      <SocialFooter />
    </div>
  );
}
