import React from 'react';

function Select({ label, error, className = '', id, children, ...props }) {
  const selectId = id || props.name;

  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="mb-2 block text-sm font-medium text-neutral-700 dark:text-[var(--bp-text-muted)]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`input-field ${error ? 'input-invalid' : ''} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>}
    </div>
  );
}

export default Select;
