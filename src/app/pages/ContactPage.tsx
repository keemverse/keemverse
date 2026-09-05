import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { InfoPage } from '../components/InfoPage';
import { socials } from '../lib/socials';

// Email and WhatsApp are already covered by the brief form above (and
// the footer) — only list what isn't offered anywhere else on this page.
const details = [
  { icon: Phone, label: 'Phone', value: '+234 916 717 4194', href: 'tel:+2349167174194' },
  { icon: MapPin, label: 'Business Address', value: 'Osogbo, Osun State, Nigeria', href: undefined },
];

const projectTypes = [
  'Fashion collaboration / brand campaign',
  'Digital Craft / design work',
  'Lightroom presets or products',
  'Something else',
];

function BriefForm() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [message, setMessage] = useState('');

  const canSend = name.trim().length > 0 && message.trim().length > 0;

  const composeBrief = () =>
    `Hi Keem, I'm ${name}.\n\nProject type: ${projectType}\n\n${message}\n\n— Reach me at: ${contact || 'not provided'}`;

  const whatsappHref = canSend
    ? `https://wa.me/2349167174194?text=${encodeURIComponent(composeBrief())}`
    : undefined;

  const emailHref = canSend
    ? `mailto:akeemtajudeen322@gmail.com?subject=${encodeURIComponent(
        `Brief from ${name} — ${projectType}`
      )}&body=${encodeURIComponent(composeBrief())}`
    : undefined;

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-6 md:p-8">
      <p className="text-xs font-bold tracking-[0.15em] uppercase text-stone-400 mb-5">
        Send a brief
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-stone-500 mb-1.5 block">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-400 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-stone-500 mb-1.5 block">
            Email or WhatsApp number (so I can reply)
          </label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="How should I reach you back?"
            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-400 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-stone-500 mb-1.5 block">What's this about?</label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-400 transition-colors bg-white"
          >
            {projectTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-stone-500 mb-1.5 block">Your brief</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me what you have in mind — timeline, budget, references, anything useful."
            rows={5}
            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-400 transition-colors resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <a
            href={whatsappHref}
            target={whatsappHref ? '_blank' : undefined}
            rel={whatsappHref ? 'noopener noreferrer' : undefined}
            aria-disabled={!canSend}
            onClick={(e) => { if (!canSend) e.preventDefault(); }}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-all ${
              canSend ? 'bg-[#25D366] hover:-translate-y-0.5' : 'bg-stone-300 cursor-not-allowed'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Send via WhatsApp
          </a>

          <a
            href={emailHref}
            aria-disabled={!canSend}
            onClick={(e) => { if (!canSend) e.preventDefault(); }}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all ${
              canSend
                ? 'bg-[#ECE5D9] text-stone-900 hover:-translate-y-0.5'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Mail className="w-4 h-4" />
            Send via Email
          </a>
        </div>

        <p className="text-xs text-stone-400 text-center mt-1">
          Fill in your name and brief, then send it however works for you —
          both open with everything already written in.
        </p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <InfoPage eyebrow="Get in touch" title="Contact us">
      <p className="text-center">
        Have a question, a collaboration idea, or need support with an
        order? Send a brief below, or reach out directly.
      </p>

      <div className="mt-6">
        <BriefForm />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {details.map((d) => (
          <div
            key={d.label}
            className="flex items-start gap-4 rounded-2xl border border-stone-200/60 bg-white p-5"
          >
            <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F2EC' }}>
              <d.icon className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-stone-400 mb-1">
                {d.label}
              </p>
              {d.href ? (
                <a
                  href={d.href}
                  target={d.href.startsWith('http') ? '_blank' : undefined}
                  rel={d.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-stone-900 font-medium hover:underline"
                >
                  {d.value}
                </a>
              ) : (
                <>
                  <p className="text-stone-900 font-medium">{d.value}</p>
                  <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">
                    Digital work is handled remotely. For fashion PR
                    packages and brand collaborations, exact location is
                    discussed first — and yes, we travel for paid campaigns
                    and collabs.
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs font-bold tracking-[0.15em] uppercase text-stone-400 mb-4">
          See the work
        </p>
        <div className="flex gap-3 justify-center">
          {socials.filter((s) => s.href !== '#').map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 hover:border-stone-300 transition-all"
            >
              <s.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </InfoPage>
  );
}
