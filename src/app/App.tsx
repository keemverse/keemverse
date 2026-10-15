import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { NavBar } from './components/NavBar';
import { ScrollToTop, InternalLinks, RouteTransition } from './components/AppShell';
import { useTheme } from './lib/useTheme';
import { usePageMeta } from './lib/usePageMeta';
// The landing page ships with the first load; every other page is fetched when
// it is first visited, so the home page no longer downloads the admin tools,
// the studio, the checkout and the rest.
import { LandingPage } from './pages/LandingPage';
// The shop pages are where the link in bio sends people, so they stay in the
// first download too: a lazy chunk would add a round trip before their data
// can even start loading.
import { FashionPage } from './pages/FashionPage';
import FashionFindsPage from './pages/FashionFindsPage';
import LightroomPresetsPage from './pages/LightroomPresetsPage';

const DigitalCraftPage = lazy(() => import('./pages/DigitalCraftPage').then((m) => ({ default: m.DigitalCraftPage })));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const AdminHomePage = lazy(() => import('./pages/AdminHomePage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const LayerStudioPage = lazy(() => import('./pages/LayerStudioPage'));
const UiKitPage = lazy(() => import('./pages/UiKitPage'));
// MediaKitPage: built and working, held in draft — not routed yet.
// Re-add the import above and the route below (/fashion/media-kit)
// when ready to make it live.

// The component gallery is for reviewing the redesign: it is available while
// developing and on Vercel preview URLs, never on the live domain.
const SHOW_UI_KIT =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app'));

function PageMeta() {
  usePageMeta();
  return null;
}

function ConditionalNavBar() {
  const { pathname } = useLocation();
  if (pathname === '/') return null;
  return <NavBar />;
}

export default function App() {
  useTheme();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <PageMeta />
        <ScrollToTop />
        <InternalLinks />
        <ConditionalNavBar />

        <RouteTransition>
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
        <Routes>
  <Route path="/" element={<LandingPage />} />

<Route path="/fashion" element={<FashionPage />} />

<Route
  path="/fashion/finds"
  element={<FashionFindsPage />}
/>

<Route
  path="/fashion/presets"
  element={<LightroomPresetsPage />}
/>

<Route
  path="/digital-craft"
  element={<DigitalCraftPage />}
/>

<Route path="/about" element={<AboutPage />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/refund-policy" element={<RefundPolicyPage />} />
<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
<Route path="/terms" element={<TermsPage />} />

<Route path="/checkout" element={<CheckoutPage />} />
<Route path="/checkout/success" element={<CheckoutSuccessPage />} />

<Route path="/admin" element={<AdminHomePage />} />
<Route path="/admin/products" element={<AdminProductsPage />} />
<Route path="/admin/studio" element={<LayerStudioPage />} />

{SHOW_UI_KIT && <Route path="/ui-kit" element={<UiKitPage />} />}
</Routes>
        </Suspense>
        </RouteTransition>
      </div>
    </BrowserRouter>
  );
}