import React from 'react';

const variantClassMap = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
};

function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  const variantClass = variantClassMap[variant] || variantClassMap.primary;

  return (
    <button type={type} className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default Button;
