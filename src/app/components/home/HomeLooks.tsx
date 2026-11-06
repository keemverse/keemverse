import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PresetReveal from '../PresetReveal';
import { getCatalogProducts } from '../../lib/products';
import { lookSlug } from '../../lib/presetDeal';
import { useContent } from '../../lib/siteContent';
import { Focus } from '../ui/Cine';

// The preset hook, on the home page: every look that has a before and an after
// photo takes a turn, so a visitor can watch an edit happen without leaving.
// Hidden if the catalogue cannot be loaded or no look has both photos.

export default function HomeLooks() {
  const t = useContent();
  const navigate = useNavigate();
  const [looks, setLooks] = useState<any[]>([]);

  useEffect(() => {
    let live = true;
    getCatalogProducts('preset')
      .then((rows) => {
        if (!live) return;
        setLooks(
          [...rows]
            .filter((p: any) => (p.status === undefined || p.status === 'Live') && p.before_image && p.after_image)
            .sort((a: any, b: any) => (a.display_order ?? 999999) - (b.display_order ?? 999999))
        );
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (looks.length === 0) return null;

  return (
    <section className="mt-24 md:mt-36" aria-label="Lightroom looks">
      <Focus className="mx-auto mb-10 max-w-xl text-center" blur={false} y={14}>
        <p className="eyebrow text-amber-ink">{t('home.looks_eyebrow')}</p>
        <h2 className="mt-3 text-display-lg">{t('home.looks_title')}</h2>
      </Focus>
      <PresetReveal looks={looks} onOpen={(p) => navigate(`/fashion/presets/${lookSlug(p)}`)} />
    </section>
  );
}
