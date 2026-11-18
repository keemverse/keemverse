import PictureManager, { SETS } from '../components/admin/PictureManager';

// /admin/home-pictures: the story pictures on the main page and the For brands page.
export default function AdminHomePicturesPage() {
  return <PictureManager config={SETS.home} />;
}
