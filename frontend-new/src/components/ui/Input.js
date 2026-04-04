import React from 'react';

function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;
  const isSearchInput =
    props.type === 'search' ||
    /search/i.test(label || '') ||
    /search/i.test(props.placeholder || '') ||
    /search/i.test(props.name || '');

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-neutral-700 dark:text-[var(--bp-text-muted)]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`input-field ${isSearchInput ? 'pr-10' : ''} ${error ? 'input-invalid' : ''} ${className}`.trim()}
          {...props}
        />
        {isSearchInput && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400 dark:text-[var(--bp-text-subtle)]" aria-hidden="true">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>}
    </div>
  );
}

export default Input;
