import { useState } from 'react';
import { Check, Copy, ArrowUpRight, Gift } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from './ui/drawer';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useIsMobile } from './ui/use-mobile';
import { useContent } from '../lib/siteContent';
import { useRegion } from '../lib/geo';

// "New to Temu?" button that sits beside "View all Temu finds". It stays out of
// the way of the finds: nothing shows until it is tapped, then the details open
// in a bottom sheet (phones) or a small dialog (desktop). Links, code and every
// line of wording are editable in Admin > Site content. Nigeria only, because the
// new-app-user offer it points at is the Nigerian one.
//
// Rules this copy follows (from Temu's affiliate FAQ): the offer is for NEW app
// users, the code must be searched within 1 hour of first installing the app, an
// order must follow within 30 days, and the words are "coupon bundle, terms
// apply", never "free money". The disclosure line is required.

const safeUrl = (u: string) => (/^https:\/\//i.test(u.trim()) ? u.trim() : '');

function Details({ onClose }: { onClose: () => void }) {
  const t = useContent();
  const [copied, setCopied] = useState(false);
  const link = safeUrl(t('temu.referral_link'));
  const code = t('temu.referral_code').trim();
  const steps = [t('temu.step_1'), t('temu.step_2'), t('temu.step_3')].filter(Boolean);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* some in-app browsers refuse; the code is still on screen */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-6 pb-7 pt-4 md:p-8">
      <p className="eyebrow text-amber-ink">{t('temu.referral_eyebrow')}</p>
      <h2 className="mt-2 text-display-md">{t('temu.referral_title')}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('temu.referral_body')}</p>

      {steps.length > 0 && (
        <ol className="mt-5 space-y-3">
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

      <div className="mt-6 flex flex-col gap-3">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={onClose}
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
    </div>
  );
}

export default function TemuReferralButton() {
  const t = useContent();
  const region = useRegion();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (region !== 'NG' || !safeUrl(t('temu.referral_link'))) return null;

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="press group/button glass inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-foreground md:gap-2 md:px-7 md:py-3 md:text-xs md:tracking-[0.15em]"
    >
      <Gift className="h-3.5 w-3.5 text-amber-ink" />
      {t('temu.referral_trigger')}
    </button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="rounded-t-3xl pb-[env(safe-area-inset-bottom)]">
            <DrawerTitle className="sr-only">{t('temu.referral_title')}</DrawerTitle>
            <DrawerDescription className="sr-only">{t('temu.referral_body')}</DrawerDescription>
            <Details onClose={() => setOpen(false)} />
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">{t('temu.referral_title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('temu.referral_body')}</DialogDescription>
          <Details onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
