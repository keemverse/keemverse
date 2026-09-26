import { useEffect, useState } from "react";
import { motion } from "motion/react";

import SkeletonCard from "../components/SkeletonCard";
import PresetCard from "../components/PresetCard";
import { SocialFooter } from "../components/SocialFooter";
import UniverseSearch from "../components/UniverseSearch";
import UniverseTabs from "../components/UniverseTabs";
import SectionDivider from "../components/SectionDivider";
import { getCatalogProducts } from "../lib/products";
import PresetPopup from "../components/PresetPopup";
import RestoreDownloadForm from "../components/RestoreDownloadForm";
import PresetFAQ from "../components/PresetFAQ";

const categories = [
  "All",
  "Editorial",
  "Portrait",
  "Lifestyle",
  "Street",
  "Travel",
  "Minimal",
  "Moody",
  "Vintage",
];

const formatPrice = (price: any) => {
  const raw = String(price ?? "").trim();

  const number = parseFloat(
    raw.replace(/[^0-9.]/g, "")
  );

  if (isNaN(number)) return raw;

  if (raw.startsWith("$")) {
    return `$${number.toLocaleString()}`;
  }

  return `₦${number.toLocaleString()}`;
};

export default function LightroomPresetsPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selected, setSelected] = useState<any | null>(null);

  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCatalogProducts("preset")
      .then((data) => {
        // The API's default sort is by creation date, but presets have a
        // deliberate curated order (bundle first, then each look) — that's
        // display_order, not when the row happened to be added.
        const sorted = [...data].sort(
          (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)
        );
        setPresets(sorted);
      })
      .catch((error) => {
        console.error("Failed to load Lightroom presets:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const featured = presets.filter((preset) => preset.featured === true);

  const filteredPresets = presets.filter((preset) => {
    const matchesCategory =
      activeTab === "All" ||
      preset.collection === activeTab;

    const search = query.toLowerCase().trim();

    const matchesSearch =
      !search ||
      preset.name?.toLowerCase().includes(search) ||
      preset.tags?.toLowerCase().includes(search) ||
      preset.collection?.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="min-h-screen bg-background text-foreground"
    >
      <main className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-0">

        {/* ---------- Intro ---------- */}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.35em] text-xs text-muted-foreground mb-4">
            Lightroom Presets
          </p>

          <h1 className="font-serif text-2xl md:text-5xl text-foreground leading-tight">
            Create timeless photographs
          </h1>
        </motion.section>

        {/* ---------- Search + Collections ---------- */}

        <section className="mb-12">
          <div className="flex items-stretch gap-3 max-w-[520px] mx-auto">
            <UniverseSearch
              value={query}
              onChange={setQuery}
              placeholder="Search presets..."
            />
            <UniverseTabs
              tabs={categories}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </section>

        {/* ---------- Featured ---------- */}

        {featured.length > 0 && (
          <section className="mb-24">

            <SectionDivider label="Featured Presets" />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.map((preset, index) => (
  <PresetCard
    key={preset.id}
    name={preset.name}
    price={formatPrice(preset.price)}
    image={preset.thumbnail}
    collection={preset.collection}
    index={index}
    onOpen={() => setSelected(preset)}
  />
))}
            </div>

          </section>
        )}

        {/* ---------- All Presets ---------- */}

        <section className="mb-24">

          <SectionDivider label="All Presets" />

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : filteredPresets.length === 0 ? (
            <div className="py-24 text-center">

              <div className="text-5xl mb-4">
                🔍
              </div>

              <h3 className="font-serif text-3xl text-foreground">
                No presets found
              </h3>

              <p className="mt-3 text-muted-foreground">
                Try another search or browse another collection.
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">

              {filteredPresets.map((preset, index) => (
  <PresetCard
    key={preset.id}
    name={preset.name}
    price={formatPrice(preset.price)}
    image={preset.thumbnail}
    collection={preset.collection}
    index={index}
    onOpen={() => setSelected(preset)}
  />
))}

            </div>
          )}

        </section>

        {/* ---------- Restore Download ---------- */}

        <section className="mb-24">
          <SectionDivider label="Already Purchased?" />
          <RestoreDownloadForm />
        </section>

        {/* ---------- FAQ ---------- */}

        <PresetFAQ />

        {/* ---------- Preset Popup ---------- */}

        {selected && (
          <PresetPopup
            open={true}
            onClose={() => setSelected(null)}
            name={selected.name}
            price={formatPrice(selected.price)}
            rawPrice={selected.price}
            previewImage={selected.thumbnail}
            banner={selected.banner}
            collection={selected.collection}
            description={selected.description}
            whyCreated={selected.why_created}
            whatsIncluded={selected.whats_included}
            installation={selected.installation}
            compatibleWith={selected.compatible_with}
            rating={selected.rating}
            tags={
              selected.tags
                ? String(selected.tags)
                    .split(",")
                    .map((tag: string) => tag.trim())
                : []
            }
            purchaseLink={selected.purchase_link}
          />
        )}

      </main>

      <SocialFooter />
    </div>
  );
}