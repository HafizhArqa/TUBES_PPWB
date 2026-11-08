import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  updateProfileInfo,
  updateUserPassword,
  deleteUserAccount,
} from '../services/authService';
import Icon from '../components/Icon';
import Modal from '../components/Modal';

export default function ProfilePage() {
  const { user, syncUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [infoForm, setInfoForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
  });
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const backUrl = user?.role === 'admin' ? '/admin/dashboard' : '/pelanggan/dashboard';

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!infoForm.name.trim() || !infoForm.email.trim()) {
      showToast('Nama lengkap dan alamat email wajib diisi.', 'error');
      return;
    }
    setSavingInfo(true);
    try {
      const updated = await updateProfileInfo(user.id, infoForm);
      syncUser(updated);
      showToast('Informasi profil berhasil diperbarui.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 8) {
      showToast('Kata sandi baru minimal 8 karakter.', 'error');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }
    setSavingPass(true);
    try {
      await updateUserPassword(user.id, {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Kata sandi akun berhasil diperbarui!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount(user.id, deletePassword);
      await logout();
      showToast('Akun Anda telah dihapus secara permanen.', 'info');
      navigate('/login', { replace: true });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Pengaturan Profil Akun</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola identitas pengguna, kredensial keamanan, dan akses sistem TERA
            </p>
          </div>
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-sm"
          >
            <Icon name="arrowLeft" size={16} />
            <span>Kembali ke Dashboard</span>
          </Link>
        </header>

        {/* Identitas Profil */}
        <section className="tera-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Informasi Identitas Pengguna</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
              Role: {user?.role}
            </span>
          </div>

          <form onSubmit={handleSaveInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="prof-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={infoForm.name}
                onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-user" className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <input
                id="prof-user"
                type="text"
                required
                value={infoForm.username}
                onChange={(e) => setInfoForm({ ...infoForm, username: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email
              </label>
              <input
                id="prof-email"
                type="email"
                required
                value={infoForm.email}
                onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={savingInfo}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                {savingInfo ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>
        </section>

        {/* Ubah Kata Sandi */}
        <section className="tera-card p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Perbarui Kata Sandi Keamanan</h2>
          <form onSubmit={handleSavePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cur-pass" className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi Saat Ini
              </label>
              <input
                id="cur-pass"
                type="password"
                required
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="new-pass" className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi Baru
              </label>
              <input
                id="new-pass"
                type="password"
                required
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="conf-pass" className="block text-xs font-semibold text-slate-700 mb-1">
                Konfirmasi Sandi Baru
              </label>
              <input
                id="conf-pass"
                type="password"
                required
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={savingPass}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
              >
                {savingPass ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
              </button>
            </div>
          </form>
        </section>

        {/* Zona Berbahaya */}
        <section className="tera-card p-6 border-red-200 bg-red-50/30 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-red-800">Hapus Akun Pengguna</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Setelah akun dihapus, kredensial akses Anda tidak dapat dipulihkan kembali.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
          >
            Hapus Akun
          </button>
        </section>
      </div>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Konfirmasi Penghapusan Akun"
        subtitle="Masukkan kata sandi Anda saat ini untuk mengonfirmasi penghapusan."
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
            >
              Hapus Permanen
            </button>
          </>
        }
      >
        <label htmlFor="del-pass" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Kata Sandi Konfirmasi
        </label>
        <input
          id="del-pass"
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder="Masukkan kata sandi Anda"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
        />
      </Modal>
    </div>
  );
}

