import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import PresetReveal from "../components/PresetReveal";
import { isPack, lookSlug, packDeal } from "../lib/presetDeal";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinked = useRef(false);

  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Opening a look puts it in the address (?look=amber-hour), so a story, a bio
  // link or a message can send someone straight to that look. Closing removes it.
  const openLook = (preset: any | null) => {
    setSelected(preset);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (preset) next.set("look", lookSlug(preset));
        else next.delete("look");
        return next;
      },
      { replace: true }
    );
  };

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

  // Once the catalog is in, open the look named in the address, if there is one.
  useEffect(() => {
    if (deepLinked.current || presets.length === 0) return;
    deepLinked.current = true;
    const wanted = searchParams.get("look")?.toLowerCase();
    const match = wanted ? presets.find((preset) => lookSlug(preset) === wanted) : null;
    if (match) setSelected(match);
  }, [presets, searchParams]);

  const featured = presets.filter((preset) => preset.featured === true);
  const deal = packDeal(presets, region);

  // Every preset that has both a before and an after photo takes a turn in the
  // auto-rotating reveal at the top (set the photos in the admin to add one).
  const revealLooks = presets.filter((preset) => preset.before_image && preset.after_image);

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

  // The featured section already shows these, so the list below leaves them out
  // instead of showing the same card twice.
  const showingFeatured = !filtering && featured.length > 0;
  const listed = showingFeatured ? filteredPresets.filter((preset) => preset.featured !== true) : filteredPresets;

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

        {!loading && !filtering && revealLooks.length > 0 && (
          <PresetReveal looks={revealLooks} onOpen={openLook} />
        )}

        {/* ---------- What every purchase includes (all true of the shop today) ---------- */}

        <ul className="mx-auto mb-8 flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-1.5 text-[12px] text-muted-foreground">
          <li>Download link by email as soon as you pay</li>
          <li>Lightroom Mobile and Desktop</li>
          <li>One payment, no subscription</li>
        </ul>

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
    badge={deal && isPack(preset) ? `Save ${deal.saveLabel}` : undefined}
    onOpen={() => openLook(preset)}
  />
))}
            </div>

          </section>
        )}

        {/* ---------- All Presets ---------- */}

        <section className="mb-24">

          <SectionDivider
            label={filtering ? "Results" : showingFeatured ? "More presets" : "All presets"}
            meta={loading ? undefined : `${listed.length} ${listed.length === 1 ? "look" : "looks"}`}
          />

          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : listed.length === 0 ? (
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

              {listed.map((preset, index) => (
  <PresetCard
    key={preset.id}
    name={preset.name}
    price={formatPrice(preset.price, region)}
    image={preset.thumbnail}
    collection={preset.collection}
    index={index}
    badge={deal && isPack(preset) ? `Save ${deal.saveLabel}` : undefined}
    onOpen={() => openLook(preset)}
  />
))}

            </div>
          )}

        </section>

        {/* ---------- Restore Download ---------- */}

        <section className="mb-24">
          <SectionDivider label="Your downloads" />
          <RestoreDownloadForm />
        </section>

        {/* ---------- FAQ ---------- */}

        <PresetFAQ />

        {/* ---------- Preset Popup ---------- */}

        {selected && (
          <PresetPopup
            open={true}
            onClose={() => openLook(null)}
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
            saveLabel={deal && isPack(selected) ? deal.saveLabel : undefined}
            upsell={
              deal && !isPack(selected)
                ? { packLabel: deal.packLabel, saveLabel: deal.saveLabel, onOpen: () => openLook(deal.pack) }
                : undefined
            }
          />
        )}

      </main>

      <BackToTop />
      <SocialFooter />
    </div>
  );
}