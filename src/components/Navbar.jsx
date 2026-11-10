/**
 * @file Navbar.jsx
 * @description Sidebar TERA Admin:
 * - Logo: TERA Admin (Besar) + Management Portal (Kecil)
 * - Menu: Dashboard, Kelola Unit, Pelanggan, Kontrak, Invoice
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/admin/units', label: 'Kelola Unit' },
    { to: '/admin/pelanggan', label: 'Pelanggan' },
    { to: '/admin/kontrak', label: 'Kontrak' },
    { to: '/admin/invoice', label: 'Invoice' },
  ];

  return (
    <aside className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-[#1E293B] border-r border-[#E2E8F0] dark:border-[#334155] z-30 flex flex-col py-8 px-6 transition-colors duration-200">
      <div>
        {/* Brand Header */}
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
            TERA Admin
          </h1>
          <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase mt-1">
            Management Portal
          </p>
        </div>

        {/* Nav List */}
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  item.label === 'Dashboard'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
