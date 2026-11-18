import PictureManager, { SETS } from '../components/admin/PictureManager';

// /admin/rate-cards: the picture on each package card on the For brands page.
export default function AdminRateCardsPage() {
  return <PictureManager config={SETS.packs} />;
}
