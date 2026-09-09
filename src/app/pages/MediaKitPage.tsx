import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Instagram, Users, TrendingUp, MapPin } from 'lucide-react';
import { SocialFooter } from '../components/SocialFooter';
import SectionDivider from '../components/SectionDivider';
import { TikTokIcon, PinterestIcon } from '../components/Icons';
import { getMediaKit, getRateCard } from '../lib/products';
import profileImg from '../../imports/keem-profile.jpg';

const PLATFORM_ICON: Record<string, any> = {
  Instagram: Instagram,
  TikTok: TikTokIcon,
  Pinterest: PinterestIcon,
};

const PLATFORM_COLOR: Record<string, string> = {
  Instagram: '#E1306C',
  TikTok: '#010101',
  Pinterest: '#E60023',
};

// Sheet values arrive as raw types (numbers, ISO date strings from
// Sheets auto-converting a typed date) — format them for display
// rather than trusting them to already look right.
const formatFollowers = (value: any) => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? String(value ?? '') : num.toLocaleString();
};

const formatEngagement = (value: any) => {
  if (typeof value === 'number') return `${value}%`;
  const str = String(value ?? '');
  return str && !str.includes('%') ? `${str}%` : str;
};

const formatDate = (value: any) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value ?? '');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatPrice = (price: any, currency: any) => {
  const num = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(num)) return String(price ?? '');
  const symbol = String(currency ?? '').toUpperCase() === 'USD' ? '$' : '₦';
  return `${symbol}${num.toLocaleString()}`;
};

function StatCard({ row, index }: { row: any; index: number }) {
  const Icon = PLATFORM_ICON[row.Platform] || Instagram;
  const color = PLATFORM_COLOR[row.Platform] || '#1D1C19';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-3xl border border-stone-200/60 bg-white p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-stone-900 text-sm">{row.Platform}</p>
          <p className="text-stone-500 text-xs">{row.Handle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-stone-400 font-semibold mb-1">
            <Users className="w-3 h-3" /> Followers
          </p>
          <p className="font-serif text-2xl text-stone-900">{formatFollowers(row.Followers)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-stone-400 font-semibold mb-1">
            <TrendingUp className="w-3 h-3" /> Engagement
          </p>
          <p className="font-serif text-2xl text-stone-900">{formatEngagement(row['Engagement Rate'])}</p>
        </div>
      </div>

      {(row['Top Audience Age'] || row['Top Audience Gender'] || row['Top Audience Location']) && (
        <div className="mt-5 pt-5 border-t border-stone-100">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-stone-400 font-semibold mb-1.5">
            <MapPin className="w-3 h-3" /> Audience
          </p>
          <p className="text-sm text-stone-600">
            {[row['Top Audience Age'], row['Top Audience Gender'], row['Top Audience Location']]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function MediaKitPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<any[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    getMediaKit()
      // The "Media Kit" sheet tab may not exist yet, or the bridge may
      // return an error object instead of a row array in that case —
      // guard against anything that isn't a real array rather than
      // crashing the page.
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));

    getRateCard()
      .then((data) => setRates(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setRatesLoading(false));
  }, []);

  const lastUpdated = rows.find((r) => r['Last Updated'])?.['Last Updated'];

  return (
    <div className="min-h-screen text-stone-900" style={{ backgroundColor: '#F5F2EA' }}>
      <main className="max-w-4xl mx-auto px-5 md:px-8 pt-10 pb-24">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <img
            src={profileImg}
            alt="Soft Keem"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-5 border-2 border-white shadow-sm"
          />
          <p className="uppercase tracking-[0.35em] text-xs text-stone-500 mb-4">Media Kit</p>
          <h1 className="font-serif text-3xl md:text-5xl text-stone-900 leading-tight mb-4">
            Soft Keem
          </h1>
          <p className="text-stone-600 max-w-md mx-auto leading-relaxed">
            Fashion storyteller and creator — helping people express identity,
            emotion, and atmosphere through style, and helping brands reach an
            engaged, style-forward audience.
          </p>
          {lastUpdated && (
            <p className="text-xs text-stone-400 mt-5">Stats last updated {formatDate(lastUpdated)}</p>
          )}
        </motion.section>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-stone-200/60 bg-white h-56 animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500">Stats are being put together — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rows.map((row, i) => (
              <StatCard key={row.Platform} row={row} index={i} />
            ))}
          </div>
        )}

        {!ratesLoading && rates.length > 0 && (
          <section className="mt-20">
            <SectionDivider label="Rate Card" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {rates.map((rate, i) => (
                <motion.div
                  key={rate.Service}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex flex-col rounded-2xl border border-stone-200/60 bg-white p-4 md:p-6 text-center"
                >
                  <p className="font-semibold text-stone-900 text-sm md:text-base">{rate.Service}</p>
                  {rate.Description && (
                    <p className="text-stone-500 text-xs mt-1">{rate.Description}</p>
                  )}
                  <p className="font-serif text-xl md:text-2xl text-stone-900 mt-auto pt-3">
                    {formatPrice(rate.Price, rate.Currency)}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs text-stone-400 mt-6">
              Custom packages available — let's talk about what fits your campaign.
            </p>
          </section>
        )}

        <div className="text-center mt-16">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-8 py-3.5 text-sm font-semibold tracking-[0.12em] text-white hover:bg-black hover:-translate-y-0.5 transition-all"
          >
            LET'S WORK TOGETHER →
          </a>
        </div>
      </main>

      <SocialFooter />
    </div>
  );
}
