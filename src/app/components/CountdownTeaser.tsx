import { useEffect, useState } from 'react';
import { CRAFT } from '../lib/theme';

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * "Opening soon" block for Digital Craft. With no date it is just a calm
 * message; with a date it adds a live countdown. The parent decides what to
 * show once the date has passed.
 */
export function CountdownTeaser({ launchAt }: { launchAt: string | null }) {
  const target = launchAt ? Date.parse(launchAt) : NaN;
  const hasDate = Number.isFinite(target);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hasDate) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasDate]);

  const left = hasDate ? split(target - now) : null;
  const opensOn = hasDate
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(target))
    : null;

  return (
    <div className="max-w-xl mx-auto text-center py-6 md:py-10">
      <p
        className="text-xs font-bold tracking-[0.25em] uppercase mb-5"
        style={{ color: CRAFT }}
      >
        New designs
      </p>
      <h3
        className="text-foreground leading-snug mb-4"
        style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
      >
        Opening soon.
      </h3>
      <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-md mx-auto">
        Original art and apparel, designed by me and made to order. I'm getting
        everything ready so it feels right the moment it opens.
      </p>

      {left && (
        <div className="mt-10">
          <div
            role="timer"
            aria-label={`Opens in ${left.days} days, ${left.hours} hours and ${left.minutes} minutes`}
            className="flex items-start justify-center gap-3 md:gap-4"
          >
            {(
              [
                ['Days', left.days],
                ['Hours', left.hours],
                ['Min', left.minutes],
                ['Sec', left.seconds],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col items-center w-16 md:w-20 rounded-2xl border border-border bg-card py-4"
              >
                <span
                  className="text-2xl md:text-3xl font-bold text-foreground"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                  aria-hidden="true"
                >
                  {label === 'Days' ? value : pad(value)}
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs mt-5">
            Opens <time dateTime={new Date(target).toISOString()}>{opensOn}</time>
          </p>
        </div>
      )}
    </div>
  );
}
