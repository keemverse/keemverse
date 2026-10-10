import { useState, type KeyboardEvent } from 'react';
import { DIGITAL_CRAFT_LAUNCH_AT } from '../lib/launch';
import type { Design, DesignPack } from '../lib/designs';
import { DesignTile } from './DesignTile';
import { PackTile } from './PackTile';
import { GarmentStudio } from './GarmentStudio';
import { CountdownTeaser } from './CountdownTeaser';
import { CustomDesignBand } from './CustomDesignBand';
import { Btn } from './CraftUI';

// Three paths in one switchable showcase, after the Arena v2 prototype's
// tabbed "ready design / custom design / bundle" panel: apparel designs,
// downloadable art packs, and a custom design request. Tabs follow the ARIA
// tabs pattern (arrow keys move between them).
const TABS = [
  { id: 'designs', label: 'Apparel', blurb: 'Original art on tees, hoodies and totes, ready to wear.' },
  { id: 'packs', label: 'Art packs', blurb: 'Packs of original art you can download.' },
  { id: 'custom', label: 'Custom design', blurb: "Tell me what you want and I'll design it for you." },
] as const;

export type ShowcaseTab = (typeof TABS)[number]['id'];

export function DigitalCraftShowcase({
  designs,
  packs,
  showDesigns,
  showPacks,
  tab: controlledTab,
  onTabChange,
}: {
  designs: Design[];
  packs: DesignPack[];
  showDesigns: boolean;
  showPacks: boolean;
  /** Optional: let the page (e.g. the hero buttons) choose the open tab. */
  tab?: ShowcaseTab;
  onTabChange?: (tab: ShowcaseTab) => void;
}) {
  const [innerTab, setInnerTab] = useState<ShowcaseTab>('designs');
  const tab = controlledTab ?? innerTab;
  const setTab = (t: ShowcaseTab) => {
    setInnerTab(t);
    onTabChange?.(t);
  };
  const [selectedId, setSelectedId] = useState<string | undefined>(designs[0]?.id);
  const [filter, setFilter] = useState<string | null>(null);

  // Filter chips come from the data (collections), and only appear when
  // there are at least two, so a small catalog never shows a useless filter.
  const collections = Array.from(new Set(designs.map((d) => d.collection).filter((c): c is string => !!c)));
  const visible = filter ? designs.filter((d) => d.collection === filter) : designs;
  const current = visible.find((d) => d.id === selectedId) ?? visible[0];

  // On narrow screens the studio sits below the grid, so picking a design
  // brings it into view; on wide screens it is already beside the grid.
  const selectDesign = (id: string) => {
    setSelectedId(id);
    if (window.matchMedia('(max-width: 1023px)').matches) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('dc-studio')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  };

  const studioDesigns = visible.map((d) => ({ id: d.id, name: d.name, image: d.image_url }));

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === tab);
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next.id);
    document.getElementById(`dc-tab-${next.id}`)?.focus();
  };

  return (
    <div>
      {/* one quiet segmented control; the open tab's one-line description sits under it */}
      <div className="mb-12 flex flex-col items-center gap-4">
        <div
          role="tablist"
          aria-label="Digital Craft"
          onKeyDown={onKeyDown}
          className="grid w-full max-w-md grid-cols-3 gap-1 rounded-full border border-border bg-card/60 p-1"
        >
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                id={`dc-tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={`dc-panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-2 py-2.5 text-[13px] font-semibold leading-none transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground md:text-sm ${
                  active ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <p className="text-center text-sm text-muted-foreground">{TABS.find((t) => t.id === tab)?.blurb}</p>
      </div>

      <div id="dc-panel-designs" role="tabpanel" aria-labelledby="dc-tab-designs" hidden={tab !== 'designs'}>
        {showDesigns ? (
          <div className="max-w-6xl mx-auto">
            {collections.length >= 2 && (
              <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter designs">
                {['All', ...collections].map((c) => {
                  const active = (c === 'All' && !filter) || c === filter;
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(c === 'All' ? null : c)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                        active ? 'bg-foreground text-background border-foreground' : 'bg-card text-muted-foreground border-border hover:border-foreground/40'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-10 items-start">
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                {visible.map((design, i) => (
                  <DesignTile
                    key={design.id}
                    design={design}
                    index={i}
                    selected={design.id === current?.id}
                    onSelect={selectDesign}
                  />
                ))}
              </div>

              <div id="dc-studio" className="lg:sticky lg:top-6 scroll-mt-6">
                <GarmentStudio
                  layout="panel"
                  designs={studioDesigns}
                  designId={current?.id}
                  onDesignChange={setSelectedId}
                  code={current?.code}
                  cta={
                    current?.purchase_link ? (
                      <Btn href={current.purchase_link} external className="w-full" icon={<span aria-hidden="true">→</span>}>
                        Buy {current.name}
                        {current.price ? ` · ${current.price}` : ''}
                      </Btn>
                    ) : (
                      <p className="text-center text-xs text-muted-foreground">Buying opens soon.</p>
                    )
                  }
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Don't see what you want? I can design it for you.</p>
              <Btn
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => {
                  setTab('custom');
                  requestAnimationFrame(() => document.getElementById('dc-tab-custom')?.scrollIntoView({ block: 'center' }));
                }}
                icon={<span aria-hidden="true">→</span>}
              >
                Get a custom design
              </Btn>
            </div>
          </div>
        ) : (
          <CountdownTeaser launchAt={DIGITAL_CRAFT_LAUNCH_AT} />
        )}
      </div>

      <div id="dc-panel-packs" role="tabpanel" aria-labelledby="dc-tab-packs" hidden={tab !== 'packs'}>
        {showPacks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 max-w-5xl mx-auto">
            {packs.map((pack, i) => (
              <PackTile key={pack.id} pack={pack} index={i} />
            ))}
          </div>
        ) : (
          <CountdownTeaser
            launchAt={DIGITAL_CRAFT_LAUNCH_AT}
            eyebrow="Art packs"
            heading="First pack coming soon."
            body="Packs of original art you can download. I'm putting the first one together."
          />
        )}
      </div>

      <div id="dc-panel-custom" role="tabpanel" aria-labelledby="dc-tab-custom" hidden={tab !== 'custom'}>
        <CustomDesignBand />
      </div>
    </div>
  );
}
