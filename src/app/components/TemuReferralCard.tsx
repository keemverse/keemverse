import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Copy, ArrowUpRight } from 'lucide-react';
import { useContent } from '../lib/siteContent';
import { useRegion } from '../lib/geo';

// "New to Temu?" card on Fashion Finds. It sends people who have never used the
// Temu app through the referral link, with the code as the fallback for people
// who will not tap links. Everything on it (links, code, wording) is editable in
// Admin > Site content. Shown to visitors in Nigeria only, because the new-app-user
// offer it points at is the Nigerian one.
//
// Rules this copy follows (from Temu's affiliate FAQ): the offer is for NEW app
// users, the code must be searched within 1 hour of first installing the app, an
// order must follow within 30 days, and the words are "coupon bundle, terms
// apply", never "free money". The disclosure line is required.

const safeUrl = (u: string) => (/^https:\/\//i.test(u.trim()) ? u.trim() : '');

export default function TemuReferralCard() {
  const t = useContent();
  const region = useRegion();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const link = safeUrl(t('temu.referral_link'));
  const code = t('temu.referral_code').trim();

  if (region !== 'NG' || !link) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* some in-app browsers refuse; the code is still shown on the card */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const steps = [t('temu.step_1'), t('temu.step_2'), t('temu.step_3')].filter(Boolean);

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="temu-referral-title"
      className="glass sheen mx-auto mt-12 max-w-3xl rounded-3xl p-6 md:p-8"
    >
      <p className="eyebrow text-amber-ink">{t('temu.referral_eyebrow')}</p>
      <h2 id="temu-referral-title" className="mt-2 text-display-md">
        {t('temu.referral_title')}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">{t('temu.referral_body')}</p>

      {steps.length > 0 && (
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-snug">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[12px] font-semibold text-background">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="press inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          {t('temu.referral_button')}
          <ArrowUpRight className="h-4 w-4" />
        </a>

        {code && (
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy code ${code}`}
            className="press glass inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
          >
            <span className="text-muted-foreground">{t('temu.code_label')}</span>
            <span className="font-semibold tracking-wider">{code}</span>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          </button>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{t('temu.disclosure')}</p>
    </motion.section>
  );
}
