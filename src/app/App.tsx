import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { FashionPage } from './pages/FashionPage';
import { DigitalCraftPage } from './pages/DigitalCraftPage';
import FashionFindsPage from "./pages/FashionFindsPage";
import LightroomPresetsPage from "./pages/LightroomPresetsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div
        className="min-h-screen"
        style={{ backgroundColor: '#F5F2EA' }}
      >
        <NavBar />

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
</Routes>
      </div>
    </BrowserRouter>
  );
}