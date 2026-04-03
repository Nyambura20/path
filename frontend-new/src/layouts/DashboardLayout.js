import React from 'react';

function DashboardLayout({ title, subtitle, actions, children }) {
  return (
    <div className="page-shell animate-fade-in">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {(title || subtitle || actions) && (
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              {title && <h1 className="text-3xl font-bold text-[var(--bp-text)]">{title}</h1>}
              {subtitle && <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
