import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { NavBar } from './components/NavBar';
import { ScrollToTop, InternalLinks, RouteTransition, ScrollChrome, PointerLight, PageViews } from './components/AppShell';
import BottomTabs from './components/BottomTabs';
import { useTheme } from './lib/useTheme';
import { usePageMeta } from './lib/usePageMeta';
// The landing page ships with the first load; every other page is fetched when
// it is first visited, so the home page no longer downloads the admin tools,
// the studio, the checkout and the rest.
import { LandingPage } from './pages/LandingPage';
// The shop pages are where the link in bio sends people, so they stay in the
// first download too: a lazy chunk would add a round trip before their data
// can even start loading.
import FashionFindsPage from './pages/FashionFindsPage';

const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const AdminHomePage = lazy(() => import('./pages/AdminHomePage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminContentPage = lazy(() => import('./pages/AdminContentPage'));
const AdminBusinessPage = lazy(() => import('./pages/AdminBusinessPage'));
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
  // The home page has its own bar and the admin console is its own space.
  if (pathname === '/' || pathname.startsWith('/admin')) return null;
  return <NavBar />;
}

export default function App() {
  useTheme();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <PageMeta />
        <ScrollToTop />
        <ScrollChrome />
        <InternalLinks />
        <PointerLight />
        <PageViews />
        <ConditionalNavBar />

        <RouteTransition>
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
        <Routes>
  <Route path="/" element={<LandingPage />} />

{/* /fashion was folded into the home page on 10 Nov 2026 (brands band lives there). The page stays in the repo. */}
<Route path="/fashion" element={<Navigate to="/" replace />} />

<Route
  path="/fashion/finds"
  element={<FashionFindsPage />}
/>

{/* Presets were shut down on 9 Nov 2026. Old links and shared URLs land on /fashion. The pages stay in the repo. */}
<Route path="/fashion/presets" element={<Navigate to="/" replace />} />
<Route path="/fashion/presets/:slug" element={<Navigate to="/" replace />} />

<Route path="/gallery" element={<GalleryPage />} />

{/* Craft was packed away on 6 Nov 2026 (see 02_UNIVERSES/DIGITAL CRAFT/_PACKED_...). Old links land on the home page. */}
<Route path="/digital-craft" element={<Navigate to="/" replace />} />

<Route path="/about" element={<AboutPage />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/refund-policy" element={<RefundPolicyPage />} />
<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
<Route path="/terms" element={<TermsPage />} />

<Route path="/checkout" element={<CheckoutPage />} />
<Route path="/checkout/success" element={<CheckoutSuccessPage />} />

<Route path="/admin" element={<AdminHomePage />} />
<Route path="/admin/products" element={<AdminProductsPage />} />
<Route path="/admin/content" element={<AdminContentPage />} />
<Route path="/admin/business" element={<AdminBusinessPage />} />
<Route path="/admin/studio" element={<LayerStudioPage />} />

{SHOW_UI_KIT && <Route path="/ui-kit" element={<UiKitPage />} />}

<Route path="*" element={<NotFoundPage />} />
</Routes>
        </Suspense>
        </RouteTransition>
        <BottomTabs />
      </div>
    </BrowserRouter>
  );
}