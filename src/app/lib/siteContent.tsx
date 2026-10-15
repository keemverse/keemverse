import { Fragment, useEffect, useState, type ReactNode } from 'react';

// Editable site copy. The wording the site ships with lives here as DEFAULTS;
// anything changed in the admin console (Admin > Content) is stored in
// data/site-content.json and overrides the default for that key. If the
// content API is unreachable the site simply shows the defaults, so a failure
// here can never blank a page.
//
// Accent markup, usable in any field marked `accent`:
//   *word*   amber        ~word~   teal        **word**   bold

export type FieldDef = {
  key: string;
  label: string;
  default: string;
  /** Plain one-liner (default), or a taller box for longer copy. */
  multiline?: boolean;
  /** Supports the *amber*, ~teal~ and **bold** markup. */
  accent?: boolean;
  help?: string;
};

export type GroupDef = { id: string; title: string; description: string; fields: FieldDef[] };

export const CONTENT_GROUPS: GroupDef[] = [
  {
    id: 'home',
    title: 'Home page',
    description: 'The first thing people see, the two shop previews and the closing card.',
    fields: [
      { key: 'home.headline_1', label: 'Headline, line 1', default: 'One *creator*', accent: true, help: 'Wrap a word in *stars* for amber.' },
      { key: 'home.headline_2', label: 'Headline, line 2', default: 'two ~crafts~', accent: true, help: 'Wrap a word in ~tildes~ for teal.' },
      { key: 'home.tagline', label: 'Tagline', default: 'Helping people build wardrobes and helping brands build production-ready artwork.', multiline: true },
      { key: 'home.finds_eyebrow', label: 'Finds section, small label', default: 'Fashion finds' },
      { key: 'home.finds_title', label: 'Finds section, title', default: 'Fresh picks, chosen by hand' },
      { key: 'home.presets_eyebrow', label: 'Presets section, small label', default: 'Lightroom presets' },
      { key: 'home.presets_title', label: 'Presets section, title', default: 'Looks you can reuse' },
      { key: 'home.cta_eyebrow', label: 'Closing card, small label', default: 'Something specific in mind?' },
      { key: 'home.cta_title', label: 'Closing card, title', default: "Tell me what you need and I'll make it." },
      { key: 'home.cta_body', label: 'Closing card, text', default: 'Brand collaborations, custom artwork or a styling project. A short note is enough to start.', multiline: true },
      { key: 'home.cta_primary', label: 'Closing card, main button', default: 'Start a project' },
      { key: 'home.cta_secondary', label: 'Closing card, second button', default: 'See the craft side' },
    ],
  },
  {
    id: 'craft',
    title: 'Craft page',
    description: 'The Digital Craft hero.',
    fields: [
      { key: 'craft.eyebrow', label: 'Small label above the headline', default: 'Digital craftsmanship' },
      {
        key: 'craft.headline',
        label: 'Headline',
        default: 'Original *art*, designed for production ~quality.~',
        accent: true,
        multiline: true,
        help: '*stars* = amber, ~tildes~ = teal.',
      },
      {
        key: 'craft.sub',
        label: 'Supporting paragraph',
        default:
          "Tired of the same prints everywhere? I'm Keem. I design original art for creators and small brands, from concept to production-ready files: **wear it**, **download it**, or **have something made just for you**.",
        accent: true,
        multiline: true,
        help: '**double stars** make text bold.',
      },
      { key: 'craft.cta_shop', label: 'Button 1', default: 'Shop apparel' },
      { key: 'craft.cta_packs', label: 'Button 2', default: 'Art packs' },
      { key: 'craft.cta_custom', label: 'Text link', default: 'Get a custom design' },
    ],
  },
  {
    id: 'finds',
    title: 'Fashion Finds page',
    description: 'The heading above the finds grid.',
    fields: [
      { key: 'finds.eyebrow', label: 'Small label', default: 'My finds' },
      { key: 'finds.title', label: 'Title', default: 'Picked because they earn their place.' },
      { key: 'finds.subtitle', label: 'Subtitle', default: 'Personally selected for their design, quality or value. Tap a piece for the quick view, or go straight to the shop.', multiline: true },
    ],
  },
  {
    id: 'presets',
    title: 'Presets page',
    description: 'The heading above the presets grid.',
    fields: [
      { key: 'presets.eyebrow', label: 'Small label', default: 'Lightroom presets' },
      { key: 'presets.title', label: 'Title', default: 'Create timeless photographs' },
      { key: 'presets.subtitle', label: 'Subtitle', default: "Edit once, keep the look. Pick a collection and open any preset to see what's inside.", multiline: true },
    ],
  },
  {
    id: 'fashion',
    title: 'Fashion page',
    description: 'The photo carousel headline and the introduction under it.',
    fields: [
      { key: 'fashion.eyebrow', label: 'Small label on the photo', default: 'Fashion storyteller' },
      { key: 'fashion.headline', label: 'Headline on the photo', default: 'Visual identity through style, emotion, and atmosphere.', multiline: true },
      { key: 'fashion.intro_hi', label: 'Greeting', default: "Hi, I'm Keem." },
      { key: 'fashion.intro_title', label: 'Introduction headline', default: 'I believe style is visual storytelling.' },
      { key: 'fashion.intro_body', label: 'Introduction text', default: 'I help people build wardrobes, campaigns, and creative worlds that feel unmistakably theirs.', multiline: true },
    ],
  },
  {
    id: 'contact',
    title: 'Contact page',
    description: 'The line above the brief form.',
    fields: [
      {
        key: 'contact.intro',
        label: 'Introduction',
        default:
          'Have a question, a collaboration idea, or need support with an order? Send a brief below, or reach out directly. I work with brands, studios and creators anywhere in the world, and all of it is handled remotely. We respond to all customer enquiries within 1 business day.',
        multiline: true,
      },
    ],
  },
];

