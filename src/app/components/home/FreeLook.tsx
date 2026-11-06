import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useInView } from 'motion/react';
import { Check } from 'lucide-react';
import { useContent } from '../../lib/siteContent';
import { useRegion } from '../../lib/geo';
import { track, getCampaign } from '../../lib/track';
import { Focus } from '../ui/Cine';

// "Try one look free": a visitor gives an email and gets the Essential tier of
// one look by email (a one-time link). It is how someone who is not ready to
// buy still becomes a person Keem can reach again. It only shows once a look
// is named in Admin > Content (home.freelook_look); empty means hidden, so it
// can never appear before the free file and the Apps Script are set up
// (docs/apps-script-leads-events.gs).
//
// Marketing email is a SEPARATE tickbox, never pre-ticked: getting the free
// look does not require agreeing to anything else.

export default function FreeLook() {
  const t = useContent();
  const region = useRegion();
  const look = t('home.freelook_look').trim();
  const ref = useRef<HTMLDivElement | null>(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (look && seen) track('freelook_view', { item: look });
  }, [look, seen]);

  if (!look) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('sending');
    try {
      const { source, campaign } = getCampaign();
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, optIn, website, source, campaign, region: region === 'NG' ? 'NG' : 'ROW' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not send it right now. Please try again.');
        setStatus('idle');
        return;
      }
      track('freelook_submit', { item: look, detail: optIn ? 'optin' : 'no-optin' });
      setStatus('done');
    } catch {
      setError('Could not send it right now. Please try again.');
      setStatus('idle');
    }
  };

  const title = t('home.freelook_title').replace('{look}', look);

  return (
    <section className="mx-auto mt-20 max-w-2xl md:mt-28" aria-label="Free look" ref={ref}>
      <Focus blur={false} y={18}>
        <div className="glass rounded-3xl px-6 py-10 text-center md:px-12 md:py-12">
          <p className="eyebrow text-amber-ink">{t('home.freelook_eyebrow')}</p>
          <h3 className="mt-3 text-display-md">{title}</h3>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t('home.freelook_body')}</p>

          {status === 'done' ? (
            <p role="status" className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">
              <Check className="h-4 w-4" /> {t('home.freelook_done')}
            </p>
          ) : (
            <form onSubmit={submit} className="mx-auto mt-7 max-w-md text-left" noValidate>
              <label htmlFor="freelook-email" className="sr-only">
                Your email
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="freelook-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 min-w-0 flex-1 rounded-full border border-border bg-input-background px-5 text-base text-foreground outline-offset-2 placeholder:text-muted-foreground focus-visible:outline-2"
                />
                <button
                  type="submit"
                  disabled={status === 'sending' || !/\S+@\S+\.\S+/.test(email)}
                  className="press h-12 shrink-0 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {status === 'sending' ? 'Sending…' : t('home.freelook_button')}
                </button>
              </div>
              {/* Honeypot: hidden from people, filled by bots. */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-muted-foreground">
                <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--fashion-display)]" />
                {t('home.freelook_optin')}
              </label>
              {error && (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              <p className="mt-4 text-[12px] text-muted-foreground">{t('home.freelook_note')}</p>
            </form>
          )}
        </div>
      </Focus>
    </section>
  );
}
