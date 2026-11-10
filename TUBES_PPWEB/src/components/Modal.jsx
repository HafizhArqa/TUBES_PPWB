import React, { useEffect, useId } from 'react';
import Icon from './Icon';

/**
 * @file Modal.jsx
 * @description Accessible dialog modal bertema Putih, Grey, dan Hover Biru.
 */
export default function Modal({
  open,
  isOpen,
  onClose,
  title,
  titleIcon,
  subtitle,
  maxWidth = 'max-w-xl',
  children,
  footer,
}) {
  const isVisible = open !== undefined ? open : isOpen;
  const headingId = useId();

  useEffect(() => {
    if (!isVisible) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={`w-full ${maxWidth} bg-white dark:bg-[#1E293B] text-[#1E293B] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] shadow-2xl rounded-[22px] overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 border-b border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]">
          <div className="min-w-0">
            <h2 id={headingId} className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
              {titleIcon && <span className="shrink-0 flex items-center">{titleIcon}</span>}
              <span className="truncate">{title}</span>
            </h2>
            {subtitle && <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-2 rounded-xl bg-[#F1F5F9] dark:bg-gray-800 text-[#64748B] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="px-5 sm:px-7 py-5 sm:py-6 max-h-[75vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-5 sm:px-7 py-4 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-gray-800/40 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
