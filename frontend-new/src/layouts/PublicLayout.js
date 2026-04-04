import React from 'react';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-100 animate-fade-in dark:from-primary-950/30 dark:via-[var(--bp-bg)] dark:to-[var(--bp-surface-soft)]">
      {children}
    </div>
  );
}

export default PublicLayout;
