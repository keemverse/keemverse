import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { NavBar } from './components/NavBar';
import { FashionPage } from './pages/FashionPage';
import { DigitalCraftPage } from './pages/DigitalCraftPage';
import FashionFindsPage from "./pages/FashionFindsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div
        className="min-h-screen"
        style={{ backgroundColor: '#F5F2EA' }}
      >
        <NavBar />

        <Routes>
  <Route path="/" element={<Navigate to="/fashion" replace />} />

  <Route path="/fashion" element={<FashionPage />} />

  <Route
    path="/fashion/finds"
    element={<FashionFindsPage />}
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