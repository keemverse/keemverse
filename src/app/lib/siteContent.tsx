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
    description: 'The first thing people see: the introduction, the gallery strip, the shop previews and the closing card.',
    fields: [
      { key: 'home.eyebrow', label: 'Small label above the headline', default: 'Keem · fashion storyteller' },
      { key: 'home.headline_1', label: 'Headline, line 1', default: 'Fashion needs', accent: true, help: 'Wrap a word in *stars* for amber.' },
      { key: 'home.headline_2', label: 'Headline, line 2', default: '*stories.*', accent: true, help: 'Wrap a word in *stars* for amber.' },
      { key: 'home.tagline', label: 'Tagline', default: "Good clothes go unsold when nobody tells their story. I'm Keem. I turn a brand's clothes into outfit stories, on my own or as a pair, and tell you honestly what sold.", multiline: true },
      { key: 'home.hero_cta_1', label: 'Main button (goes to the For brands page)', default: 'Work with me' },
      { key: 'home.hero_cta_2', label: 'Second button (goes to the gallery)', default: 'See the work' },
      { key: 'home.proof_label', label: 'Under the buttons, after the follower count', default: 'follow along on TikTok' },
      { key: 'home.manifesto_eyebrow', label: 'Introduction, small label', default: 'Hi' },
      { key: 'home.manifesto', label: 'Introduction paragraph', default: "I'm Keem. I style outfits and film them as little stories, sometimes on my own, sometimes with a partner. I like clothes that feel like something, and I like showing you where to find them.", multiline: true },
      { key: 'home.manifesto_link', label: 'Introduction link', default: 'More about me' },
      { key: 'home.frames_eyebrow', label: 'Gallery strip, small label', default: 'From my shoots' },
      { key: 'home.frames_title', label: 'Gallery strip, title', default: 'Frames' },
      { key: 'home.finds_eyebrow', label: 'Finds section, small label', default: 'Fashion finds' },
      { key: 'home.finds_title', label: 'Finds section, title', default: "What I'm wearing lately" },
      { key: 'home.finds_cta', label: 'Finds section, action button', default: 'fashion finds' },
      { key: 'home.brands_eyebrow', label: 'For brands, small label', default: 'For fashion brands' },
      { key: 'home.brands_title', label: 'For brands, title', default: 'Your clothes, as a story people want to wear.' },
      { key: 'home.brands_lede', label: 'For brands, text under the title', default: "I style your pieces and film them as a short story, on me or as a pair. You get the content, and a plain note afterwards on what it sold.", multiline: true },
      { key: 'home.brands_note', label: 'For brands, small print', default: "I work with fashion brands that have something to sell. Personal lifestyle content for individuals isn't something I take on.", multiline: true },
      { key: 'home.cta_proof', label: 'Closing card, after the follower count', default: 'people follow along on TikTok' },
      { key: 'home.cta_eyebrow', label: 'Closing card, small label', default: 'Follow along' },
      { key: 'home.cta_title', label: 'Closing card, title', default: 'Come along for the journey.' },
      { key: 'home.cta_body', label: 'Closing card, text', default: "New outfits and the pieces I'm wearing, posted as I go. Say hello any time.", multiline: true },
      { key: 'home.cta_primary', label: 'Closing card, main button (TikTok)', default: 'Follow on TikTok' },
      { key: 'home.cta_secondary', label: 'Closing card, second button (Instagram)', default: 'Instagram' },
    ],
  },
  {
    id: 'temu',
    title: 'Temu links and referral',
    description: 'The links and codes used on Fashion Finds. Paste the full https link exactly as Temu gives it.',
    fields: [
      { key: 'temu.catalogue_link', label: 'Catalogue link (curated storefront)', default: 'https://temu.to/k/et0vx9sob5t', help: 'Used by the "View all Temu finds" banner. Use ONE catalogue link everywhere.' },
      { key: 'temu.catalogue_code', label: 'Catalogue code', default: 'ina491031' },
      { key: 'temu.referral_link', label: 'Referral link (new app users)', default: 'https://temu.to/k/egchbejf5qu', help: 'Used by the "New to Temu?" pop-up. Leave empty to hide the button.' },
      { key: 'temu.referral_code', label: 'Referral code', default: 'ala655546', help: 'People search this in the Temu app within 1 hour of first installing it.' },
      { key: 'temu.referral_trigger', label: 'Button beside "View all Temu finds"', default: 'New to Temu?' },
      { key: 'temu.referral_eyebrow', label: 'Pop-up, small label', default: 'New to Temu?' },
      { key: 'temu.referral_title', label: 'Pop-up, title', default: 'Get the new-app-user coupon bundle' },
      { key: 'temu.referral_body', label: 'Pop-up, text', default: 'Install Temu with my link, then search my code in the app straight away. The coupon bundle is for new app users only, terms apply.', multiline: true },
      { key: 'temu.step_1', label: 'Step 1', default: 'Install Temu with the button below' },
      { key: 'temu.step_2', label: 'Step 2', default: 'Search the code in the app within 1 hour of first opening it' },
      { key: 'temu.step_3', label: 'Step 3', default: 'Place your first order within 30 days' },
      { key: 'temu.referral_button', label: 'Pop-up, install button', default: 'Install Temu and get the bundle' },
      { key: 'temu.code_label', label: 'Code button, small label', default: 'Code' },
      { key: 'temu.disclosure', label: 'Disclosure line', default: 'Affiliate link: I earn a commission if you order, at no cost to you.', multiline: true },
    ],
  },
  {
    id: 'finds',
    title: 'Fashion Finds page',
    description: 'The heading above the finds grid.',
    fields: [
      { key: 'finds.eyebrow', label: 'Small label', default: 'My finds' },
      { key: 'finds.title', label: 'Title', default: "What I'm wearing, and where to get it." },
      { key: 'finds.subtitle', label: 'Subtitle', default: "These are pieces I picked and use in my content. Tap one for a quick look, or go straight to the shop.", multiline: true },
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
          "Have a question, an idea, or want to work together? Send me a short note below, or reach me directly. I work with people anywhere in the world, all of it remotely, and I reply within a business day.",
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
