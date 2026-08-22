import { useEffect, useState } from "react";
import { motion } from "motion/react";

import SkeletonCard from "../components/SkeletonCard";
import PresetCard from "../components/PresetCard";
import { SocialFooter } from "../components/SocialFooter";
import UniverseSearch from "../components/UniverseSearch";
import UniverseTabs from "../components/UniverseTabs";
import SectionDivider from "../components/SectionDivider";
import { getPresets } from "../lib/products";
import PresetPopup from "../components/PresetPopup";

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
    getPresets()
      .then((data) => {
        console.log("Lightroom presets:", data);
        setPresets(data);
      })
      .catch((error) => {
        console.error("Failed to load Lightroom presets:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const featured = presets.filter(
    (preset) =>
      String(preset.Featured).toLowerCase() === "yes"
  );

  const filteredPresets = presets.filter((preset) => {
    const matchesCategory =
      activeTab === "All" ||
      preset.Collection === activeTab;

    const search = query.toLowerCase().trim();

    const matchesSearch =
      !search ||
      preset["Preset Name"]
        ?.toLowerCase()
        .includes(search) ||
      preset.Tags
        ?.toLowerCase()
        .includes(search) ||
      preset.Collection
        ?.toLowerCase()
        .includes(search);

    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="min-h-screen text-stone-900"
      style={{ backgroundColor: "#F5F2EA" }}
    >
      <main className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-0">

        {/* ---------- Intro ---------- */}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.35em] text-xs text-stone-500 mb-4">
            Lightroom Presets
          </p>

          <h1 className="font-serif text-3xl md:text-5xl text-stone-900 leading-tight">
            Create timeless photographs
          </h1>
        </motion.section>

        {/* ---------- Search ---------- */}

        <section className="mb-8">
          <UniverseSearch
            value={query}
            onChange={setQuery}
            placeholder="Search presets..."
          />
        </section>

        {/* ---------- Collections ---------- */}

        <section className="mb-20">
          <UniverseTabs
            tabs={categories}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </section>

        {/* ---------- Featured ---------- */}

        {featured.length > 0 && (
          <section className="mb-24">

            <SectionDivider label="Featured Presets" />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.map((preset, index) => (
  <PresetCard
    key={`${preset["Preset Name"]}-${index}`}
    name={preset["Preset Name"]}
    price={formatPrice(preset.Price)}
    image={preset["Preview Image"]}
    collection={preset.Collection}
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

              <h3 className="font-serif text-3xl text-stone-900">
                No presets found
              </h3>

              <p className="mt-3 text-stone-500">
                Try another search or browse another collection.
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">

              {filteredPresets.map((preset, index) => (
  <PresetCard
    key={`${preset["Preset Name"]}-${index}`}
    name={preset["Preset Name"]}
    price={formatPrice(preset.Price)}
    image={preset["Preview Image"]}
    collection={preset.Collection}
    index={index}
    onOpen={() => setSelected(preset)}
  />
))}

            </div>
          )}

        </section>

        {/* ---------- FAQ ---------- */}

        <section className="mb-24">

          <SectionDivider label="FAQ" />

          {/* FAQ will be added in the product-detail phase */}

                </section>

        {/* ---------- Preset Popup ---------- */}

        {selected && (
          <PresetPopup
            open={true}
            onClose={() => setSelected(null)}
            name={selected["Preset Name"]}
            price={formatPrice(selected.Price)}
            previewImage={selected["Preview Image"]}
            beforeImage={selected["Before Image"]}
            afterImage={selected["After Image"]}
            collection={selected.Collection}
            description={selected.Description}
            whyCreated={selected["Why I Created It"]}
            whatsIncluded={selected["What's Included"]}
            installation={selected.Installation}
            compatibleWith={selected["Compatible With"]}
            rating={selected.Rating}
            tags={
              selected.Tags
                ? String(selected.Tags)
                    .split(",")
                    .map((tag: string) => tag.trim())
                : []
            }
            purchaseLink={selected["Purchase Link"]}
          />
        )}

      </main>

      <SocialFooter />
    </div>
  );
}