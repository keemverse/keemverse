import { Focus, MaskLine } from "../components/ui/Cine";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Every look has its own page. Cards and the reveal button go there.
  const openLook = (preset: any) => navigate(`/fashion/presets/${lookSlug(preset)}`);

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

  // Old links like /fashion/presets?look=amber-hour go to that look's page.
  useEffect(() => {
    const wanted = searchParams.get("look")?.toLowerCase();
    if (!wanted || presets.length === 0) return;
    const match = presets.find((preset) => lookSlug(preset) === wanted);
    if (match) {
      // Keep the tracking parameters (utm_source and friends) so the visit is still counted.
      const rest = new URLSearchParams(searchParams);
      rest.delete("look");
      const qs = rest.toString();
      navigate(`/fashion/presets/${lookSlug(match)}${qs ? `?${qs}` : ""}`, { replace: true });
    }
  }, [presets, searchParams, navigate]);

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

        <section className="mx-auto mb-10 max-w-2xl text-center">
          <Focus as="p" immediate blur={false} y={10} className="eyebrow text-amber-ink">
            {t("presets.eyebrow")}
          </Focus>

          <h1 className="mt-3 text-display-lg">
            <MaskLine immediate delay={0.1}>{t("presets.title")}</MaskLine>
          </h1>

          <Focus as="p" immediate delay={0.4} y={12} className="mx-auto mt-4 max-w-md text-muted-foreground">
            {t("presets.subtitle")}
          </Focus>
        </section>

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

      </main>

      <BackToTop />
      <SocialFooter />
    </div>
  );
}