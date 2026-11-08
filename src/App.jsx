/**
 * @file App.jsx
 * @description Root Router Aplikasi TERA berbasis React Router v6.
 * Menghubungkan seluruh modul tim (Dashboard, Kelola Unit, Master Data Pelanggan, Login & Register).
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Hafizh Arqamilandri Wakhyudi: Fitur Login, Register, Forgot Password
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Marta Safitri: Fitur Dashboard
import AdminDashboardPage from './pages/AdminDashboardPage';

// Steven Taufik Fajar: Kelola Unit
import UnitsPage from './pages/UnitsPage';

// Zakaria: Fitur Manajemen Master Data
import PelangganPage from './pages/PelangganPage';

import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function GuestRoute({ children }) {
  const user = sessionStorage.getItem('user');
  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

function RootRedirect() {
  const user = sessionStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/admin/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Fitur Login, Register, Forgot Password (Hafizh Arqamilandri Wakhyudi) */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />

        {/* Fitur Dashboard (Marta Safitri) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fitur Kelola Unit (Steven Taufik Fajar) */}
        <Route
          path="/admin/units"
          element={
            <ProtectedRoute>
              <UnitsPage />
            </ProtectedRoute>
          }
        />

        {/* Fitur Manajemen Master Data (Zakaria) */}
        <Route
          path="/admin/pelanggan"
          element={
            <ProtectedRoute>
              <PelangganPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
