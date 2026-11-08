import React, { useEffect, useId } from 'react';
import Icon from './Icon';

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = 'max-w-xl',
  children,
  footer,
}) {
  const headingId = useId();

  useEffect(() => {
    if (!open) return undefined;
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop-layer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={`modal-dialog-box ${maxWidth} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div>
            <h2 id={headingId} className="text-base font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela dialog"
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

