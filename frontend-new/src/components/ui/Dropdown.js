import React, { useEffect, useRef, useState } from 'react';

function Dropdown({ trigger, items = [] }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 transition hover:border-primary-300 hover:text-primary-700 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:text-[var(--bp-text-muted)] dark:hover:border-primary-400/50 dark:hover:text-primary-400"
      >
        {trigger}
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg animate-slide-up dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:shadow-black/40">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-neutral-700 transition hover:bg-primary-50 hover:text-primary-700 dark:text-[var(--bp-text-muted)] dark:hover:bg-primary-950/30 dark:hover:text-primary-400"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
