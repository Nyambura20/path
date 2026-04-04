import React from 'react';

function Modal({ isOpen, title, onClose, children, footer }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay animate-fade-in" onClick={onClose} />
      <div className="modal-content animate-slide-up">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-[var(--bp-text-subtle)] dark:hover:bg-[var(--bp-surface)] dark:hover:text-[var(--bp-text-muted)]"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </>
  );
}

export default Modal;
