import React from 'react';

function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'input-invalid' : ''} ${className}`.trim()}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default Input;
