import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import AdminLayout from './layouts/AdminLayout';
import PelangganLayout from './layouts/PelangganLayout';

// Auth & Account Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyRegisterOtpPage from './pages/auth/VerifyRegisterOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyResetOtpPage from './pages/auth/VerifyResetOtpPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';

// Pelanggan Portal Pages
import PelangganDashboardPage from './pages/pelanggan/PelangganDashboardPage';
import KatalogPage from './pages/pelanggan/KatalogPage';
import KeranjangPage from './pages/pelanggan/KeranjangPage';
import PermintaanListPage from './pages/pelanggan/PermintaanListPage';
import PermintaanDetailPage from './pages/pelanggan/PermintaanDetailPage';

// Admin Portal Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UnitsPage from './pages/admin/UnitsPage';
import StatusUnitPage from './pages/admin/StatusUnitPage';
import PelangganPage from './pages/admin/PelangganPage';
import TransaksiIndexPage from './pages/admin/TransaksiIndexPage';
import TransaksiCreatePage from './pages/admin/TransaksiCreatePage';
import ProyekDetailPage from './pages/admin/ProyekDetailPage';
import AngsuranPage from './pages/admin/AngsuranPage';
import LaporanPenyewaanPage from './pages/admin/LaporanPenyewaanPage';
import LaporanPendapatanPage from './pages/admin/LaporanPendapatanPage';

import NotFoundPage from './pages/NotFoundPage';

function GuestOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/pelanggan/dashboard'} replace />;
  }
  return children;
}

function ProtectedRoute({ allowedRole, children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/pelanggan/dashboard'} replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/pelanggan/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            {/* Guest Authentication Routes */}
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <LoginPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnlyRoute>
                  <RegisterPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/register/verify-otp"
              element={
                <GuestOnlyRoute>
                  <VerifyRegisterOtpPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestOnlyRoute>
                  <ForgotPasswordPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <GuestOnlyRoute>
                  <VerifyResetOtpPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <GuestOnlyRoute>
                  <ResetPasswordPage />
                </GuestOnlyRoute>
              }
            />

            {/* Shared Authenticated Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Portal Pelanggan Routes */}
            <Route
              path="/pelanggan"
              element={
                <ProtectedRoute allowedRole="pelanggan">
                  <PelangganLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/pelanggan/dashboard" replace />} />
              <Route path="dashboard" element={<PelangganDashboardPage />} />
              <Route path="katalog" element={<KatalogPage />} />
              <Route path="keranjang" element={<KeranjangPage />} />
              <Route path="permintaan" element={<PermintaanListPage />} />
              <Route path="permintaan/:id" element={<PermintaanDetailPage />} />
            </Route>

            {/* Portal Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="units" element={<UnitsPage />} />
              <Route path="status-unit" element={<StatusUnitPage />} />
              <Route path="pelanggan" element={<PelangganPage />} />
              <Route path="transaksi" element={<TransaksiIndexPage />} />
              <Route path="transaksi/create" element={<TransaksiCreatePage />} />
              <Route path="proyek/:id" element={<ProyekDetailPage />} />
              <Route path="angsuran" element={<AngsuranPage />} />
              <Route path="laporan-penyewaan" element={<LaporanPenyewaanPage />} />
              <Route path="laporan-pendapatan" element={<LaporanPendapatanPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

