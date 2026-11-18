import { Suspense, lazy } from 'react';
import { SocialFooter } from '../components/SocialFooter';
import HomeHero from '../components/home/HomeHero';
import Manifesto from '../components/home/Manifesto';
import HomeWork from '../components/home/HomeWork';
import HomeBrands from '../components/home/HomeBrands';
import HomeClosing from '../components/home/HomeClosing';
// Below the fold: its code and data load after the hero has painted.
const HomeRails = lazy(() => import('../components/HomeRails'));

// Home, in the order a visitor needs it: who I am, the work, how to work with me,
// what I wear, and where to follow. The header comes from App.tsx.
export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <main className="relative z-10 px-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          <HomeHero />
          <Manifesto />
          <HomeWork />
          <HomeBrands />
          <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
            <HomeRails />
          </Suspense>
          <HomeClosing />
        </div>
      </main>

      <SocialFooter />
    </div>
  );
}
