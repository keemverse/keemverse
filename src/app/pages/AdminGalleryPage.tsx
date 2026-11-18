import PictureManager, { SETS } from '../components/admin/PictureManager';

// /admin/gallery: the photos on the Gallery page only.
export default function AdminGalleryPage() {
  return <PictureManager config={SETS.gallery} />;
}
