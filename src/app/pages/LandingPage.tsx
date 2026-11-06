import { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocialFooter } from '../components/SocialFooter';
import { BurgerMenu } from '../components/ui/BurgerMenu';
import { GeometricBackdrop } from '../components/GeometricBackdrop';
import { BioChooser } from '../components/BioChooser';
import HomeHero from '../components/home/HomeHero';
import IdentityMarquee from '../components/home/IdentityMarquee';
import Manifesto from '../components/home/Manifesto';
import TheLoop from '../components/home/TheLoop';
import HomeLooks from '../components/home/HomeLooks';
import HomeClosing from '../components/home/HomeClosing';
import HomeBrands from '../components/home/HomeBrands';
import ScrollProgress from '../components/home/ScrollProgress';
import FilmStrip from '../components/gallery/FilmStrip';
import { FRAMES } from '../data/gallery';
import keemverseWordmark from '../../imports/keemverse-wordmark.svg';
// Below the fold: its code and data load after the hero has painted.
const HomeRails = lazy(() => import('../components/HomeRails'));

// Home-only top bar: wordmark left, animated burger right.
function LandingNav() {
  const navigate = useNavigate();
  const items = [
    { label: 'Gallery', action: () => navigate('/gallery') },
    { label: 'Fashion Finds', action: () => navigate('/fashion/finds') },
    { label: 'Lightroom Presets', action: () => navigate('/fashion/presets') },
    { label: 'Fashion', action: () => navigate('/fashion') },
    { label: 'About', action: () => navigate('/about') },
    { label: 'Contact', action: () => navigate('/contact') },
  ];

  return (
    <div className="flex items-center justify-between relative">
      <img src={keemverseWordmark} alt="Keemverse" className="h-[11px] md:h-[18px] w-auto object-contain" />
      <BurgerMenu items={items} />
    </div>
  );
}

// Home = Keem. One screen of who this is, a sliding strip of frames, three ways
// in, a live before/after of the presets, a taste of the shop, and a closing
// invitation to follow along.
export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <ScrollProgress />
      <GeometricBackdrop />
      <div aria-hidden="true" className="aurora z-0" />
      <span aria-hidden="true" className="grain z-0" />

      <main className="relative z-10 px-5 pt-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <LandingNav />
          <HomeHero />
          <IdentityMarquee />
          <Manifesto />
        </div>
      </main>

      <div className="relative z-10 mt-24 md:mt-36">
        <FilmStrip frames={FRAMES} />
      </div>

      <div className="relative z-10 px-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          <TheLoop />
          <HomeLooks />
          <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
            <HomeRails />
          </Suspense>
          <HomeBrands />
          <HomeClosing />
        </div>
      </div>

      <div className="relative z-10">
        <SocialFooter />
      </div>

      <BioChooser />
    </div>
  );
}
