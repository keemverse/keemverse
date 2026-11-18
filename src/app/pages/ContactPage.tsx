import { Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InfoPage } from '../components/InfoPage';
import { socials } from '../lib/socials';
import { useContent } from '../lib/siteContent';

// Contact, kept simple: say hello on WhatsApp or by email. Package bookings start
// on the For brands page, where the message arrives already filled in.
const WHATSAPP_NUMBER = '2349167174194';
const EMAIL = 'akeemtajudeen322@gmail.com';

export default function ContactPage() {
  const t = useContent();
  const liveSocials = socials.filter((s) => s.href !== '#');

  return (
    <InfoPage eyebrow="Get in touch" title="Say hello">
      <p className="text-center">{t('contact.intro')}</p>

      <div className="mt-10 flex flex-col gap-3">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Keem, ')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="press flex min-h-16 items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366]">
            <MessageCircle className="h-5 w-5 text-white" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-foreground">WhatsApp</span>
            <span className="block text-sm text-muted-foreground">+234 916 717 4194, the fastest way</span>
          </span>
          <span className="text-sm font-semibold text-foreground">Chat →</span>
        </a>

        <a
          href={`mailto:${EMAIL}`}
          className="press flex min-h-16 items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground">
            <Mail className="h-5 w-5 text-background" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Email</span>
            <span className="block truncate text-sm text-muted-foreground">{EMAIL}</span>
          </span>
          <span className="text-sm font-semibold text-foreground">Write →</span>
        </a>
      </div>

      <p className="mt-8 text-center text-sm">
        Want to book a package?{' '}
        <Link to="/brands" className="text-foreground underline underline-offset-4">
          Start on the For brands page
        </Link>
        .
      </p>

      <div className="mt-8 flex justify-center gap-3">
        {liveSocials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          >
            <s.icon className="h-5 w-5" />
          </a>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">Remote-first, working with brands and people worldwide.</p>
    </InfoPage>
  );
}