export const DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.default]))
);

// ── loading ────────────────────────────────────────────────────────────────

const STORE_KEY = 'kv_content_v1';
let cache: Record<string, string> | null = null;
let pending: Promise<Record<string, string>> | null = null;
const listeners = new Set<() => void>();

function readStored(): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function load(): Promise<Record<string, string>> {
  if (!pending) {
    pending = fetch('/api/content')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => (data && typeof data === 'object' ? (data as Record<string, string>) : {}))
      .catch(() => ({}))
      .then((data) => {
        cache = data;
        try {
          sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
        } catch {
          /* private window */
        }
        listeners.forEach((l) => l());
        return data;
      });
  }
  return pending;
}

/** The text for a key: the console's value if there is one, else the default. */
export function useContent() {
  const [, force] = useState(0);

  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    if (cache === null) {
      cache = readStored();
      if (cache) force((n) => n + 1);
    }
    // always refresh once per visit, so a change in the console shows on the next load
    void load();
    return () => {
      listeners.delete(l);
    };
  }, []);

  return (key: string): string => {
    const stored = cache ?? readStored();
    return (stored && stored[key]) || DEFAULTS[key] || '';
  };
}

// ── accent markup ──────────────────────────────────────────────────────────

/** Turns "Original *art*, designed for ~quality.~" into styled pieces. */
export function Accent({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|~[^~]+~)/g).filter((p) => p !== '');
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4)
          return (
            <strong key={i} className="text-foreground font-semibold">
              {p.slice(2, -2)}
            </strong>
          );
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2)
          return (
            <span key={i} className="text-amber-display">
              {p.slice(1, -1)}
            </span>
          );
        if (p.startsWith('~') && p.endsWith('~') && p.length > 2)
          return (
            <span key={i} className="text-teal-display">
              {p.slice(1, -1)}
            </span>
          );
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}
