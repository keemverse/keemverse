import { useEffect, useState } from "react";
import { motion } from "motion/react";

import SkeletonCard from "../components/SkeletonCard";
import PresetCard from "../components/PresetCard";
import { SocialFooter } from "../components/SocialFooter";
import UniverseSearch from "../components/UniverseSearch";
import FilterChips from "../components/ui/FilterChips";
import EmptyState from "../components/EmptyState";
import BackToTop from "../components/BackToTop";
import SectionDivider from "../components/SectionDivider";
import { getCatalogProducts } from "../lib/products";
import { formatPrice } from "../lib/currency";
import { useRegion } from "../lib/geo";
import { useContent } from "../lib/siteContent";
import PresetPopup from "../components/PresetPopup";
import RestoreDownloadForm from "../components/RestoreDownloadForm";
import PresetFAQ from "../components/PresetFAQ";
import BeforeAfter from "../components/ui/BeforeAfter";

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


export default function LightroomPresetsPage() {
  const t = useContent();
  const region = useRegion();
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

  // The look shown in the auto-playing before/after reveal: the first preset
  // that has both photos (set them in the admin to change it).
  const hookPreset = presets.find((preset) => preset.before_image && preset.after_image);

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

  const counts: Record<string, number> = {};
  for (const p of presets) counts[p.collection] = (counts[p.collection] ?? 0) + 1;
  const filtering = activeTab !== "All" || query.trim().length > 0;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
    >
      <main className="max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-0">

        {/* ---------- Intro ---------- */}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <p className="eyebrow text-amber-ink">{t("presets.eyebrow")}</p>

          <h1 className="mt-3 text-display-lg">
            {t("presets.title")}
          </h1>

          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            {t("presets.subtitle")}
          </p>
        </motion.section>

        {/* ---------- Before / after reveal (the ad hook) ---------- */}

        {!loading && !filtering && hookPreset && (
          <motion.section
            aria-label="Before and after"
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 130, damping: 17, delay: 0.2 }}
            className="mx-auto mb-14 grid max-w-4xl items-center gap-8 md:mb-16 md:grid-cols-2 md:gap-12"
          >
            <BeforeAfter
              autoplay
              aspect="aspect-[3/4]"
              className="mx-auto max-w-[22rem] shadow-2xl md:max-w-none"
              before={hookPreset.before_image}
              after={hookPreset.after_image}
              alt={String(hookPreset.name || "Preset").replace(": Lightroom Preset", "")}
            />

            <div className="text-center md:text-left">
              <p className="eyebrow text-amber-ink">{String(hookPreset.name || "").replace(": Lightroom Preset", "")}</p>
              <h2 className="mt-3 text-display-md">{t("presets.hookTitle")}</h2>
              <p className="mx-auto mt-3 max-w-sm text-muted-foreground md:mx-0">{t("presets.hookBody")}</p>
              <button
                type="button"
                onClick={() => setSelected(hookPreset)}
                className="press mt-6 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
              >
                {t("presets.hookCta")}
              </button>
            </div>
          </motion.section>
        )}

        {/* ---------- Search + Collections ---------- */}

        <div className="mx-auto max-w-3xl">
          <UniverseSearch
            value={query}
            onChange={setQuery}
            placeholder="Search presets..."
          />
        </div>

        <div className="sticky top-[var(--nav-h,0px)] z-30 -mx-5 mb-10 mt-4 glass-bar px-5 py-2.5 md:-mx-8 md:px-8">
          <div className="mx-auto max-w-3xl">
            <FilterChips tabs={categories} activeTab={activeTab} onChange={setActiveTab} counts={counts} label="Filter by collection" />
          </div>
        </div>

        {/* ---------- Featured ---------- */}

        {loading && (
          <section className="mb-16" aria-hidden="true">
            <div className="mb-7 mt-16 h-[3.25rem]" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        )}

        {!filtering && featured.length > 0 && (
          <section className="mb-16">

            <SectionDivider label="Featured presets" meta={`${featured.length} ${featured.length === 1 ? "look" : "looks"}`} />

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
              {featured.map((preset, index) => (
  <PresetCard
    key={preset.id}
    name={preset.name}
    price={formatPrice(preset.price, region)}
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

          <SectionDivider
            label={filtering ? "Results" : "All presets"}
            meta={loading ? undefined : `${filteredPresets.length} ${filteredPresets.length === 1 ? "look" : "looks"}`}
          />

          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : filteredPresets.length === 0 ? (
            <EmptyState
              title="No presets match that"
              body="Try another word, or browse a different collection."
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
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">

              {filteredPresets.map((preset, index) => (
  <PresetCard
    key={preset.id}
    name={preset.name}
    price={formatPrice(preset.price, region)}
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
            price={formatPrice(selected.price, region)}
            rawPrice={selected.price}
            previewImage={selected.thumbnail}
            banner={selected.banner}
            beforeImage={selected.before_image}
            afterImage={selected.after_image}
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

      <BackToTop />
      <SocialFooter />
    </div>
  );
}