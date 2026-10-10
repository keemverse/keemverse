import { useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CRAFT_DARK } from '../lib/theme';
import { Btn } from './CraftUI';

// Commission a design: a short brief. On submit it is saved privately through
// /api/requests (a private Sheet plus an email alert to the owner, never the
// public repo), then the person is handed to WhatsApp with the same message
// filled in. If saving fails, WhatsApp still works, so nothing is lost.
// Structure follows the Arena v1 "Request as a service" form (completeness
// meter, inline errors, success state). Nothing here promises a turnaround,
// price, or ticket.

const WHATSAPP_NUMBER = '2349167174194';

const PROJECTS = ['Clothing design', 'Illustration or art print', 'Logo', 'Something else'];
const GARMENTS = ['T-shirt', 'Hoodie', 'Long sleeve', 'Tote', 'Not sure yet'];

type Fields = {
  name: string;
  contact: string;
  project: string;
  garment: string;
  deadline: string;
  brief: string;
  refs: string;
};

type SaveState = 'saved' | 'failed';

const EMPTY: Fields = { name: '', contact: '', project: '', garment: 'Not sure yet', deadline: '', brief: '', refs: '' };

const inputBase =
  'w-full rounded-xl border bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground';

function message(f: Fields) {
  return [
    "Hi Keem, I'd like a custom design.",
    '',
    `Name: ${f.name.trim()}`,
    `Contact: ${f.contact.trim()}`,
    `For: ${f.project}`,
    f.project === 'Clothing design' ? `Garment: ${f.garment}` : null,
    f.deadline.trim() ? `Needed by: ${f.deadline.trim()}` : null,
    '',
    `What I want: ${f.brief.trim()}`,
    f.refs.trim() ? `Examples I like: ${f.refs.trim()}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

export function CustomDesignForm() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [save, setSave] = useState<{ state: SaveState; ref?: string } | null>(null);
  // Honeypot: real visitors never see or fill this; bots do.
  const [trap, setTrap] = useState('');

  const set = (k: keyof Fields, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const completeness = useMemo(() => {
    const checks = [f.name.trim().length >= 2, f.contact.trim().length >= 5, !!f.project, f.brief.trim().length >= 20];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [f]);

  const validate = () => {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (f.name.trim().length < 2) e.name = 'Tell me who to reply to.';
    if (f.contact.trim().length < 5) e.contact = 'An email or WhatsApp number so I can reply.';
    if (!f.project) e.project = 'Pick the closest option.';
    if (f.brief.trim().length < 20) e.brief = 'A sentence or two is plenty (20 characters minimum).';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, garment: f.project === 'Clothing design' ? f.garment : '', website: trap }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) setSave({ state: 'saved', ref: data.ref });
      else if (res.status === 400 && data.fields) {
        // the server's checks are the same as ours; show them if they disagree
        setErrors(data.fields);
        setSending(false);
        return;
      } else setSave({ state: 'failed' });
    } catch {
      setSave({ state: 'failed' });
    }
    setSending(false);
    setReady(true);
  };

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message(f))}`;

  const field = (k: keyof Fields, label: string, node: React.ReactNode) => (
    <div>
      <label htmlFor={`cm-${k}`} className="block text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">
        {label}
      </label>
      {node}
      {errors[k] && (
        <p className="mt-1.5 text-xs text-destructive" role="alert">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <div className="relative isolate max-w-2xl mx-auto overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-10 ink-edge shadow-[0_34px_80px_-36px_rgba(20,18,15,0.6),inset_0_1px_0_rgba(255,255,255,0.7)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 blueprint text-[#A18C6B] opacity-[0.16] [mask-image:linear-gradient(to_bottom_right,black,transparent_70%)]" />
      <AnimatePresence mode="wait">
        {ready ? (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <h3 className="text-foreground mb-3" style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem' }}>
              {save?.state === 'saved' ? 'Got it.' : 'Your message is ready.'}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto mb-8">
              {save?.state === 'saved' ? (
                <>
                  I've saved your request{save.ref ? ` (${save.ref})` : ''} and I'll reply to you. For a faster answer, you
                  can also send it on WhatsApp.
                </>
              ) : (
                <>
                  I couldn't save it here just now, so please send it on WhatsApp and I'll see it there. Nothing is sent
                  until you press send.
                </>
              )}
            </p>
            <Btn href={waHref} external size="lg" icon={<span aria-hidden="true">→</span>}>
              Send on WhatsApp
            </Btn>
            {save?.state === 'saved' && (
              <p className="mt-5 text-xs text-muted-foreground">Your note is saved privately so I can reply. It isn't shared.</p>
            )}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setReady(false)}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Edit my message
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <div>
              <h3 className="text-foreground mb-2" style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem' }}>
                Tell me what you need.
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A short note is enough. I'll read it and reply on WhatsApp.
              </p>
              <div className="mt-4 h-1.5 w-full rounded-full bg-border overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completeness}%`, backgroundColor: CRAFT_DARK }} />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground" aria-live="polite">
                Request {completeness}% ready
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {field(
                'name',
                'Your name',
                <input id="cm-name" value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" className={`${inputBase} ${errors.name ? 'border-destructive' : 'border-border'}`} />
              )}
              {field(
                'contact',
                'Email or WhatsApp',
                <input id="cm-contact" value={f.contact} onChange={(e) => set('contact', e.target.value)} autoComplete="email" className={`${inputBase} ${errors.contact ? 'border-destructive' : 'border-border'}`} />
              )}
            </div>

            {field(
              'project',
              'What is it for?',
              <div className="flex flex-wrap gap-2" role="group" aria-label="Project type" id="cm-project">
                {PROJECTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('project', p)}
                    aria-pressed={f.project === p}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                      f.project === p ? 'bg-foreground text-background border-foreground' : 'bg-input-background text-muted-foreground border-border shadow-[0_1px_2px_rgba(70,52,20,0.08)] hover:border-foreground/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {f.project === 'Clothing design' &&
              field(
                'garment',
                'Garment',
                <select id="cm-garment" value={f.garment} onChange={(e) => set('garment', e.target.value)} className={`${inputBase} border-border`}>
                  {GARMENTS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              )}

            {field(
              'brief',
              'What do you want made?',
              <textarea
                id="cm-brief"
                rows={5}
                value={f.brief}
                onChange={(e) => set('brief', e.target.value)}
                placeholder="The idea, the mood, who it's for, any words that must appear."
                className={`${inputBase} resize-y ${errors.brief ? 'border-destructive' : 'border-border'}`}
              />
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              {field(
                'deadline',
                'Needed by (optional)',
                <input id="cm-deadline" value={f.deadline} onChange={(e) => set('deadline', e.target.value)} placeholder="e.g. end of November" className={`${inputBase} border-border`} />
              )}
              {field(
                'refs',
                'Examples (optional)',
                <input id="cm-refs" value={f.refs} onChange={(e) => set('refs', e.target.value)} placeholder="A Pinterest board, image links, etc." className={`${inputBase} border-border`} />
              )}
            </div>

            {/* honeypot: hidden from people and screen readers, bots fill it in */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
              <label htmlFor="cm-website">Leave this empty</label>
              <input id="cm-website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </div>

            <Btn type="submit" variant="dark" size="lg" className="self-start" icon={<span aria-hidden="true">→</span>}>
              {sending ? 'Sending…' : 'Continue'}
            </Btn>
            <p className="-mt-2 text-xs text-muted-foreground">
              Your note is saved privately so I can reply to you.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
