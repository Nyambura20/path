import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const SidebarContext = createContext();

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const toggleSidebar = () => {
    setIsPinned(prev => !prev);
    setIsOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setIsPinned(false);
  };

  const handleHoverEnter = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current);
    if (!isPinned) {
      setIsOpen(true);
    }
  }, [isPinned]);

  const handleHoverLeave = useCallback(() => {
    if (!isPinned) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  }, [isPinned]);

  const value = {
    isOpen,
    isPinned,
    toggleSidebar,
    closeSidebar,
    handleHoverEnter,
    handleHoverLeave,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}
