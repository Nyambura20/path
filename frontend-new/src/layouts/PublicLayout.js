import React from 'react';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-100 animate-fade-in">
      {children}
    </div>
  );
}

export default PublicLayout;
