import React from 'react';

function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-[var(--bp-text-muted)]">{text}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
