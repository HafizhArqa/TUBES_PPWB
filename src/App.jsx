import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import AdminLayout from './layouts/AdminLayout';

// Hafizh Arqamilandri Wakhyudi: Fitur Login, Register, Forgot Password
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyRegisterOtpPage from './pages/auth/VerifyRegisterOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyResetOtpPage from './pages/auth/VerifyResetOtpPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Marta Safitri: Fitur Dashboard
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Steven Taufik Fajar: Kelola Unit
import UnitsPage from './pages/admin/UnitsPage';
import StatusUnitPage from './pages/admin/StatusUnitPage';

// Zakaria: Fitur Manajemen Master Data
import PelangganPage from './pages/admin/PelangganPage';
import MasterTarifPage from './pages/admin/MasterTarifPage';

import NotFoundPage from './pages/NotFoundPage';

function GuestOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/admin/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Hafizh Arqamilandri Wakhyudi: Fitur Login, Register, Forgot Password */}
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

          {/* Admin Portal: Marta, Steven, Zakaria */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            {/* Marta Safitri: Fitur Dashboard */}
            <Route path="dashboard" element={<AdminDashboardPage />} />
            {/* Steven Taufik Fajar: Kelola Unit */}
            <Route path="units" element={<UnitsPage />} />
            <Route path="status-unit" element={<StatusUnitPage />} />
            {/* Zakaria: Fitur Manajemen Master Data */}
            <Route path="pelanggan" element={<PelangganPage />} />
            <Route path="master-tarif" element={<MasterTarifPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
