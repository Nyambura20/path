import React from 'react';

function Card({ title, subtitle, action, className = '', children }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || subtitle || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-lg font-semibold text-[var(--bp-text)]">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export default Card;
