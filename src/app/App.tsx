import React from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router';
import { NavBar } from './components/NavBar';
import { FashionPage } from './pages/FashionPage';
import { DigitalCraftPage } from './pages/DigitalCraftPage';

export default function App() {
  return (
    <MemoryRouter initialEntries={['/fashion']}>
      <div className="min-h-screen" style={{ backgroundColor: '#F5F2EA' }}>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/fashion" replace />} />
          <Route path="/fashion" element={<FashionPage />} />
          <Route path="/digital-craft" element={<DigitalCraftPage />} />
        </Routes>
      </div>
    </MemoryRouter>
  );
}
